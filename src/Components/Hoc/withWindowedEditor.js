import { forwardRef, useEffect, useRef } from 'react';
import {
	EDITOR_TYPE__WINDOWED,
} from '../../Constants/Editor.js';
import getComponentFromType from '../../Functions/getComponentFromType.js';
import { withInjectedHocProps } from '../../Functions/internalHocProps.js';
import withModal from './withModal.js';
import withEditor from './withEditor.js';
// import withDraggable from './withDraggable.js';

/*
 * withWindowedEditor architecture notes
 *
 * Why this HOC changed:
 * - Historically, windowed editors rendered their modal body directly inside this component's
 *   render tree. That meant parent re-renders naturally re-rendered the editor body.
 * - We migrated to shared modal stacking via withModal.showModal(...) so all modals are managed
 *   in one stack/root. That solved stacking/layering consistency, but introduced a stale-body risk:
 *   showModal normally stores a body snapshot at open time.
 *
 * Core problem that appeared:
 * - Editor state (for example, VIEW/EDIT transitions from withEditor) can change while a windowed
 *   modal remains open.
 * - If the modal body is a snapshot, those changes may not re-render inside the open modal.
 *
 * Current solution in this file:
 * - Provide withModal a live bodyStore (subscribe + getSnapshot) instead of static body.
 * - Publish a fresh <Editor .../> snapshot whenever this component re-renders while the modal is open.
 * - withModal renders a LiveModalBody subscriber that updates from the bodyStore, restoring
 *   "parent re-render updates modal body" behavior without reopening modal or maintaining brittle
 *   field-sync lists.
 *
 * Usage expectations:
 * - Keep using withWindowedEditor for grid/tree/windowed editor flows.
 * - Do not pass static body directly from this HOC; always use bodyStore in showModal.
 * - The bodyStore contract lives in withModal: { subscribe(listener), getSnapshot() }.
 * - onCancel should close the editor flow (and can optionally do extra cleanup).
 *
 * Notes:
 * - The modal reference used here is "editor" so withComponent child lookup remains stable.
 * - publishLiveBody(null) is called when modal closes to release rendered content references.
 */


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
			editorModalIdRef = useRef(null), // modal id returned by withModal.showModal
			liveBodySnapshotRef = useRef(null),
			liveBodyListenersRef = useRef(new Set()),
			liveBodyStoreRef = useRef({
				// withModal subscribes through this function while modal is mounted.
				subscribe: (listener) => {
					liveBodyListenersRef.current.add(listener);
					return () => {
						liveBodyListenersRef.current.delete(listener);
					};
				},
				// withModal reads the latest React node snapshot from this getter.
				getSnapshot: () => {
					return liveBodySnapshotRef.current;
				},
			}),
			renderEditorBody = () => {
				// Build the latest windowed editor body from current props each render.
				return <Editor
						editorType={EDITOR_TYPE__WINDOWED}
						{...propsToPass}
						{..._editor}
						parent={self}
						reference="editor"
						className="bg-white shadow-lg rounded-lg"
					/>;
			},
			publishLiveBody = (body) => {
				// Push snapshot and notify subscribers so open modal content re-renders.
				liveBodySnapshotRef.current = body;
				liveBodyListenersRef.current.forEach((listener) => {
					listener();
				});
			},
			hideEditorModal = () => {
				if (editorModalIdRef.current !== null && hideModal) {
					hideModal({ modalId: editorModalIdRef.current, skipModalHooks: true });
					editorModalIdRef.current = null;
					// Clear body snapshot to avoid holding stale React nodes after close.
					publishLiveBody(null);
				}
			},
			onModalCancel = () => {
				if (!onEditorCancel) {
					setIsEditorShown(false);
					// withModal closes when the cancel handler does not return false.
					return true;
				}

				const shouldClose = onEditorCancel();
				if (shouldClose === false) {
					// Dirty editor path: keep this modal mounted while confirm is shown.
					return false;
				}
				// Editor cancel completed synchronously, so close this modal now.
				return true;
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

			publishLiveBody(renderEditorBody()); // initial snapshot before opening modal

			editorModalIdRef.current = showModal({
				// Use live body channel so modal content tracks parent re-renders.
				bodyStore: liveBodyStoreRef.current,
				onCancel: onModalCancel,
				canClose: true,
				whichModal: 'windowedEditor',
				stackMode: 'push',
			});

		}, [Editor, _editor, showModal, hideModal, onModalCancel, propsToPass, self, isEditorShown, ]);

		useEffect(() => {
			if (!Editor) {
				return;
			}
			if (!isEditorShown || editorModalIdRef.current === null) {
				return;
			}

			// Keep the modal body live by publishing latest body while open.
			publishLiveBody(renderEditorBody());
		});

		_editor.setIsEditorShown = setIsEditorShown;

		return <WrappedComponent
					{...props}
					_editor={_editor}
					ref={ref}
				/>;

	});
	return withAdditionalProps(withEditor(withModal(WindowedEditor), isTree));
}