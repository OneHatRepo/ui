import { useEffect, } from 'react';
import {
	HStack,
	Text,
} from '@onehat-gluestack';
import {
	CURRENT_MODE,
	UI_MODE_WEB,
	UI_MODE_NATIVE,
} from '../../Constants/UiModes.js';
import UiGlobals from '../../UiGlobals.js';
// import {
// 	FileAmountLimitValidator,
// 	FileTypeValidator,
// 	FileSizeValidator,
// 	ImageDimensionsValidator,
// } from 'use-file-picker/validators';
import { useFilePicker } from 'use-file-picker/dist'; // https://github.com/Jaaneek/useFilePicker/issues/81#issuecomment-1774044241
// import { useFilePicker } from 'use-file-picker'; // https://www.npmjs.com/package/use-file-picker
import Button from '../../Components/Buttons/Button.js';
import IconButton from '../../Components/Buttons/IconButton.js';
import Xmark from '../../Components/Icons/Xmark.js'
import withAlert from '../../Components/Hoc/withAlert.js';
import withValue from '../../Components/Hoc/withValue.js';
import Loading from '../../Components/Messages/Loading.js';
import testProps from '../../Functions/testProps.js';
import _ from 'lodash';


// This component is used to present a single file upload button

function FileComponent(props) {

	if (CURRENT_MODE !== UI_MODE_WEB) {
		throw new Error('Not yet implemented except for web.');
	}

	const {
			encodeAsBase64 = true,
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
			testID,

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
				let value = filesContent[0].content;
				if (readAs === 'BinaryString' && encodeAsBase64) {
					value = btoa(value); // convert to base64 encoded string
				}
				setValue(value);
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

	useEffect(() => {
		if (!value && filesContent.length) {
			clear();
		}
	}, [value, filesContent.length]);

	if (loading) {
		return <Loading {...(testID ? testProps(testID) : {})} />;
	}

	let assembledComponents = null;
	if (_.isEmpty(filesContent)) {
		assembledComponents = 
			<HStack
				{...(testID ? testProps(testID) : {})}
				data-file-value=""
				data-file-name=""
			>
				<input
					{...testProps('input')}
					type="text"
					value={_.isNil(value) ? '' : String(value)}
					onChange={(e) => {
						const nextValue = e.target.value;
						setValue(nextValue === '' ? null : nextValue);
					}}
					style={{
						position: 'absolute',
						left: '-9999px',
						opacity: 0,
						height: 1,
						width: 1,
					}}
				/>
				<Button
					{...testProps('selectFileBtn')}
					onPress={() => openFilePicker()}
					text="Select File"
				/>
			</HStack>;
	} else {
		assembledComponents = 
			<HStack
				{...(testID ? testProps(testID) : {})}
				data-file-value={_.isNil(value) ? '' : String(value)}
				data-file-name={plainFiles[0]?.name || ''}
				className={`
					px-3
					py-1
					items-center
					rounded-[5px]
					border
					border-primary.700
				`}
			>
				<input
					{...testProps('input')}
					type="text"
					value={_.isNil(value) ? '' : String(value)}
					onChange={(e) => {
						const nextValue = e.target.value;
						setValue(nextValue === '' ? null : nextValue);
					}}
					style={{
						position: 'absolute',
						left: '-9999px',
						opacity: 0,
						height: 1,
						width: 1,
					}}
				/>
				<IconButton
					{...testProps('xBtn')}
					icon={Xmark}
					_icon={{
						size: 'sm',
						className: 'text-grey-600',
					}}
					onPress={() => clear()}
					className={`
						h-full
						mr-1
						${styles.FORM_COMBO_TRIGGER_CLASSNAME}
					`}
				/>
				<Text>{plainFiles[0].name}</Text>
			</HStack>;
	}

	return assembledComponents;
}

export default withAlert(withValue(FileComponent));
