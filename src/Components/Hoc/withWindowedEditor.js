import { forwardRef } from 'react';
import {
	Box,
	Modal, ModalBackdrop, ModalHeader, ModalContent, ModalCloseButton, ModalBody, ModalFooter,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import {
	CURRENT_MODE,
	UI_MODE_WEB,
	UI_MODE_NATIVE,
} from '../../Constants/UiModes.js';
import {
	EDITOR_TYPE__WINDOWED,
} from '../../Constants/Editor.js';
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
		// provide the editorType to withEditor
		return <WrappedComponent
					editorType={EDITOR_TYPE__WINDOWED}
					{...props}
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
				
				// pull these out, as we don't want them going to the Editor
				selectorId,
				selectorSelected,
				selectorSelectedField,
				h,
				style,
				
				...propsToPass
			} = props,
			onEditorCancel = props.onEditorCancel;

		if (!Editor) {
			throw Error('Editor is not defined');
		}

		let modalBackdrop = <ModalBackdrop className="withEditor-ModalBackdrop" />
		if (CURRENT_MODE === UI_MODE_NATIVE) {
			// Gluestack's ModalBackdrop was not working on Native,
			// so workaround is to do it manually for now
			modalBackdrop = <Pressable
								onPress={() => setIsMenuShown(false)}
								className={clsx(
									'withEditor-ModalBackdrop-replacment',
									'h-full',
									'w-full',
									'absolute',
									'top-0',
									'left-0',
									'bg-[#000]',
									'opacity-50',
								)}
							/>;
		}

		return <>
					<WrappedComponent {...props} ref={ref} />
					{isEditorShown && 
						<Modal
							isOpen={true}
							onClose={onEditorCancel}
							className="withEditor-Modal"
						>
							{modalBackdrop}
							<Editor
								editorType={EDITOR_TYPE__WINDOWED}
								{...propsToPass}
								{..._editor}
								parent={self}
								reference="editor"
								className={clsx(
									'bg-white',
									'shadow-lg',
									'rounded-lg',
								)}
							/>
						</Modal>}
				</>;
	});
	return withAdditionalProps(withEditor(WindowedEditor, isTree));
}