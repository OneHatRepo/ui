import { useEffect, useState, } from 'react';
import Panel from './Panel';
import Grid, { InlineGridEditor, } from '../Grid/Grid';
import {
	EDITOR_TYPE_INLINE,
	EDITOR_TYPE_WINDOWED,
} from '../../Constants/EditorTypes';
import withData from '../Hoc/withData';
import _ from 'lodash';

export function GridPanel(props) {
	const {
			editorType,
			disableTitleChange = false,
			selectorSelected,
		} = props,
		originalTitle = props.title,
		WhichGrid = (editorType === EDITOR_TYPE_INLINE) ? InlineGridEditor : Grid,
		[title, setTitle] = useState(originalTitle);

	useEffect(() => {
		if (!disableTitleChange && originalTitle) {
			if (selectorSelected) {
				setTitle(originalTitle + ' for ' + selectorSelected.displayValue);
			} else {
				setTitle(originalTitle);
			}
		}
	}, [selectorSelected, disableTitleChange, originalTitle]);

	return <Panel {...props} title={title}>
				<WhichGrid {...props} />
			</Panel>;
}

export default withData(GridPanel);