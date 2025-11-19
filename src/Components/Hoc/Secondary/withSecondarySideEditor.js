import { forwardRef } from 'react';
import {
	EDITOR_TYPE__SIDE,
} from '../../../Constants/Editor.js';
import Container from '../../Container/Container.js';
import withSecondaryEditor from './withSecondaryEditor.js';
import _ from 'lodash';

// NOTE: This is a modified version of @onehat/ui/src/Hoc/withSideEditor
// This HOC will eventually get out of sync with that one, and may need to be updated.


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
// withAdditionalProps(withSecondaryEditor(withSecondarySideEditor))

export default function withSecondarySideEditor(WrappedComponent, isTree = false) {
	const SideEditor = forwardRef((props, ref) => {
		const {
				SecondaryEditor,
				secondaryEditorProps = {},
				secondarySideFlex = 100,

				// withComponent
				self,
				
				// pull these out, as we don't want them going to the Editor
				secondarySelectorId,
				secondarySelectorSelected,
				secondarySelectorSelectedField,
				style,
				
				...propsToPass
			} = props;

		if (!SecondaryEditor) {
			throw Error('SecondaryEditor is not defined');
		}

		const containerProps = {};
		if (isResizable) {
			containerProps.eastIsResizable = true;
			containerProps.eastInitialWidth = 500;
		} else {
			containerProps.eastInitialFlex = secondarySideFlex;
		}

		if (!secondaryEditorProps.className) {
			secondaryEditorProps.className = '';
		}
		secondaryEditorProps.className += ' border-l-1 border-l-grey-300';

		return <Container
					parent={self}
					reference="SideEditor"
					center={<WrappedComponent
								ref={ref}
								isTree={isTree}
								isSideEditor={true}
								{...props}
							/>}
					east={props.secondaryIsEditorShown && <Editor
								{...propsToPass}
								editorType={EDITOR_TYPE__SIDE}
								{...secondaryEditorProps}
								parent={self}
								reference="secondaryEditor"
							/>}
					{...containerProps}
				/>;
	});
	return withAdditionalProps(withSecondaryEditor(SideEditor, isTree));
}