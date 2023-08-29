import Panel from './Panel.js';
import Grid, { InlineGridEditor, WindowedGridEditor, SideGridEditor, } from '../Grid/Grid.js';
import {
	EDITOR_TYPE__INLINE,
	EDITOR_TYPE__WINDOWED,
	EDITOR_TYPE__SIDE,
} from '../../Constants/Editor.js';
import _ from 'lodash';

export function GridPanel(props) {
	const {
			isEditor = false,
			editorType = EDITOR_TYPE__WINDOWED,
		} = props;

	let WhichGrid = Grid;
	if (isEditor) {
		switch(editorType) {
			case EDITOR_TYPE__INLINE:
				WhichGrid = InlineGridEditor;
				break;
			case EDITOR_TYPE__WINDOWED:
				WhichGrid = WindowedGridEditor;
				break;
			case EDITOR_TYPE__SIDE:
				WhichGrid = SideGridEditor;
				break;
		}
	}

	if (!props._panel) {
		props._panel = {};
	}

	return <Panel {...props} {...props._panel}>
				<WhichGrid {...props} />
			</Panel>;
}

export default GridPanel;