/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */
import UiGlobals from '../../UiGlobals.js';
import Panel from '../Panel/Panel.js';
import useAdjustedWindowSize from '../../Hooks/useAdjustedWindowSize.js';
import AttachmentsEditor from '../Editor/AttachmentsEditor.js';

export default function AttachmentsEditorWindow(props) {
	const {
			style, // prevent it being passed to Editor
			...propsToPass
		} = props,
		styles = UiGlobals.styles,
		[width, height] = useAdjustedWindowSize(styles.DEFAULT_WINDOW_WIDTH, styles.DEFAULT_WINDOW_HEIGHT);
	
	return <Panel
				{...props}
				reference="AttachmentsEditorWindow"
				isCollapsible={false}
				model="Attachments"
				titleSuffix={props.editorMode === 'EDITOR_MODE__VIEW' || props.isEditorViewOnly ? ' Viewer' : ' Editor'}
				className="AttachmentsEditorWindow bg-white p-0"
				isWindow={true}
				w={width}
				h={height}
				flex={null}
			>
				<AttachmentsEditor {...propsToPass} />
			</Panel>;
}
