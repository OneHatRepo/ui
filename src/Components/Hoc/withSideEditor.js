import { forwardRef } from 'react';
import {
	EDITOR_TYPE__SIDE,
} from '../../Constants/Editor.js';
import Container from '../Container/Container.js';
import withEditor from './withEditor.js';
import _ from 'lodash';


function withAdditionalProps(WrappedComponent) {
	return forwardRef((props, ref) => {
		// provide the editorType to withEditor
		return <WrappedComponent
					editorType={EDITOR_TYPE__SIDE}
					{...props}
					ref={ref}
				/>;
	});
}

// NOTE: Effectivtly, the HOC composition is:
// withAdditionalProps(withEditor(withSideEditor))

export default function withSideEditor(WrappedComponent, isTree = false) {
	const SideEditor = forwardRef((props, ref) => {
		const {
				Editor,
				_editor = {},
				sideFlex = 100,
				isResizable = false,

				// withComponent
				self,
				
				// pull these out, as we don't want them going to the Editor
				selectorId,
				selectorSelected,
				selectorSelectedField,
				style,
				
				...propsToPass
			} = props;

		if (!Editor) {
			throw Error('Editor is not defined');
		}

		if (isResizable) {
			_editor.w = 500;
			_editor.isResizable = true;
		} else {
			_editor.flex = sideFlex;
		}

		if (!_editor.className) {
			_editor.className = '';
		}
		_editor.className += ' border-l-1 border-l-grey-300';

		return <Container
					parent={self}
					reference="SideEditor"
					center={<WrappedComponent
								ref={ref}
								isTree={isTree}
								isSideEditor={true}
								{...props}
							/>}
					east={<Editor
								{...propsToPass}
								editorType={EDITOR_TYPE__SIDE}
								{..._editor}
								parent={self}
								reference="editor"
							/>}
				/>;
	});
	return withAdditionalProps(withEditor(SideEditor, isTree));
}