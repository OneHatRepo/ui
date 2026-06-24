/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */

import ArrayCombo from './ArrayCombo.js';
import {
	REPORT_QUEUE_STATUS__ALL,
	REPORT_QUEUE_STATUS__COMPLETED,
	REPORT_QUEUE_STATUS__FAILED,
	REPORT_QUEUE_STATUS__IN_PROCESS,
	REPORT_QUEUE_STATUS__PENDING,
} from '../../../../Constants/ReportQueueStatuses.js';

const data = [
	[REPORT_QUEUE_STATUS__ALL, 'All'],
	[REPORT_QUEUE_STATUS__PENDING, 'Only Pending'],
	[REPORT_QUEUE_STATUS__IN_PROCESS, 'Only In Process'],
	[REPORT_QUEUE_STATUS__FAILED, 'Only Failures'],
	[REPORT_QUEUE_STATUS__COMPLETED, 'Only Completed'],
];

function ReportQueueStatusesCombo(props) {
	return <ArrayCombo
				data={data}
				disableDirectEntry={true}
				{...props}
			/>;
}

export default ReportQueueStatusesCombo;
