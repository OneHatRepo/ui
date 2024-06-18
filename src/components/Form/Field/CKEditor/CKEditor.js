import React, { useState, useEffect, useRef, } from 'react';
import {
	Row,
} from 'native-base';
import UiGlobals from '../../../../UiGlobals.js';
import { CKEditor } from '@ckeditor/ckeditor5-react'; // https://ckeditor.com/docs/ckeditor5/latest/installation/frameworks/react.html
import './ckeditor.css';
import Editor from '../../../../../ckeditor5/build/ckeditor.js'; // built using https://ckeditor.com/ckeditor-5/online-builder/
import withComponent from '../../../Hoc/withComponent.js';
import withValue from '../../../Hoc/withValue.js';
import withTooltip from '../../../Hoc/withTooltip.js';
import _ from 'lodash';


const
	CKEditorElement = (props) => {
		const {
				value,
				setValue,
				autoSubmitDelay = UiGlobals.autoSubmitDelay,
				h = 150,
			} = props,
			debouncedSetValueRef = useRef(),
			[editor, setEditor] = useState(null), // in case you need to adjust things procedurally
			config = {
			};
		
		
		useEffect(() => {
			// Set up debounce fn
			// Have to do this because otherwise, lodash tries to create a debounced version of the fn from only this render
			debouncedSetValueRef.current?.cancel(); // Cancel any previous debounced fn
			debouncedSetValueRef.current = _.debounce(setValue, autoSubmitDelay);
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
					/>
				</Row>;
	},
	CKEditorField = withComponent(withValue(CKEditorElement));
	

export default CKEditorField;

// // Tooltip needs us to forwardRef
// export default withTooltip(React.forwardRef((props, ref) => {
// 	return <CKEditorField {...props} outerRef={ref} />;
// }));