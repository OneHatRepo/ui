import { useEffect, } from 'react';
import {
	Button,
	Column,
	Row,
	Text,
} from 'native-base';
import {
	CURRENT_MODE,
	UI_MODE_WEB,
	UI_MODE_REACT_NATIVE,
} from '../../Constants/UiModes.js';
import UiGlobals from '../../UiGlobals.js';
// import {
// 	FileAmountLimitValidator,
// 	FileTypeValidator,
// 	FileSizeValidator,
// 	ImageDimensionsValidator,
// } from 'use-file-picker/validators';
import { useFilePicker, useImperativeFilePicker } from 'use-file-picker'; // https://www.npmjs.com/package/use-file-picker
import IconButton from '../../Components/Buttons/IconButton.js';
import Xmark from '../../Components/Icons/Xmark.js'
import withAlert from '../../Components/Hoc/withAlert.js';
import withValue from '../../Components/Hoc/withValue.js';
import Loading from '../../Components/Messages/Loading.js';
import _ from 'lodash';


// This component is used to present a single file upload button

function FileComponent(props) {

	if (CURRENT_MODE !== UI_MODE_WEB) {
		throw new Error('Not yet implemented except for web.');
	}

	const {
			readAs = 'BinaryString', // 'DataURL', 'Text', 'BinaryString', 'ArrayBuffer'
			accept, // ['.png', '.txt'], 'image/*', '.txt'
			multiple = false,
			readFilesContent = true, // Ignores files content and omits reading process if set to false
			validators, // [ new FileAmountLimitValidator({ max: 1 }), new FileTypeValidator(['jpg', 'png']), new FileSizeValidator({ maxFileSize: 50 * 1024 * 1024 /* 50 MB */ }), new ImageDimensionsValidator({maxHeight: 900,maxWidth: 1600,minHeight: 600,minWidth: 768,}),]
			onFilesSelected, // always called, even if there are errors
			onFilesRejected, // called when there were validation errors
			onFilesSuccessfullySelected, // called when there were no validation errors
			onFileRemoved, // called when a file is removed from the list of selected files
			onClear, // called when the selection is cleared

			// withValue
			value,
			setValue,
		} = props,
		styles = UiGlobals.styles,
		{
			openFilePicker,
			filesContent,
			loading,
			errors,
			plainFiles,
			clear,
		} = useFilePicker({
			readAs,
			accept,
			multiple,
			readFilesContent,
			validators,
			onFilesSelected,
			onFilesRejected,
			onFilesSuccessfullySelected: ({ filesContent, plainFiles }) => {
				setValue(filesContent[0].content);
			},
			onFileRemoved,
			onClear: () => setValue(null),
		});

	useEffect(() => {
		if (errors.length) {
			const
				errorStack = errors.map(err => err.name + ': ' + err.reason),
				msg = errorStack.join("\n");
			alert(msg);
		}
	}, [errors.length]);

	if (loading) {
		return <Loading />;
	}

	let assembledComponents = null;
	if (_.isEmpty(filesContent)) {
		assembledComponents = <Button onPress={() => openFilePicker()}>Select File</Button>;
	} else {
		assembledComponents = <Row
									px={3}
									py={1}
									alignItems="center"
									borderRadius={5}
									borderWidth={1}
									borderColor="primary.700"
								>
									<IconButton
										_icon={{
											as: Xmark,
											color: 'trueGray.600',
											size: 'sm',
										}}
										onPress={() => clear()}
										h="100%"
										bg={styles.FORM_COMBO_TRIGGER_BG}
										_hover={{
											bg: styles.FORM_COMBO_TRIGGER_HOVER_BG,
										}}
										mr={1}
									/>
									<Text>{plainFiles[0].name}</Text>
								</Row>;
	}

	return assembledComponents;
}

export default withAlert(withValue(FileComponent));
