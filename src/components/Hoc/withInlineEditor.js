import React, { useState, useEffect, useRef, } from 'react';
import {
	Column,
	Modal,
	Row,
	Text,
} from 'native-base';
import {
	EDITOR_TYPE_INLINE,
} from '../../Constants/EditorTypes.js';
import {
	UI_MODE_WEB,
	UI_MODE_REACT_NATIVE,
} from '../../Constants/UiModes.js';
import UiGlobals from '../../UiGlobals.js';
import Form from '../Form/Form.js';
import withEditor from './withEditor.js';
import _ from 'lodash';

export default function withInlineEditor(WrappedComponent) {
	if (UiGlobals.mode === UI_MODE_REACT_NATIVE) {
		throw new Error('Not yet implemented for RN.');
	}
	return withEditor((props) => {
		const {
				useEditor = false,
				editorType,
				isEditorShown,
				setIsEditorShown,
				isEditorViewOnly,
				onEditorCancel,
				onEditorSave,
				onEditorClose,

				// withSelection
				selection,

				// withData
				Repository,
			} = props,
			styles = UiGlobals.styles,
			inlineEditorRef = useRef(),
			[localColumnsConfig, setLocalColumnsConfig] = useState([]),
			[currentRow, setCurrentRow] = useState(),
			onChangeColumnsConfig = (columnsConfig) => {
				setLocalColumnsConfig(columnsConfig);
			},
			onRowClick = (item, rowIndex, e) => {
				// move the editor up to the appropriate row
				const currentRow = e.currentTarget;
				moveEditor(currentRow);

				setCurrentRow(currentRow);
			},
			onScreenResize = () => {
				// TODO: Attach a div with zIndex 0 to body to monitor resize events. THis is handler

				moveEditor(currentRow);
			},
			moveEditor = (currentRow) => {
				const 
					bounds = currentRow.getBoundingClientRect(),
					r = inlineEditorRef.current.style;
				r.top = bounds.top -8 + 'px';
				r.left = bounds.left + 'px';
				r.width = bounds.width + 'px';
			};

		if (isEditorShown && selection.length !== 1) {
			throw new Error('Can only edit one at a time with inline editor!');
		}
	
		return <>
					<WrappedComponent
						{...props}
						inlineEditorRef={inlineEditorRef}
						onChangeColumnsConfig={onChangeColumnsConfig}
						onEditorRowClick={onRowClick}
					/>
					{useEditor && editorType === EDITOR_TYPE_INLINE && Repository && 
							<Modal
								isOpen={isEditorShown}
								onClose={() => setIsEditorShown(false)}
							>
								<Column position="absolute" ref={inlineEditorRef}>
									{isEditorShown && <Form
															editorType={EDITOR_TYPE_INLINE} 
															record={selection[0]}
															Repository={Repository}
															isMultiple={selection.length > 1}
															isViewOnly={isEditorViewOnly}
															columnsConfig={localColumnsConfig}
															onCancel={onEditorCancel}
															onSave={onEditorSave}
															onClose={onEditorClose}
															footerProps={{
																justifyContent: 'center',
																bg: null, // make bg transparent
																p: 0,
															}}
															buttonGroupProps={{
																bg: 'primary.100',
																borderBottomRadius: 5,
																px: 4,
																py: 2,
															}}
															bg="#fff"
															borderTopWidth={4}
															borderTopColor={styles.GRID_INLINE_EDITOR_BORDER_COLOR}
															borderBottomWidth={4}
															borderBottomColor={styles.GRID_INLINE_EDITOR_BORDER_COLOR}
															py={1}
															px={0}
														/>}
								</Column>
							</Modal>}
				</>;
	});
}