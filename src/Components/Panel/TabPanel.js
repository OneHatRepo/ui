import TabBar from '../Tab/TabBar.js'
import Panel from './Panel.js';


export default function TabPanel(props) {
	const panelProps = props._panel || {};
	return <Panel className="w-full flex" {...panelProps}>
				<TabBar {...props} {...props._tab} />
			</Panel>;
}