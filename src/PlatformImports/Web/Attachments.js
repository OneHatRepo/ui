import React, { useState, useEffect, useRef, } from 'react';
import {
	Box,
	Icon,
	Row,
	Text,
	Tooltip,
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

function AttachmentsElement(props) {

	if (CURRENT_MODE !== UI_MODE_WEB) {
		throw new Error('Not yet implemented except for web.');
	}

	const {
			canCrud = true,
			_dropZone = {},
			_fileMosaic = {},
			accept = '*', // 'image/*'
			maxFiles = null,
			maxFileSize = 28 * 1024,
			disabled = false,
			clickable = true,
			isImageOnly = false,

			// withData
			Repository,

		} = props,
		styles = UiGlobals.styles,
		WhichFile = isImageOnly ? Avatar : FileMosaic,
		files = _.map(Repository.entities, () => {
			// const ExtFile = {
			// 	id	string | number	The identifier of the file
			// 	file	File	The file object obtained from client drop or selection
			// 	name	string	The name of the file
			// 	type	string	The file mime type.
			// 	size	number	The size of the file in bytes.
			// 	valid	boolean	If present, it will show a valid or rejected message ("valid", "denied"). By default valid is undefined.
			// 	errors	string[]	The list of errors according to the validation criteria or the result of the given custom validation function.
			// 	uploadStatus	UPLOADSTATUS	The current upload status. (e.g. "uploading").
			// 	uploadMessage	string	A message that shows the result of the upload process.
			// 	imageUrl	string	A string representation or web url of the image that will be set to the "src" prop of an <img/> tag. If given, the component will use this image source instead of reading the image file.
			// 	downloadUrl	string	The url to be used to perform a GET request in order to download the file. If defined, the download icon will be shown.
			// 	progress	number	The current percentage of upload progress. This value will have a higher priority over the upload progress value calculated inside the component.
			// 	extraUploadData	Record<string, any>	The additional data that will be sent to the server when files are uploaded individually
			// 	extraData	Object	Any kind of extra data that could be needed.
			// 	serverResponse	ServerResponse	The upload response from server.
			// 	xhr	XMLHttpRequest	A reference to the XHR object that allows the upload, progress and abort events.
			// };

			debugger;

		}),
		onDelete = (a,b,c,d,e) => {

			debugger;
		};

	if (canCrud) {
		return <Dropzone
					value={files}
					onChange={updateFiles}
					accept={accept}
					maxFiles={maxFiles}
					maxFileSize={maxFileSize}
					validator={() => {}}
					autoClean={true}
					uploadConfig={{
						url: Repository.api.baseURL + Repository.name + '/uploadAttachments',
						method: 'POST',
						headers: Repository.headers,
						autoUpload: true,
					}}
				    onUploadFinish={handleFinishUpload}
					background={styles.ATTACHMENTS_BG}
					color={styles.ATTACHMENTS_COLOR}
					minHeight={150}
					clickable={clickable}
					{..._dropZone}
				>
					{files.map((file) => {
						return <WhichFile
									key={file.id}
									{...file}
									backgroundBlurImage={false}
									onDelete={onDelete}
									info
									{..._fileMosaic}
								/>;
					})}
				</Dropzone>;

	}
		
	return <Row
				flex={1}
				minHeight={150}
				background={styles.ATTACHMENTS_BG}
				color={styles.ATTACHMENTS_COLOR}
			>
				{files.map((file) => {
					return <WhichFile
								key={file.id}
								{...file}
								onDelete={removeFile}
								info
								{..._fileMosaic}
							/>;
				})}
			</Row>;
}

function withAdditionalProps(WrappedComponent) {
	return (props) => {
		return <WrappedComponent
					model="Attachments"
					{...props}
				/>;
	};
}

export default withAdditionalProps(withData(AttachmentsElement));
