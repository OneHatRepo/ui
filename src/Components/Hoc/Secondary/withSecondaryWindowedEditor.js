import { forwardRef, useEffect, useRef } from 'react';
import {
	EDITOR_TYPE__WINDOWED,
} from '../../../Constants/Editor.js';
import { withInjectedHocProps } from '../../../Functions/internalHocProps.js';
import withSecondaryEditor from './withSecondaryEditor.js';
import withModal from '../withModal.js';
// import withDraggable from './withDraggable.js';
import _ from 'lodash';

// NOTE: This is a modified version of @onehat/ui/src/Hoc/withWindowedEditor
// This HOC will eventually get out of sync with that one, and may need to be updated.


function withAdditionalProps(WrappedComponent) {
	return forwardRef((props, ref) => {
		// provide the editorType to withEditor
		return <WrappedComponent
					{...withInjectedHocProps(props, {
						editorType: EDITOR_TYPE__WINDOWED,
					})}
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

				// withModal
				showModal,
				hideModal,
				
				// pull these out, as we don't want them going to the SecondaryEditor
				secondarySelectorId,
				secondarySelectorSelected,
				secondarySelectorSelectedField,
				h,
				style,

				...propsToPass
			} = props,
			secondaryEditorModalIdRef = useRef(null),
			hideSecondaryEditorModal = () => {
				if (secondaryEditorModalIdRef.current !== null && hideModal) {
					hideModal({ modalId: secondaryEditorModalIdRef.current });
					secondaryEditorModalIdRef.current = null;
				}
			},
			onModalCancel = () => {
				secondarySetIsEditorShown(false);
			};

		if (!SecondaryEditor) {
			throw Error('SecondaryEditor is not defined');
		}

		useEffect(() => {
			return () => {
				hideSecondaryEditorModal();
			};
		}, []);

		useEffect(() => {
			if (!SecondaryEditor || !showModal || !hideModal) {
				return;
			}

			if (!secondaryIsEditorShown) {
				hideSecondaryEditorModal();
				return;
			}

			if (secondaryEditorModalIdRef.current !== null) {
				return;
			}

			const mappedSecondaryEditorProps = {
				...secondaryEditorProps,
			};

			// Move the 'secondary' props over to primary naming for the secondary editor.
			function lcfirst(str) {
				return str.charAt(0).toLowerCase() + str.slice(1);
			}
			_.each(props, (prop, ix) => {
				if (ix.match(/^secondary/)) {
					const name = lcfirst(ix.replace(/^secondary/, ''));
					mappedSecondaryEditorProps[name] = prop;
				}
			});
			mappedSecondaryEditorProps.Repository = props.SecondaryRepository;

			secondaryEditorModalIdRef.current = showModal({
				body: <SecondaryEditor
						editorType={EDITOR_TYPE__WINDOWED}
						{...propsToPass}
						{...mappedSecondaryEditorProps}
						parent={self}
						reference="secondaryEditor"
						className="bg-white shadow-lg rounded-lg"
					/>,
				onCancel: onModalCancel,
				canClose: true,
				whichModal: 'secondaryWindowedEditor',
				stackMode: 'push',
			});
		}, [SecondaryEditor, secondaryEditorProps, showModal, hideModal, props, propsToPass, self, secondaryIsEditorShown]);

		return <WrappedComponent {...props} ref={ref} />;
	});
	return withAdditionalProps(withSecondaryEditor(withModal(WindowedEditor), isTree));
}