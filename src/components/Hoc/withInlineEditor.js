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



function withAdditionalProps(WrappedComponent) {
	return (props) => {
		// provide the editorType to withEditor
		return <WrappedComponent
					editorType={EDITOR_TYPE__INLINE}
					{...props}
				/>;
	};
}

// NOTE: Effectivtly, the HOC composition is:
// withAdditionalProps(withEditor(withInlineEditor))

export default function withInlineEditor(WrappedComponent, skipWrappers = false) {
	const InlineEditor = (props) => {
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
				self,

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

				editorStyle.top = (-1 * delta) + 'px';
			},
			onEditorShown = () => {
				// determine which row to move the editor to
				const
					data = self.gridRef.current.props.data,
					ix = data.indexOf(selection[0]),
					gridRowsContainer = self.gridRef.current._listRef._scrollRef.childNodes[0],
					currentRow = gridRowsContainer.childNodes[ix];

				// TODO: verify it works if not using a Repository

				moveEditor(currentRow);
				setCurrentRow(currentRow);
			};
		
		useEffect(() => {
			if (maskRef.current) {
				maskRef.current.focus();
			}
			if (isEditorShown) {
				onEditorShown();
			}
		}, [isEditorShown]);

		if (isEditorShown && selection.length < 1) {
			return null; // phantom record may have just been deleted
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
													testID="mask"
													position="fixed"
													w="100vw"
													h="100vh"
													top="0"
													left="0"
													bg="#000"
													opacity={0.3}
													zIndex={0}
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														onEditorCancel();
													}}
													tabIndex={-1}
													onKeyDown={(e) => {
														if (e.key === 'Escape') {
															onEditorCancel();
														}
													}}
												></Box>}
								<Column
									ref={inlineEditorRef}
									position="absolute"
									zIndex={10}
									testID="inline-editor"
									h={isEditorShown ? '100px' : 0}
									minWidth="100%"
									display="inline-block"
									whiteSpace="nowrap"
								>
									{isEditorShown &&
										<Form
											parent={self}
											reference="form"
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
	};
	if (skipWrappers) {
		return InlineEditor; // this is for InlineSideEditor, not yet implemented
	}
	return withAdditionalProps(withEditor(InlineEditor));
}