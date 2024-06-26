import { useState, useEffect, useRef, } from 'react';
import {
	Box,
	Column,
	Row,
	Text,
} from 'native-base';
import withComponent from '../Hoc/withComponent.js';
import {
	UI_MODE_WEB,
	UI_MODE_REACT_NATIVE,
} from '../../Constants/UiModes.js';
import {
	EDITOR_TYPE__INLINE,
} from '../../Constants/Editor.js';
import testProps from '../../Functions/testProps.js';
import UiGlobals from '../../UiGlobals.js';
import Form from '../Form/Form.js';
import _ from 'lodash';

function InlineEditor(props) {

	if (UiGlobals.mode === UI_MODE_REACT_NATIVE) {
		throw new Error('Not yet implemented for RN.');
	}
	
	const {
			isEditorShown = false,
			columnsConfig,
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
		[currentRow, setCurrentRow] = useState(),
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
				data = self.parent.gridRef.current.props.data, // This is okay, because (for now) the inlineEditor is only for use with grids
				ix = data.indexOf(selection[0]),
				gridRowsContainer = self.parent.gridRef.current._listRef._scrollRef.childNodes[0],
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

	if (!isEditorShown) {
		return null;
	}

	if (selection.length < 1) {
		return null; // phantom record may have just been deleted
	}
	if (selection.length !== 1) {
		throw new Error('Can only edit one at a time with inline editor!');
	}
	if (!Repository) {
		throw new Error('Must use a Repository');
	}

	return <>
				<Box
					ref={maskRef}
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
				/>
				<Column
					ref={inlineEditorRef}
					position="absolute"
					zIndex={10}
					{...testProps('inlineEditor')}
					h={isEditorShown ? '100px' : 0}
					minWidth="100%"
					display="inline-block"
					whiteSpace="nowrap"
				>
					<Form
						editorType={EDITOR_TYPE__INLINE}
						editorStateRef={editorStateRef}

						Repository={Repository}
						isMultiple={selection.length > 1}
						isEditorViewOnly={isEditorViewOnly}
						columnsConfig={columnsConfig}
						bg="#fff"
						borderTopWidth={4}
						borderTopColor={styles.GRID_INLINE_EDITOR_BORDER_COLOR}
						borderBottomWidth={4}
						borderBottomColor={styles.GRID_INLINE_EDITOR_BORDER_COLOR}
						py={1}
						px={0}

						record={selection[0]}
						onCancel={onEditorCancel}
						onSave={onEditorSave}
						onClose={onEditorClose}
						parent={self}
						reference="form"
					/>
				</Column>
			</>;

}

export default withComponent(InlineEditor);