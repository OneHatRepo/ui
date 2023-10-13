import Panel from './Panel.js';
import Report from '../Report/Report.js';
import _ from 'lodash';

export function ReportPanel(props) {
	if (!props._panel) {
		props._panel = {};
	}

	return <Panel {...props} {...props._panel}>
				<Report {...props} />
			</Panel>;
}

export default ReportPanel;