import TabBar from '../Tab/TabBar.js'
import Panel from './Panel.js';


export default function TabPanel(props) {
	return <Panel className="w-full flex" {...props._panel}>
				<TabBar {...props} />
			</Panel>;
}