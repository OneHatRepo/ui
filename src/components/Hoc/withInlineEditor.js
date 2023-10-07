import React, { useState, useEffect, useRef, } from 'react';
import {
	Box,
	Column,
	Modal,
	Row,
	Text,
} from 'native-base';
import {
	EDITOR_TYPE__INLINE,
} from '../../Constants/Editor.js';
import {
	UI_MODE_WEB,
	UI_MODE_REACT_NATIVE,
} from '../../Constants/UiModes.js';
import UiGlobals from '../../UiGlobals.js';
import Form from '../Form/Form.js';
import withEditor from './withEditor.js';
import _ from 'lodash';

export default function withInlineEditor(WrappedComponent) {
	return withEditor((props) => {
		const {
				editorType,
				isEditorShown = false,
				setIsEditorShown,
				isEditorViewOnly,
				onEditorCancel,
				onEditorSave,
				onEditorClose,
				editorStateRef,

				// withComponent
				self: parent,

				// withSelection
				selection,

				// withData
				Repository,
			} = props,
			styles = UiGlobals.styles,
			maskRef = useRef(),
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
					rowBounds = currentRow.getBoundingClientRect(),
					editor = inlineEditorRef.current,
					editorStyle = editor.style,
					editorBounds = editor.parentElement.getBoundingClientRect(), // reference parentElement, because this doesn't change based on last moveEditor call
					delta = editorBounds.top - rowBounds.top;

				editorStyle.top = (-1 * delta) -20 + 'px';
			};

		if (isEditorShown && selection.length < 1) {
			throw new Error('Lost the selection!');
		}
		if (isEditorShown && selection.length !== 1) {
			throw new Error('Can only edit one at a time with inline editor!');
		}
		if (UiGlobals.mode === UI_MODE_REACT_NATIVE) {
			throw new Error('Not yet implemented for RN.');
		}

		let inlineEditor = null;
		if (Repository) {
			inlineEditor = <>
								{isEditorShown && <Box
													ref={maskRef}
													position="fixed"
													w="100vw"
													h="100vh"
													top="0"
													left="0"
													bg="#000"
													opacity={0.35}
													zIndex={0}
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														onEditorCancel();
													}}
												></Box>}
								<Column
									ref={inlineEditorRef}
									position="absolute"
									zIndex={10}
								>
									{isEditorShown && <Form
															parent={parent}
															editorType={EDITOR_TYPE__INLINE}
															editorStateRef={editorStateRef}
															record={selection[0]}
															Repository={Repository}
															isMultiple={selection.length > 1}
															isEditorViewOnly={isEditorViewOnly}
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
							</>;
		}
	
		return <WrappedComponent
					{...props}
					onChangeColumnsConfig={onChangeColumnsConfig}
					onEditorRowClick={onRowClick}
					inlineEditor={inlineEditor}
					isInlineEditorShown={isEditorShown}
				/>;
	});
}