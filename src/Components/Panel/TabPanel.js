import TabBar from '../Tab/TabBar.js'
import Panel from './Panel.js';


export default function TabPanel(props) {
	const {
			_panel = {},
			_tab = {},
		} = props;
	return <Panel className="w-full flex" {..._panel}>
				<TabBar {...props} {..._tab} />
			</Panel>;
}