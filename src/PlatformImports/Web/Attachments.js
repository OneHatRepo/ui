import { useState, useEffect, useRef, } from 'react';
import {
	Box,
	HStack,
	Pressable,
	Spinner,
	Text,
	VStack,
} from '@project-components/Gluestack';
import Button from '../../Components/Buttons/Button';
import {
	CURRENT_MODE,
	UI_MODE_WEB,
	UI_MODE_NATIVE,
} from '../../Constants/UiModes.js';
import UiGlobals from '../../UiGlobals.js';
import {
	FILE_MODE_IMAGE,
	FILE_MODE_FILE,
} from '../../Constants/File.js';
import { Avatar, Dropzone, FileMosaic, FileCard, FileInputButton, } from "@files-ui/react";
import inArray from '../../Functions/inArray.js';
import IconButton from '../../Components/Buttons/IconButton.js';
import Xmark from '../../Components/Icons/Xmark.js';
import Eye from '../../Components/Icons/Eye.js';
import ChevronLeft from '../../Components/Icons/ChevronLeft.js';
import ChevronRight from '../../Components/Icons/ChevronRight.js';
import withAlert from '../../Components/Hoc/withAlert.js';
import withComponent from '../../Components/Hoc/withComponent.js';
import withData from '../../Components/Hoc/withData.js';
import CenterBox from '../../Components/Layout/CenterBox.js';
import downloadInBackground from '../../Functions/downloadInBackground.js';
import downloadWithFetch from '../../Functions/downloadWithFetch.js';
import useForceUpdate from '../../Hooks/useForceUpdate.js';
import _ from 'lodash';

const
	EXPANDED_MAX = 100,
	COLLAPSED_MAX = 4,
	isPwa = !!window?.navigator?.standalone;

