import { useState, useEffect, useRef, } from 'react';
import {
	Column,
	Modal,
	Text,
} from 'native-base';
import {
	EDITOR_TYPE_WINDOWED,
} from '../../Constants/EditorTypes';
import Panel from '../Panel/Panel';
import withEditor from './withEditor';
import withDraggable from './withDraggable';
import _ from 'lodash';


function withAdditionalProps(WrappedComponent) {
	return (props) => {
		return <WrappedComponent
					mode="BOTH_AXES"
					handle=".header"
					{...props}
				/>;
	};
}
const DraggableColumn = withAdditionalProps(withDraggable(Column));

// In order to implement a draggable window, I'd need to switch the Column with DraggableColumn,
// then switch position to absolute, draggable area would be header of panel

export default function withWindowedEditor(WrappedComponent) {
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
			} = props;

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
											<Panel isCollapsible={false} model={props.model} titleSuffix=" Editor">
												<EditorFormType
													editorType={EDITOR_TYPE_WINDOWED}
													entity={entity}
													Repository={Repository}
													isMultiple={selection.length > 1}
													isViewOnly={isEditorViewOnly}
													onCancel={onEditorCancel}
													onSave={onEditorSave}
													onClose={onEditorClose}
												/>
											</Panel>
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