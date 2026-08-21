import { forwardRef, useEffect, useRef } from 'react';
import {
	EDITOR_TYPE__WINDOWED,
} from '../../Constants/Editor.js';
import getComponentFromType from '../../Functions/getComponentFromType.js';
import { withInjectedHocProps } from '../../Functions/internalHocProps.js';
import withModal from './withModal.js';
import withEditor from './withEditor.js';
// import withDraggable from './withDraggable.js';
import _ from 'lodash';


// function withAdditionalProps(WrappedComponent) {
// 	return forwardRef((props, ref) => {
// 		return <WrappedComponent
// 					mode="BOTH_AXES"
// 					handle=".header"
// 					{...props}
// 					ref={ref}
// 				/>;
// 	});
// }

// In order to implement a draggable window, I'd need to switch the Column with DraggableColumn,
// then switch position to absolute, draggable area would be header of panel
// const DraggableColumn = withAdditionalProps(withDraggable(Column));




function withAdditionalProps(WrappedComponent) {
	return forwardRef((props, ref) => {
		let Editor = props.Editor;
		if (!Editor && props.model) {
			try {
				Editor = getComponentFromType(props.model + 'EditorWindow');
			} catch(err) {
				// No default editor window registered for this model.
			}
		}

		// provide the editorType to withEditor
		return <WrappedComponent
					{...withInjectedHocProps(props, {
						editorType: EDITOR_TYPE__WINDOWED,
						Editor,
					})}
					ref={ref}
				/>;
	});
}

// NOTE: Effectivtly, the HOC composition is:
// withAdditionalProps(withEditor(withWindowedEditor))

export default function withWindowedEditor(WrappedComponent, isTree = false) {
	const WindowedEditor = forwardRef((props, ref) => {
		const {
				isEditorShown = false,
				setIsEditorShown,
				Editor,
				_editor = {},

				// withComponent
				self,

				// withModal
				showModal,
				hideModal,
				
				// pull these out, as we don't want them going to the Editor
				selectorId,
				selectorSelected,
				selectorSelectedField,
				h,
				style,
				
				...propsToPass
			} = props,
			onEditorCancel = props.onEditorCancel,
			editorModalIdRef = useRef(null),
			hideEditorModal = () => {
				if (editorModalIdRef.current !== null && hideModal) {
					hideModal({ modalId: editorModalIdRef.current });
					editorModalIdRef.current = null;
				}
			},
			onModalCancel = () => {
				editorModalIdRef.current = null;
				if (onEditorCancel) {
					onEditorCancel();
				}
			};

		useEffect(() => {
			return () => {
				hideEditorModal();
			};
		}, []);

		useEffect(() => {
			if (!Editor || !showModal || !hideModal) {
				return;
			}

			if (!isEditorShown) {
				hideEditorModal();
				return;
			}

			if (editorModalIdRef.current !== null) {
				return;
			}

			editorModalIdRef.current = showModal({
				body: <Editor
						editorType={EDITOR_TYPE__WINDOWED}
						{...propsToPass}
						{..._editor}
						parent={self}
						reference="editor"
						className="bg-white shadow-lg rounded-lg"
					/>,
				onCancel: onModalCancel,
				canClose: true,
				whichModal: 'windowedEditor',
				stackMode: 'push',
			});

		}, [Editor, _editor, showModal, hideModal, onModalCancel, propsToPass, self, isEditorShown, ]);

		return <WrappedComponent {...props} ref={ref} />;

	});
	return withAdditionalProps(withEditor(withModal(WindowedEditor), isTree));
}