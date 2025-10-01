/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */
import UiGlobals from '../../UiGlobals.js';
import Panel from '../Panel/Panel.js';
import useAdjustedWindowSize from '../../Hooks/useAdjustedWindowSize.js';
import AttachmentDirectoriesEditor from '../Editor/AttachmentDirectoriesEditor.js';

export default function AttachmentDirectoriesEditorWindow(props) {
	const {
			style, // prevent it being passed to Editor
			...propsToPass
		} = props,
		styles = UiGlobals.styles,
		[width, height] = useAdjustedWindowSize(styles.DEFAULT_WINDOW_WIDTH, styles.DEFAULT_WINDOW_HEIGHT);
	
	return <Panel
				{...props}
				reference="AttachmentDirectoriesEditorWindow"
				isCollapsible={false}
				model="AttachmentDirectories"
				titleSuffix={props.editorMode === 'EDITOR_MODE__VIEW' || props.isEditorViewOnly ? ' Viewer' : ' Editor'}
				className="AttachmentDirectoriesEditorWindow bg-white p-0"
				isWindow={true}
				w={width}
				h={height}
				flex={null}
			>
				<AttachmentDirectoriesEditor {...propsToPass} />
			</Panel>;
}
