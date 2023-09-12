import { useState, useEffect, } from 'react';
import {
	Box,
	Button,
	Column,
	Row,
} from 'native-base';
import {
	CURRENT_MODE,
	UI_MODE_WEB,
	UI_MODE_REACT_NATIVE,
} from '../../Constants/UiModes.js';
import UiGlobals from '../../UiGlobals.js';
import {
	FILE_MODE_IMAGE,
	FILE_MODE_FILE,
} from '../../Constants/File.js';
import { Avatar, Dropzone, FileMosaic, FileCard, FileInputButton, } from "@files-ui/react";
import withData from '../../Components/Hoc/withData.js';
import _ from 'lodash';

const
	EXPANDED_MAX = 100,
	COLLAPSED_MAX = 2;

// Note this component uploads only one file per server request---
// it doesn't upload multiple files simultaneously.

function AttachmentsElement(props) {

	if (CURRENT_MODE !== UI_MODE_WEB) {
		throw new Error('Not yet implemented except for web.');
	}

	const {
			canCrud = true,
			_dropZone = {},
			_fileMosaic = {},
			accept, // 'image/*'
			maxFiles = null,
			disabled = false,
			clickable = true,

			// parentContainer
			selectorSelected,

			// withData
			Repository,

		} = props,
		styles = UiGlobals.styles,
		model = selectorSelected?.repository?.name,
		modelid = selectorSelected?.id,
		[isReady, setIsReady] = useState(false),
		[isUploading, setIsUploading] = useState(false),
		[showAll, setShowAll] = useState(false),
		[files, setFiles] = useState([]),
		buildFiles = () => {
			const files = _.map(Repository.entities, (entity) => {
				return {
					id: entity.id, //	string | number	The identifier of the file
					// file: null, //	File	The file object obtained from client drop or selection
					name: entity.attachments__filename, // string	The name of the file
					type: entity.attachments__mimetype, // string	The file mime type.
					size: entity.attachments__size, //	number	The size of the file in bytes.
					// valid: null, //	boolean	If present, it will show a valid or rejected message ("valid", "denied"). By default valid is undefined.
					// errors: null, //	string[]	The list of errors according to the validation criteria or the result of the given custom validation function.
					// uploadStatus: null, //	UPLOADSTATUS	The current upload status. (e.g. "uploading").
					// uploadMessage: null, //	string	A message that shows the result of the upload process.
					imageUrl: entity.attachments__uri, //	string	A string representation or web url of the image that will be set to the "src" prop of an <img/> tag. If given, the component will use this image source instead of reading the image file.
					downloadUrl: entity.attachments__uri, //	string	The url to be used to perform a GET request in order to download the file. If defined, the download icon will be shown.
					// progress: null, //	number	The current percentage of upload progress. This value will have a higher priority over the upload progress value calculated inside the component.
					// extraUploadData: null, //	Record<string, any>	The additional data that will be sent to the server when files are uploaded individually
					// extraData: null, //	Object	Any kind of extra data that could be needed.
					// serverResponse: null, //	ServerResponse	The upload response from server.
					// xhr: null, //	XMLHttpRequest	A reference to the XHR object that allows the upload, progress and abort events.
				};
			});
			setFiles(files);
		},
		toggleShowAll = () => {
			setShowAll(!showAll);
		},
		onDropzoneChange = (files) => {
			setFiles(files);
			_.each(files, (file) => {
				file.extraUploadData = {
					model,
					modelid,
				};
			});
		},
		onUploadStart = (files) => {
			setIsUploading(true);
		},
		onUploadFinish = (files) => {
			let isDoneUploading = true;

			_.each(files, (file) => {
				if (!file.xhr || file.xhr.status !== 200) {
					isDoneUploading = false;
					return false; // break
				}
			});

			if (isDoneUploading) {
				setIsUploading(false);
				Repository.reload();
			}
		},
		onFileDelete = (id) => {
			Repository.deleteById(id);
		};

	useEffect(() => {

		if (!model) {
			return () => {};
		}

		(async () => {

			// Load Repository
			const filters = [
				{
					name: 'model',
					value: model,
				},
				{
					name: 'modelid',
					value: modelid,
				},
			];
			if (accept) {
				let name,
					mimetypes;
				if (_.isString(accept)) {
					name = 'mimetype LIKE';
					mimetypes = accept.replace('*', '%');
				} else if (_.isArray(accept)) {
					name = 'mimetype IN';
					mimetypes = accept;
				}
				filters.push({
					name,
					value: mimetypes,
				});
			}
			Repository.filter(filters);
			Repository.setPageSize(showAll ? EXPANDED_MAX : COLLAPSED_MAX);
			await Repository.load();

			buildFiles();

			if (!isReady) {
				setIsReady(true);
			}
			
		})();

		Repository.on('load', buildFiles);
		return () => {
			Repository.off('load', buildFiles);
		};
	}, [model, modelid, showAll]);

	if (!isReady) {
		return null;
	}
	

	if (canCrud) {
		_fileMosaic.onDelete = onFileDelete;
	}
	let content = <Column
						w="100%"
						// minHeight={50}
						p={2}
						background={styles.ATTACHMENTS_BG}
					>
						<Row flexWrap="wrap">
							{files.map((file) => {
								return <Box
											key={file.id}
											marginRight={4}
										>
											<FileMosaic
												{...file}
												backgroundBlurImage={false}
												{..._fileMosaic}
											/>
										</Box>;
							})}
						</Row>
						{Repository.total <= COLLAPSED_MAX ? null :
							<Button
								onPress={toggleShowAll}
								marginTop={4}
								_text={{
									color: 'trueGray.600',
									fontStyle: 'italic',
									textAlign: 'left',
									width: '100%',
								}}
								variant="ghost"
							>{'Show ' + (showAll ? ' Less' : ' All ' + Repository.total)}</Button>}
					</Column>;
	
	if (canCrud) {
		content = <Dropzone
						value={files}
						onChange={onDropzoneChange}
						accept={accept}
						maxFiles={maxFiles}
						maxFileSize={styles.ATTACHMENTS_MAX_FILESIZE}
						autoClean={true}
						uploadConfig={{
							url: Repository.api.baseURL + Repository.name + '/uploadAttachment',
							method: 'POST',
							headers: Repository.headers,
							autoUpload: true,
						}}
						headerConfig={{
							deleteFiles: false,
						}}
						onUploadStart={onUploadStart}
						onUploadFinish={onUploadFinish}
						background={styles.ATTACHMENTS_BG}
						color={styles.ATTACHMENTS_COLOR}
						minHeight={150}
						footer={false}
						clickable={clickable}
						{..._dropZone}
					>
						{content}
					</Dropzone>;

	}
	return content;
}

function withAdditionalProps(WrappedComponent) {
	return (props) => {
		return <WrappedComponent
					model="Attachments"
					uniqueRepository={true}
					{...props}
				/>;
	};
}

export default withAdditionalProps(withData(AttachmentsElement));
