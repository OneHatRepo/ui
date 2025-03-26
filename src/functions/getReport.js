import {
	REPORT_TYPES__EXCEL,
	REPORT_TYPES__PDF,
} from '../constants/ReportTypes.js';
import downloadInBackground from './downloadInBackground.js';
import downloadWithFetch from './downloadWithFetch.js';
import UiGlobals from '../UiGlobals.js';

export default function getReport(args) {
	const {
			reportId,
			data = {},
			reportType = REPORT_TYPES__EXCEL,
			showReportHeaders = true,
		} = args;

	if (!reportId) {
		throw Error('downloadReport: report_id is required');
	}

	const
		url = UiGlobals.baseURL + 'Reports/getReport',
		params = {
			report_id: reportId,
			outputFileType: reportType,
			showReportHeaders,
			...data,
		};

	if (reportType === REPORT_TYPES__EXCEL) {
		downloadInBackground(url, params);
	} else {
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(params),
		};
		downloadWithFetch(url, options);
	}
};