import { forwardRef } from 'react';
import {
	Modal, ModalBackdrop, ModalHeader, ModalContent, ModalCloseButton, ModalBody, ModalFooter,
} from '@project-components/Gluestack';
import {
	EDITOR_TYPE__WINDOWED,
} from '../../../Constants/Editor.js';
import withSecondaryEditor from './withSecondaryEditor.js';
// import withDraggable from './withDraggable.js';
import _ from 'lodash';

// NOTE: This is a modified version of @onehat/ui/src/Hoc/withWindowedEditor
// This HOC will eventually get out of sync with that one, and may need to be updated.


function withAdditionalProps(WrappedComponent) {
	return forwardRef((props, ref) => {
		// provide the editorType to withEditor
		return <WrappedComponent
					editorType={EDITOR_TYPE__WINDOWED}
					{...props}
					ref={ref}
				/>;
	});
}

// NOTE: Effectivtly, the HOC composition is:
// withAdditionalProps(withSecondaryEditor(withSecondaryWindowedEditor))

export default function withSecondaryWindowedEditor(WrappedComponent, isTree = false) {
	const WindowedEditor = forwardRef((props, ref) => {
		const {
				secondaryIsEditorShown = false,
				secondarySetIsEditorShown,
				SecondaryEditor,
				secondaryEditorProps = {},

				// withComponent
				self,
				
				// pull these out, as we don't want them going to the SecondaryEditor
				secondarySelectorId,
				secondarySelectorSelected,
				secondarySelectorSelectedField,
				h,
				style,

				...propsToPass
			} = props;

		if (!SecondaryEditor) {
			throw Error('SecondaryEditor is not defined');
		}

		if (secondaryIsEditorShown) {
			// Move the 'secondary' props over to primary
			// for the sake of the Editor
			function lcfirst(str) {
				return str.charAt(0).toLowerCase() + str.slice(1);
			}
			_.each(props, (prop, ix) => {
				if (ix.match(/^secondary/)) {
					const name = lcfirst(ix.replace(/^secondary/, ''));
					secondaryEditorProps[name] = prop;
				}
			});
			secondaryEditorProps.Repository = props.SecondaryRepository;
		}

		return <>
					<WrappedComponent {...props} ref={ref} />
					{secondaryIsEditorShown && 
						<Modal
							isOpen={true}
							onClose={() => secondarySetIsEditorShown(false)}
							className="withSecondaryEditor-Modal"
						>
							<ModalBackdrop className="withSecondaryEditor-ModalBackdrop" />
							<SecondaryEditor
								editorType={EDITOR_TYPE__WINDOWED}
								{...propsToPass}
								{...secondaryEditorProps}
								parent={self}
								reference="secondaryEditor"
								className={`
									bg-white
									shadow-lg
									rounded-lg
								`}
							/>
						</Modal>}
				</>;
	});
	return withAdditionalProps(withSecondaryEditor(WindowedEditor, isTree));
}