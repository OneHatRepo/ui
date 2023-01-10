import React, { useState, useEffect, } from 'react';
import {
	Column,
	Modal,
	Row,
	Text,
} from 'native-base';
import {
	EDITOR_TYPE_INLINE,
} from '../../Constants/EditorTypes';
import withEditor from './withEditor';
import _ from 'lodash';

export default function withInlineEditor(WrappedComponent) {
	return withEditor((props) => {
		const {
				useEditor = false,
				isEditorShown,
				setIsEditorShown,
				isEditorViewOnly,
				EditorFormType,
				onEditorCancel,
				onEditorSave,
				onEditorClose,
				editorWidth = 500,
				editorHeight = null,

				// withSelection
				selection,

				// withData
				Repository,
			} = props,
			// [editorX, setEditorX] = useState(0),
			[editorY, setEditorY] = useState(0),
			[editorScrollX, setEditorScrollX] = useState(0);

		useEffect(() => {

				
			const y = e.pageY;



			setEditorY(y);
		}, [isEditorShown]);

		let entity;
		if (isEditorShown && selection.length) {
			entity = selection.length === 1 ? selection[0] : selection;
		}
	
		return <>
					<WrappedComponent {...props} />
					{useEditor && Repository &&
					isEditorShown && <Modal
										animationType="fade"
										isOpen={true}
										onClose={() => setIsEditorShown(false)}
									>
										<Column bg="#fff" w={editorWidth} h={editorHeight}>
											<EditorFormType
												editorType={EDITOR_TYPE_INLINE} 
												entity={entity}
												Repository={Repository}
												isMultiple={selection.length > 1}
												isViewOnly={isEditorViewOnly}
												onCancel={onEditorCancel}
												onSave={onEditorSave}
												onClose={onEditorClose}
												// _panel={{
												// 	headerOnDragDown={}
												// 	headerOnDragUp={}
												// }}
											/>
										</Column>

										{/* <DraggableColumn bg="#fff" position={position} left={left} top={top} w={editorWidth} h={editorHeight}>
											<EditorFormType
												entity={entity}
												onCancel={onEditorCancel}
												onSave={onEditorSave}
												_panel={{
													useClassName: true,
													// headerOnDragDown={}
													// headerOnDragUp={}
												}}
											/>
										</DraggableColumn> */}
									</Modal>}
				</>;
	});
}