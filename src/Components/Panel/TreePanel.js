import Panel from './Panel.js';
import Tree, { WindowedTreeEditor, SideTreeEditor, } from '../Tree/Tree.js';
import {
	EDITOR_TYPE__WINDOWED,
	EDITOR_TYPE__SIDE,
} from '../../Constants/Editor.js';
import _ from 'lodash';

export function TreePanel(props) {
	const {
			isEditor = false,
			editorType = EDITOR_TYPE__WINDOWED,
		} = props;

	let WhichTree = Tree;
	if (isEditor) {
		switch(editorType) {
			case EDITOR_TYPE__WINDOWED:
				WhichTree = WindowedTreeEditor;
				break;
			case EDITOR_TYPE__SIDE:
				WhichTree = SideTreeEditor;
				break;
		}
	}

	return <Panel {...props._panel}>
				<WhichTree {...props} {...props._tree} />
			</Panel>;
}

export default TreePanel;