import UiGlobals from '../../../UiGlobals.js';
import Panel from '../../Panel/Panel.js';
import useAdjustedWindowSize from '../../../Hooks/useAdjustedWindowSize.js';
import BumpPmsEditor from '../Editor/BumpPmsEditor.js';

export default function BumpPmsEditorWindow(props) {
	const
		styles = UiGlobals.styles,
		[width, height] = useAdjustedWindowSize(500, 600);
	
	return <Panel
				reference="BumpPmsEditorWindow"
				isCollapsible={false}
				model="PmEvents"
				title={'Add "Bump" PM Event'}
				bg="#fff"
				{...props}
				w={width}
				h={height}
				flex={null}
			>
				<BumpPmsEditor {...props} />
			</Panel>;
}

