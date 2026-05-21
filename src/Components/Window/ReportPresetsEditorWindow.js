/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */
import UiGlobals from '../../UiGlobals.js';
import Panel from '../Panel/Panel.js';
import useAdjustedWindowSize from '../../Hooks/useAdjustedWindowSize.js';
import ReportPresetsEditor from '../Editor/ReportPresetsEditor.js';

export default function ReportPresetsEditorWindow(props) {
	const {
			style, // prevent it being passed to Editor
			...propsToPass
		} = props,
		styles = UiGlobals.styles,
		[width, height] = useAdjustedWindowSize(styles.DEFAULT_WINDOW_WIDTH, styles.DEFAULT_WINDOW_HEIGHT);
	
	return <Panel
				{...props}
				reference="ReportPresetsEditorWindow"
				isCollapsible={false}
				model="ReportPresets"
				titleSuffix={props.editorMode === 'EDITOR_MODE__VIEW' || props.isEditorViewOnly ? ' Viewer' : ' Editor'}
				className="ReportPresetsEditorWindow bg-white p-0"
				isWindow={true}
				w={width}
				h={height}
				flex={null}
			>
				<ReportPresetsEditor {...propsToPass} />
			</Panel>;
}
