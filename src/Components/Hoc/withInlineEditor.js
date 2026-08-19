import { forwardRef, useState, } from 'react';
import {
	EDITOR_TYPE__INLINE,
} from '../../Constants/Editor.js';
import { withInjectedHocProps } from '../../Functions/internalHocProps.js';
import InlineEditor from '../Editor/InlineEditor.js';
import withEditor from './withEditor.js';
import _ from 'lodash';



function withAdditionalProps(WrappedComponent) {
	return forwardRef((props, ref) => {
		// provide the editorType to withEditor
		return <WrappedComponent
					{...withInjectedHocProps(props, {
						editorType: EDITOR_TYPE__INLINE,
					})}
					ref={ref}
				/>;
	});
}

// NOTE: Effectivtly, the HOC composition is:
// withAdditionalProps(withEditor(withInlineEditor))

export default function withInlineEditor(WrappedComponent, skipWrappers = false) {
	const Editor = forwardRef((props, ref) => {
		const {
				isEditorShown = false,
				setIsEditorShown,
				_editor = {},

				// withComponent
				self,

				// pull these out, as we don't want them going to the Editor
				selectorId,
				selectorSelected,
				selectorSelectedField,
				h,

				...propsToPass
			} = props,
			[localColumnsConfig, setLocalColumnsConfig] = useState([]),
			onChangeColumnsConfig = (columnsConfig) => {
				setLocalColumnsConfig(columnsConfig);
			};

		return <WrappedComponent
					{...withInjectedHocProps(props, {
						onChangeColumnsConfig,
						isInlineEditorShown: isEditorShown,
						inlineEditor: <InlineEditor
										{...propsToPass}
										{..._editor}
										parent={self}
										reference="editor"
										columnsConfig={localColumnsConfig}
										isEditorShown={isEditorShown}
										setIsEditorShown={setIsEditorShown}
									/>,
						disableView: true,
					})}
					ref={ref}
				/>;
	});
	if (skipWrappers) {
		return Editor; // this is for InlineSideEditor, not yet implemented
	}
	return withAdditionalProps(withEditor(Editor));
}