function FileCardCustom(props) {
	const {
			id,
			name: filename,
			type: mimetype,
			onDelete,
			onSee,
			downloadUrl,
			uploadStatus,
		} = props,
		isDownloading = uploadStatus && inArray(uploadStatus, ['preparing', 'uploading', 'success']),
		isPdf = mimetype === 'application/pdf';

	return <Pressable
				onPress={() => {
					downloadInBackground(downloadUrl);
				}}
				className="px-3 py-1 items-center flex-row rounded-[5px] border border-primary.700"
			>
				{isDownloading && <Spinner className="mr-2" />}
				{onSee && isPdf && <IconButton mr={1} icon={Eye} onPress={() => onSee(null, id)} />}
				<Text>{filename}</Text>
				{onDelete && <IconButton ml={1} icon={Xmark} onPress={() => onDelete(id)} />}
			</Pressable>;
}


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
			useFileMosaic = true,
			accept, // 'image/*'
			maxFiles = null,
			disabled = false,
			clickable = true,
			confirmBeforeDelete = false,
			extraUploadData = {},
			expandedMax = EXPANDED_MAX,
			collapsedMax = COLLAPSED_MAX,
			autoUpload = true,
			onAfterDropzoneChange, // fn, should return true if it mutated the files array
			onUpload,
			onDelete,

			// withComponent
			self,

			// parentContainer
			selectorSelected,
			selectorSelectedField = 'id',

			// withData
			Repository,

			// withAlert
			showModal,
			updateModalBody,
			alert,
			confirm,

		} = props,
		styles = UiGlobals.styles,
		model = _.isArray(selectorSelected) && selectorSelected[0] ? selectorSelected[0].repository?.name : selectorSelected?.repository?.name,
		modelidCalc = _.isArray(selectorSelected) ? _.map(selectorSelected, (entity) => entity[selectorSelectedField]) : selectorSelected?.[selectorSelectedField],
		modelid = useRef(modelidCalc),
		forceUpdate = useForceUpdate(),
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
		clearFiles = () => {
			setFiles([]);
		},
		toggleShowAll = () => {
			setShowAll(!showAll);
		},
		onDropzoneChange = async (files) => {
			if (!files.length) {
				alert('No files accepted. Perhaps they were too large or the wrong file type?');
				return;
			}
			setFiles(files);
			_.each(files, (file) => {
				file.extraUploadData = {
					model,
					modelid: modelid.current,
					...extraUploadData,
				};
			});
			if (onAfterDropzoneChange) {
				const isChanged = await onAfterDropzoneChange(files);
				if (isChanged) {
					forceUpdate();
				}
			}
		},
		onUploadStart = (files) => {
			setIsUploading(true);
		},
		onUploadFinish = (files) => {
			let isDoneUploading = true,
				isError = false;

			_.each(files, (file) => {
				if (!file.xhr || file.xhr.status !== 200) {
					isDoneUploading = false;
					return false; // break
				}
			});

			if (isDoneUploading) {
				_.each(files, (file) => {
					if (file.uploadStatus === 'error') {
						isError = true;
						const msg = file.serverResponse?.payload || 'An error occurred';
						alert(msg);
						return false;
					}
				});
				if (!isError) {
					setIsUploading(false);
					Repository.reload();
					if (onUpload) {
						onUpload(files);
					}
				}
			}
		},
		onFileDelete = (id) => {
			const file = _.find(files, { id });
			if (confirmBeforeDelete) {
				confirm('Are you sure you want to delete the file "' + file.name + '"?', () => doDelete(id));
			} else {
				doDelete(id);
			}
		},
		onDownload = (id, url) => {
			if (isPwa) {
				// This doesn't work because iOS doesn't allow you to open another window within a PWA.
				// downloadWithFetch(url);
				
				alert('Files cannot be downloaded and viewed within an iOS PWA. Please use the Safari browser instead.');
			} else {
				downloadInBackground(url);
			}
		},
		buildModalBody = (url, id) => {
			// This method was abstracted out so showModal/onPrev/onNext can all use it.
			// url comes from FileMosaic, which passes in imageUrl,
			// whereas FileCardCustom passes in id.

			function findFile(url, id) {
				if (id) {
					return _.find(files, { id });
				}
				return _.find(files, (file) => file.imageUrl === url);
			}
			function findPrevFile(url, id) {
				const
					currentFile = findFile(url, id),
					currentIx = _.findIndex(files, currentFile);
				if (currentIx > 0) {
					return files[currentIx - 1];
				}
				return null;
			}
			function findNextFile(url, id) {
				const
					currentFile = findFile(url, id),
					currentIx = _.findIndex(files, currentFile);
				if (currentIx < files.length - 1) {
					return files[currentIx + 1];
				}
				return null;
			}

			const
				prevFile = findPrevFile(url, id),
				isPrevDisabled = !prevFile,
				nextFile = findNextFile(url, id),
				isNextDisabled = !nextFile,
				onPrev = () => {
					const { imageUrl, id } = prevFile;
					updateModalBody(buildModalBody(imageUrl, id));
				},
				onNext = () => {
					const { imageUrl, id } = nextFile;
					updateModalBody(buildModalBody(imageUrl, id));
				};

			let isPdf = false,
				body = null;

			if (id) {
				const file = _.find(files, { id });
				url = file.imageUrl;
				isPdf = true;
			} else if (url?.match(/\.pdf$/)) {
				isPdf = true;
			}

			if (isPdf) {
				body = <iframe
							src={url}
							className="w-full h-full"
						/>;
			} else {
				body = <CenterBox className="w-full h-full">
							<img src={url} />
						</CenterBox>;
			}
			return <HStack
						className="w-full h-full"
					>
						<IconButton
							onPress={onPrev}
							className="Lightbox-prevBtn h-full w-[50px]"
							icon={ChevronLeft}
							isDisabled={isPrevDisabled}
						/>
						{body}
						<IconButton
							onPress={onNext}
							className="Lightbox-prevBtn h-full w-[50px]"
							icon={ChevronRight}
							isDisabled={isNextDisabled}
						/>
					</HStack>;
		},
		onViewLightbox = (url, id) => {
			if (!url && !id) {
				alert('Cannot view lightbox until image is uploaded.');
				return;
			}
			showModal({
				title: 'Lightbox',
				body: buildModalBody(url, id),
				canClose: true,
				includeCancel: true,
				w: 1920,
				h: 1080,
			});
		},
		doDelete = (id) => {
			const file = Repository.getById(id);
			if (file) {
				// if the file exists in the repository, delete it there
				Repository.deleteById(id);
				Repository.save();

			} else {
				// simply remove it from the files array
				const newFiles = [];
				_.each(files, (file) => {
					if (file.id !== id) {
						newFiles.push(file);
					}
				});
				setFiles(newFiles);
			}
			if (onDelete) {
				onDelete(id);
			}
		};

	if (!_.isEqual(modelidCalc, modelid.current)) {
		modelid.current = modelidCalc;
	}

	useEffect(() => {

		if (!model) {
			return () => {};
		}

		(async () => {

			if (!_.isArray(modelid.current)) {

				// Load Repository
				const filters = [
					{
						name: 'model',
						value: model,
					},
					{
						name: 'modelid',
						value: modelid.current,
					},
				];
				if (accept) {
					let name,
						mimetypes;
					if (_.isString(accept)) {
						if (accept.match(/,/)) {
							name = 'mimetype IN';
							mimetypes = accept.split(',');
						} else {
							name = 'mimetype LIKE';
							mimetypes = accept.replace('*', '%');
						}
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
				Repository.setPageSize(showAll ? expandedMax : collapsedMax);
				await Repository.load();

				buildFiles();
			} else {
				clearFiles();
			}


			if (!isReady) {
				setIsReady(true);
			}
			
		})();

		Repository.on('load', buildFiles);
		return () => {
			Repository.off('load', buildFiles);
		};
	}, [model, modelid.current, showAll]);

	if (!isReady) {
		return null;
	}

	if (self) {
		self.files = files;
	}

	if (canCrud) {
		_fileMosaic.onDelete = onFileDelete;
	}
	let className = `
		AttachmentsElement
		w-full
		h-full
		p-1
		rounded-[5px]
	`;
	if (props.className) {
		className += ' ' + props.className;
	}
	let content = <VStack className={className}>
						<HStack className="AttachmentsElement-HStack flex-wrap">
							{files.length === 0 && <Text className="text-grey-600 italic">No files</Text>}
							{files.map((file) => {
								let seeProps = {};
								if (file.type && (file.type.match(/^image\//) || file.type === 'application/pdf')) {
									seeProps = {
										onSee: onViewLightbox,
									};
								}
								return <Box
											key={file.id}
											className="mr-2"
										>
											{useFileMosaic &&
												<FileMosaic
													{...file}
													backgroundBlurImage={false}
													onDownload={onDownload}
													{..._fileMosaic}
													{...seeProps}
												/>}
											{!useFileMosaic &&
												<FileCardCustom
													{...file}
													backgroundBlurImage={false}
													{..._fileMosaic}
													{...seeProps}
												/>}
										</Box>;
							})}
						</HStack>
						{Repository.total <= collapsedMax ? null :
							<Button
								onPress={toggleShowAll}
								className="AttachmentsElement-toggleShowAll mt-2"
								text={'Show ' + (showAll ? ' Less' : ' All ' + Repository.total)}
								_text={{
									className: `
										text-grey-600
										italic
										text-left
										w-full
									`,
								}}
								variant="outline"
							/>}
					</VStack>;
	
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
							autoUpload,
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

export default withComponent(withAdditionalProps(withAlert(withData(AttachmentsElement))));
