import React, { useState, useEffect, useRef, } from 'react';
import {
	Row,
} from 'native-base';
import {
	AUTO_SUBMIT_DELAY,
} from '../../../Constants/Input.js';
import Editor from 'ckeditor5-custom-build/build/ckeditor.js'; // built using https://ckeditor.com/ckeditor-5/online-builder/
import getComponentFromType from '../../../Functions/getComponentFromType.js';
import withValue from '../../Hoc/withValue.js';
import withTooltip from '../../Hoc/withTooltip.js';
import _ from 'lodash';

const
	HtmlEditorElement = (props) => {
		const {
				value,
				setValue,
				h = 150,
			} = props,
			CKEditor = getComponentFromType('CKEditor'),
			debouncedSetValueRef = useRef(),
			[editor, setEditor] = useState(null), // in case you need to adjust things procedurally
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
	HtmlEditorField = withValue(HtmlEditorElement);
	

export default HtmlEditorField;

// // Tooltip needs us to forwardRef
// export default withTooltip(React.forwardRef((props, ref) => {
// 	return <HtmlEditorField {...props} outerRef={ref} />;
// }));