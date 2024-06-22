import { useState, } from 'react';
import {
	EDITOR_TYPE__INLINE,
} from '../../Constants/Editor.js';
import InlineEditor from '../Editor/InlineEditor.js';
import withEditor from './withEditor.js';
import _ from 'lodash';



function withAdditionalProps(WrappedComponent) {
	return (props) => {
		// provide the editorType to withEditor
		return <WrappedComponent
					editorType={EDITOR_TYPE__INLINE}
					{...props}
				/>;
	};
}

// NOTE: Effectivtly, the HOC composition is:
// withAdditionalProps(withEditor(withInlineEditor))

export default function withInlineEditor(WrappedComponent, skipWrappers = false) {
	const Editor = (props) => {
		const {
				isEditorShown = false,
				setIsEditorShown,
				editorProps = {},

				// withComponent
				self,

				// pull these out, as we don't want them going to the Editor
				selectorId,
				selectorSelected,
				h,

				...propsToPass
			} = props,
			[localColumnsConfig, setLocalColumnsConfig] = useState([]),
			onChangeColumnsConfig = (columnsConfig) => {
				setLocalColumnsConfig(columnsConfig);
			};

		return <WrappedComponent
					onChangeColumnsConfig={onChangeColumnsConfig}
					isInlineEditorShown={isEditorShown}
					inlineEditor={<InlineEditor
									{...propsToPass}
									{...editorProps}
									parent={self}
									reference="editor"
									columnsConfig={localColumnsConfig}
									isEditorShown={isEditorShown}
									setIsEditorShown={setIsEditorShown}
								/>}

					{...props}
				/>;
	};
	if (skipWrappers) {
		return Editor; // this is for InlineSideEditor, not yet implemented
	}
	return withAdditionalProps(withEditor(Editor));
}