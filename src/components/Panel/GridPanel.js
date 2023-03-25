import { useEffect, useState, } from 'react';
import Panel from './Panel.js';
import Grid, { InlineGridEditor, SideGridEditor, } from '../Grid/Grid.js';
import {
	EDITOR_TYPE__INLINE,
	EDITOR_TYPE__WINDOWED,
	EDITOR_TYPE__SIDE,
} from '../../Constants/Editor.js';
import _ from 'lodash';

export function GridPanel(props) {
	const {
			editorType = EDITOR_TYPE__WINDOWED,
			disableTitleChange = false,
			selectorSelected,
		} = props,
		originalTitle = props.title,
		[isReady, setIsReady] = useState(disableTitleChange),
		[title, setTitle] = useState(originalTitle);

	let WhichGrid;
	switch(editorType) {
		case EDITOR_TYPE__INLINE:
			WhichGrid = InlineGridEditor;
			break;
		case EDITOR_TYPE__WINDOWED:
			WhichGrid = Grid;
			break;
		case EDITOR_TYPE__SIDE:
			WhichGrid = SideGridEditor;
			break;
	}

	useEffect(() => {
		if (!disableTitleChange && originalTitle) {
			let newTitle = originalTitle;
			if (selectorSelected?.[0]?.displayValue) {
				newTitle = originalTitle + ' for ' + selectorSelected[0].displayValue;
			}
			if (newTitle !== title) {
				setTitle(newTitle);
			}
		}
		if (!isReady) {
			setIsReady(true);
		}
	}, [selectorSelected, disableTitleChange, originalTitle]);

	if (!isReady) {
		return null;
	}

	return <Panel {...props} title={title}>
				<WhichGrid {...props} />
			</Panel>;
}

export default GridPanel;