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
} from '../../../Constants/UiModes.js';
import UiGlobals from '../../../UiGlobals.js';
import {
	FILE_MODE_IMAGE,
	FILE_MODE_FILE,
} from '../../../Constants/File.js';
import { Dropzone, FileMosaic, FileCard, FileInputButton, } from "@files-ui/react";
import IconButton from '../../Buttons/IconButton.js';
import withValue from '../../Hoc/withValue.js';
import File from '../../Icons/File.js';
import Trash from '../../Icons/Trash.js';
import _ from 'lodash';

function FileElement(props) {

	if (CURRENT_MODE !== UI_MODE_WEB) {
		throw new Error('Not yet implemented except for web.');
	}

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
			tooltip = 'Choose or drag a file on top of this control.',
			tooltipPlacement = 'bottom',
		} = props,
		styles = UiGlobals.styles,
		dragRef = useRef(),
		fileInputRef = useRef(),
		[isDropping, setIsDropping] = useState(false),
		onSelect = () => {
			fileInputRef.current.click();
			
			setValue({
				dataUri: null,
				control: null,
				filename: null,
				version,
			});
		},
		setBase64 = (file, readerResult) => {
			const
				base64 = btoa(readerResult), // 'btoa' is deprecated in Node.js, but not browsers, so use it! // https://developer.mozilla.org/en-US/docs/Web/API/btoa
				dataUri = `data:${file.type};base64,${base64}`,
				control = '',
				filename = file.name;

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

	return null;
		
	return <div ref={dragRef} style={{ flex: 1, height: '100%', }} onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDragOver={onDragOver} onDrop={onDrop}>
				<Tooltip label={tooltip} placement={tooltipPlacement}>
					<Row flex={1} h={10} alignItems="center">
						{isDropping && <Box position="absolute" borderWidth={isDropping ? 2 : 0} borderColor="primary.800" top={0} left={0} w="100%" h="100%" bg="trueGray.200" zIndex={10000} justifyContent="center" alignItems="center">
											<Text>Set File</Text>
										</Box>}
						<IconButton
							icon={<Icon as={File} color={styles.FORM_FILE_ICON_COLOR} />}
							onPress={onSelect}
							h={10}
							w={10}
							bg={styles.FORM_FILE_ICON_BG}
							_hover={{
								bg: styles.FORM_FILE_ICON_BG_HOVER,
							}}
						/>
						<IconButton
							icon={<Icon as={Trash} color={styles.FORM_FILE_ICON_COLOR} />}
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
						{mode === FILE_MODE_FILE && <Text
														flex={1}
														ml={3}
														fontSize={styles.FORM_FILE_READOUT_FONTSIZE}
														fontStyle="italic"
														numberOfLines={1}
														ellipsizeMode="head"
														bg={styles.FORM_FILE_READOUT_BG}
													>{value.filename || 'No file'}</Text>}
						{mode === FILE_MODE_IMAGE && <Box
														flex={1}
														h="100%"
														ml={1}
														bg={styles.FORM_FILE_READOUT_BG}
														backgroundImage={value?.dataUri ? 'url(' + imagePath + encodeURIComponent(value.dataUri) + ')' : 'none'}
														backgroundSize="contain"
														backgroundRepeat="no-repeat"
														borderRadius={4}
														borderWidth={1}
													/>}
						<input type="file" ref={fileInputRef} name={name} onChange={onChangeFile} style={{ position: 'absolute', opacity: 0, height: 0, width: 0, }} />
					</Row>
				</Tooltip>
			</div>;
}

export default withValue(FileElement);
