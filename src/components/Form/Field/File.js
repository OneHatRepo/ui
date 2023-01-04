import React, { useState, useEffect, useRef, } from 'react';
import {
	Box,
	Icon,
	Row,
	Text,
} from 'native-base';
import {
	STYLE_FILE_READOUT_FONTSIZE,
} from '../../../constants/Style';
import {
	FILE_MODE_IMAGE,
	FILE_MODE_FILE,
} from '../../../constants/File';
import IconButton from '../../Buttons/IconButton';
import withTooltip from '../../Hoc/withTooltip';
import withValue from '../../Hoc/withValue';
import File from '../../Icons/File';
import Plus from '../../Icons/Plus';
import Trash from '../../Icons/Trash';
import _ from 'lodash';

// NOTES: Since this arrangement of form and fields has only a single value per field, 
// but there are multiple fields used in file uploads, change things so that the single
// value is a JSON object, with the separate values encoded within.

// TODO:
// Combine values into single JSON value
// Build interpreter so the field can work with existing value
// Build back-end to receive this
// Build thumbnail viewer for existing image
// Build editor, with large viewer for existing image / video / pdf
// 

const
	FileElement = (props) => {
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
			} = props,
			fileEl = useRef(),
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
				});
			},
			onSelect = () => {
				fileEl.current.click();
				
				setValue({
					dataUri: null,
					control: null,
					filename: null,
				});
			},
			onChangeFile = (e) => {
				const
					files = fileEl.current.files,
					file = files[0],
					reader = new FileReader();

				reader.readAsBinaryString(file);
				reader.onload = (e) => {
					const
						dataUri = `data:${file.type};base64,${btoa(e.target.result)}`, // 'btoa' is deprecated in Node.js, but not browsers, so use it!
						control = '',
						filename = file.name;
					
					setLocalDataUri(dataUri);
					setLocalControl(control);
					setLocalFilename(filename);

					setValue({
						dataUri,
						control,
						filename,
					});
				};
			};
			// handleDragenter = (e) => {
			// 	const
			// 		fileTypes = e.dataTransfer && e.dataTransfer.types,
			// 		items = e.dataTransfer && e.dataTransfer.items;

			// 	if (fileTypes.indexOf('Files') === -1) {
			// 		return;
			// 	}
			// 	if (items && items.length > 1) {
			// 		throw new Error('You can only drop a single file!');
			// 		return;
			// 	}

			// 	this.addCls('drag-over');
			// },
			// handleDragleave = (e) => {
			// 	this.removeCls('drag-over');
			// },
			// handleDrop = (e) => {
			// 	var items = e.dataTransfer && e.dataTransfer.items,
			// 		files = e.dataTransfer && e.dataTransfer.files;

			// 	this.removeCls('drag-over');

			// 	this.controlEl.setValue('');
			// 	this.droppedNameEl.setValue(files[0].name);
			// 	fileReader.readAsDataURL(files[0]); // calls the onload event, below
			// },
			// handleDropRead = (e) => {
			// 	const base64 = e.target.result;
			// 	this.droppedEl.setValue(base64);
			// },
			// handleSetValue = (value) => {
			// 	this.controlEl.setValue(value);
			// 	this.droppedEl.setValue('');
			// 	this.droppedNameEl.setValue('');
			// },
			// handleClearButton = () => {
			// 	this.fileEl.setValue('');
			// },
			// handleSelect = () => {
			// 	this.controlEl.setValue('');
			// 	this.droppedEl.setValue('');
			// 	this.droppedNameEl.setValue('');
			// },
			// handleShow = () => {
			// 	this.show();
			// },
			// handleHide = () => {
			// 	this.hide();
			// };

		// useEffect(() => {
		// 	const fileReader = new FileReader();
		// 	// fileReader.onload = (e) => {
		// 	// 	handleDropRead(e);
		// 	// };
		// 	setFileReader(fileReader);
		// }, []);
		
		return <Row flex={1} alignItems="center">
					<IconButton
						icon={<Icon as={File} />}
						onPress={onSelect}
						h={10}
						w={10}
						bg="primary.200"
						_hover={{
							bg: 'primary.400',
						}}
					/>
					<IconButton
						icon={<Icon as={Trash} />}
						onPress={onClear}
						h={10}
						w={10}
						ml={1}
						isDisabled={!value.dataUri}
						bg={value.dataUri ? 'primary.200' : 'disabled'}
						_hover={{
							bg: 'primary.400',
						}}
					/>
					{mode === FILE_MODE_FILE && <Text
													flex={1}
													ml={3}
													fontSize={STYLE_FILE_READOUT_FONTSIZE}
													fontStyle="italic"
												>{value.filename || 'No file'}</Text>}
					{mode === FILE_MODE_IMAGE && <Box
													flex={1}
													h="100%"
													ml={1}
													bg="trueGray.100"
													backgroundImage={value.dataUri ? 'url(' + imagePath + encodeURIComponent(value.dataUri) + ')' : 'none'}
													backgroundSize="contain"
													backgroundRepeat="no-repeat"
													borderRadius={4}
												/>}
					
					{/* <Input
						type="file"
						ref={props.tooltipRef}
						onChangeText={props.setValue}
						flex={1}
						fontSize={STYLE_FILE_INPUT_FONTSIZE}
						{...props}
					/> */}
					<input type="file" ref={fileEl} name={name} onChange={onChangeFile} style={{ position: 'absolute', opacity: 0, height: 0, width: 0, }} />
				</Row>;
		
	},
	FileField = withValue(FileElement);

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <FileField {...props} tooltipRef={ref} />;
}));