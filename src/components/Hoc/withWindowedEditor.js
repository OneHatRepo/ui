import { useState, } from 'react';
import {
	Column,
	Modal,
	Text,
} from 'native-base';
import {
	EDITOR_TYPE_INLINE,
	EDITOR_TYPE_WINDOWED,
} from '../../Constants/EditorTypes';
import withEditor from './withEditor';
import _ from 'lodash';

export default function withWindowedEditor(WrappedComponent) {
	return withEditor((props) => {
		const {
				Repository,
				selection,
				useEditor = false,
				isEditorShown = false,
				setIsEditorShown,
				EditorFormType,
				onEditorCancel,
				onEditorSave,
				editorWidth = 500,
				editorHeight = 500,
			} = props;

		let entity;
		if (isEditorShown && selection.length) {
			entity = selection.length === 1 ? selection[0] : selection;
		}

		return <>
			<WrappedComponent editorType={EDITOR_TYPE_WINDOWED} {...props} />
			{useEditor && Repository &&
			entity && isEditorShown && <Modal
											animationType="fade"
											isOpen={true}
											onClose={() => setIsEditorShown(false)}
										>
											<Column bg="#fff" w={editorWidth} h={editorHeight}>
												<EditorFormType
													entity={entity}
													onCancel={onEditorCancel}
													onSave={onEditorSave}
												/>
											</Column>
										</Modal>}
		</>;
	});
}