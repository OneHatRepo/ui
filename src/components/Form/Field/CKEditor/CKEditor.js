import React, { useState, useEffect, useRef, } from 'react';
import {
	Row,
} from 'native-base';
import {
	AUTO_SUBMIT_DELAY,
} from '../../../../Constants/Input';
import Editor from 'ckeditor5-custom-build/build/ckeditor'; // built using https://ckeditor.com/ckeditor-5/online-builder/
import { CKEditor } from '@ckeditor/ckeditor5-react'; // https://ckeditor.com/docs/ckeditor5/latest/installation/frameworks/react.html
import withValue from '../../../Hoc/withValue';
import withTooltip from '../../../Hoc/withTooltip';
import './styles.css';

const
	CKEditorElement = (props) => {
		const {
				value,
				setValue,
				h = 150,
			} = props,
			debouncedSetValueRef = useRef(),
			[editor, setEditor] = useState(null),
			config = {
			};
		
		
		useEffect(() => {
			// Set up debounce fn
			// Have to do this because otherwise, lodash tries to create a debounced version of the fn from only this render
			debouncedSetValueRef.current = _.debounce(setValue, AUTO_SUBMIT_DELAY);
		}, [setValue]);

		return <Row h={h} flex={1} ref={props.outerRef} {...props}>
					<CKEditor
						editor={Editor}
						config={config}
						data={value}
						onReady={(editor) => {
							setEditor(editor);
						}}
						onChange={(event, editor) => {
							const value = editor.getData();
							debouncedSetValueRef.current(value);
						}}
						// onBlur={(event, editor) => {
						// 	console.log( 'Blur.', editor);
						// }}
						// onFocus={(event, editor) => {
						// 	console.log( 'Focus.', editor);
						// }}
					/>
				</Row>;
	},
	CKEditorField = withValue(CKEditorElement);
	

export default CKEditorField;

// // Tooltip needs us to forwardRef
// export default withTooltip(React.forwardRef((props, ref) => {
// 	return <CKEditorField {...props} outerRef={ref} />;
// }));