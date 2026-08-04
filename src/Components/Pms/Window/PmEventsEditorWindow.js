import UiGlobals from '../../../UiGlobals.js';
import Panel from '../../Panel/Panel.js';
import useAdjustedWindowSize from '../../../Hooks/useAdjustedWindowSize.js';
import PmEventsEditor from '../Editor/PmEventsEditor.js';

export default function PmEventsEditorWindow(props) {
	const
		styles = UiGlobals.styles,
		[width, height] = useAdjustedWindowSize(500, 600);
	
	return <Panel
				{...props}
				reference="PmEventsEditorWindow"
				isCollapsible={false}
				model="PmEvents"
				titleSuffix={props.editorMode === 'EDITOR_MODE__VIEW' || props.isEditorViewOnly ? ' Viewer' : ' Editor'}
				bg="#fff"
				w={width}
				h={height}
				flex={null}
			>
				<PmEventsEditor {...props} />
			</Panel>;
}

