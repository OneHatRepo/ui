import TabBar from '../Tab/TabBar.js'
import Panel from './Panel.js';


export default function TabPanel(props) {
	return <Panel flex={1} w="100%" {...props._panel}>
				<TabBar {...props} />
			</Panel>;
}