import React, { useState, useEffect, useRef, } from 'react';
import {
	Box,
	HStack,
	Icon,
	Text,
	TextNative,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import {
	CURRENT_MODE,
	UI_MODE_WEB,
	UI_MODE_NATIVE,
} from '../../../Constants/UiModes.js';
import UiGlobals from '../../../UiGlobals.js';
import {
	FILE_MODE_IMAGE,
	FILE_MODE_FILE,
} from '../../../Constants/File.js';
import IconButton from '../../Buttons/IconButton.js';
import withComponent from '../../Hoc/withComponent.js';
import withValue from '../../Hoc/withValue.js';
import File from '../../Icons/File.js';
import Trash from '../../Icons/Trash.js';
import _ from 'lodash';

// NOTES: Since this arrangement of form and fields has only a single value per field, 
// but there are multiple fields used in file uploads, change things so that the single
// value is a JSON object, with the separate values encoded within.

// TODO:
// √ Combine values into single JSON value
// Build interpreter so the field can work with existing value
// Build back-end to receive this
// Build thumbnail viewer for existing image
// Build editor, with large viewer for existing image / video / pdf
// 

function FileElement(props) {

	throw new Error('Deprecated. Use platform-specific File component instead.');

	const {
			name,
			value = {
				dataUri: null,
				control: null,
				filename: null,
			},
			setValue,

			mode = FILE_MODE_IMAGE, // FILE_MODE_IMAGE, FILE_MODE_FILE
			imagePath = '',
			version = 2,
			tooltip = 'Choose or drag a file on top of this control.',
			tooltipPlacement = 'bottom',
		} = props,
		styles = UiGlobals.styles,
		dragRef = useRef(),
		fileInputRef = useRef(),
		[isDropping, setIsDropping] = useState(false),
		[localDataUri, setLocalDataUri] = useState(null),
		[localControl, setLocalControl] = useState(null),
		[localFilename, setLocalFilename] = useState(null),
		onClear = () => {
			setLocalDataUri(null);
			setLocalControl(null);
			setLocalFilename(null);

			setValue({
				dataUri: null,
				control: null,
				filename: null,
				version,
			});

			fileInputRef.current.value = null;
		},
		onSelect = () => {
			fileInputRef.current.click();
			
			setValue({
				dataUri: null,
				control: null,
				filename: null,
				version,
			});
		},
		onChangeFile = (e) => {
			const
				files = fileInputRef.current.files,
				file = files[0],
				reader = new FileReader();

			reader.readAsBinaryString(file);
			reader.onload = (e) => {
				setBase64(file, e.target.result);
			};
		},
		setBase64 = (file, readerResult) => {
			const
				base64 = btoa(readerResult), // 'btoa' is deprecated in Node.js, but not browsers, so use it!
				dataUri = `data:${file.type};base64,${base64}`,
				control = '',
				filename = file.name;

			setLocalDataUri(dataUri);
			setLocalControl(control);
			setLocalFilename(filename);

			setValue({
				dataUri,
				control,
				filename,
				version,
			});
		},
		onDragEnter = (e) => {
			const
				fileTypes = e.dataTransfer && e.dataTransfer.types,
				items = e.dataTransfer && e.dataTransfer.items;

			if (fileTypes.indexOf('Files') === -1) {
				return;
			}
			if (items && items.length > 1) {
				throw new Error('You can only drop a single file!');
			}

			setIsDropping(true);
		},
		onDragLeave = (e) => {
			if (dragRef.current.contains(e.relatedTarget)) {
				return; // ignore events that bubble from within
			}
			setIsDropping(false);
		},
		onDragOver = (e) => {
			e.preventDefault();
		},
		onDrop = (e) => {
			e.preventDefault();
			const
				files = e.dataTransfer && e.dataTransfer.files,
				file = files[0],
				reader = new FileReader();

			reader.readAsDataURL(file);
			reader.onload = (e) => {
				setBase64(file, e.target.result);
			};
			setIsDropping(false);
		};

	// useEffect(() => {
	// 	const {
	// 			dataUri,
	// 			control,
	// 			filename,
	// 		} = value;
	// 	setLocalDataUri(dataUri);
	// 	setLocalControl(control);
	// 	setLocalFilename(filename);
	// }, []);

	if (CURRENT_MODE === UI_MODE_NATIVE) {
		throw new Error('Not yet implemented for RN.');
	}
		
	return <div
				ref={dragRef}
				style={{ flex: 1, height: '100%', }}
				onDragEnter={onDragEnter}
				onDragLeave={onDragLeave}
				onDragOver={onDragOver}
				onDrop={onDrop}
			>
				{/*<Tooltip label={tooltip} placement={tooltipPlacement}>*/}
					<HStack className="flex-1 h-[10px] items-center">
						{isDropping && <Box
							className={` ${isDropping ? "border-[2px]" : "border-[0px]"} absolute border-primary-800 top-0 left-0 w-full h-full bg-grey-200 z-10000 justify-center items-center `}>
											<Text>Set File</Text>
										</Box>}
						<IconButton
							icon={<Icon as={File} className={` ${styles.FORM_FILE_ICON_COLOR} `} />}
							onPress={onSelect}
							h={10}
							w={10}
							bg={styles.FORM_FILE_ICON_BG}
							_hover={{
								bg: styles.FORM_FILE_ICON_BG_HOVER,
							}}
						/>
						<IconButton
							icon={<Icon as={Trash} className={` ${styles.FORM_FILE_ICON_COLOR} `} />}
							onPress={onClear}
							h={10}
							w={10}
							ml={1}
							isDisabled={!value?.dataUri}
							bg={value?.dataUri ? styles.FORM_FILE_ICON_BG : 'disabled'}
							_hover={{
								bg: value?.dataUri ? styles.FORM_FILE_ICON_BG_HOVER : 'disabled',
							}}
						/>
						{mode === FILE_MODE_FILE && <TextNative
							numberOfLines={1}
							ellipsizeMode="head"
							className={` bg-${styles.FORM_FILE_READOUT_BG} ${styles.FORM_FILE_READOUT_FONTSIZE} flex-1 ml-2 italic-italic `}>{value.filename || 'No file'}</TextNative>}
						{mode === FILE_MODE_IMAGE && <Box
							className={` ${value?.dataUri ? 'url(' + imagePath + encodeURIComponent(value.dataUri) + ')' : "bg-none"} bg-${styles.FORM_FILE_READOUT_BG} flex-1 h-full ml-1 bg-contain bg-repeat-no-repeat rounded-[4px] border `} />}
						<input type="file" ref={fileInputRef} name={name} onChange={onChangeFile} style={{ position: 'absolute', opacity: 0, height: 0, width: 0, }} />
					</HStack>
				{/*</Tooltip>*/}
			</div>;
}

export default withComponent(withValue(FileElement));
