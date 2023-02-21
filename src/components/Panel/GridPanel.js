import { useEffect, useState, } from 'react';
import Panel from './Panel.js';
import Grid, { InlineGridEditor, } from '../Grid/Grid.js';
import {
	EDITOR_TYPE_INLINE,
	EDITOR_TYPE_WINDOWED,
} from '../../Constants/EditorTypes.js';
import _ from 'lodash';

export function GridPanel(props) {
	const {
			editorType,
			disableTitleChange = false,
			selectorSelected,
		} = props,
		originalTitle = props.title,
		WhichGrid = (editorType === EDITOR_TYPE_INLINE) ? InlineGridEditor : Grid,
		[isReady, setIsReady] = useState(disableTitleChange),
		[title, setTitle] = useState(originalTitle);

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