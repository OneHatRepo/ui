import {
	REPORT_TYPES__EXCEL,
	REPORT_TYPES__PDF,
} from '../Constants/ReportTypes.js';
import downloadInBackground from './downloadInBackground.js';
import downloadWithFetch from './downloadWithFetch.js';
import {
	getUserToken,
	getRepositoryAuthHeaders,
} from './authFunctions.js';
import UiGlobals from '../UiGlobals.js';
import _ from 'lodash';



// keeps safe serializable values (primitives, arrays, plain objects, Date to ISO), 
// and removes cyclic/non-plain references, preventing "RangeError: Cyclic object value" errors.
const sanitizeReportData = (value, seen = new WeakSet()) => {
	if (value == null) {
		return value;
	}

	const valueType = typeof value;
	if (
		valueType === 'string'
		|| valueType === 'number'
		|| valueType === 'boolean'
	) {
		return value;
	}
	if (valueType === 'bigint') {
		return value.toString();
	}
	if (valueType === 'function' || valueType === 'symbol') {
		return undefined;
	}

	if (value instanceof Date) {
		return value.toISOString();
	}

	if (valueType !== 'object') {
		return undefined;
	}

	if (seen.has(value)) {
		return undefined;
	}
	seen.add(value);

	if (Array.isArray(value)) {
		const output = [];
		for (const item of value) {
			const sanitized = sanitizeReportData(item, seen);
			if (sanitized !== undefined) {
				output.push(sanitized);
			}
		}
		seen.delete(value);
		return output;
	}

	if (!_.isPlainObject(value)) {
		seen.delete(value);
		return undefined;
	}

	const output = {};
	for (const [key, item] of Object.entries(value)) {
		const sanitized = sanitizeReportData(item, seen);
		if (sanitized !== undefined) {
			output[key] = sanitized;
		}
	}
	seen.delete(value);
	return output;
};

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
		sanitizedData = sanitizeReportData(data) || {},
		params = {
			report_id: reportId,
			outputFileType: reportType,
			showReportHeaders,
			...sanitizedData,
		},
		user = UiGlobals?.redux?.getState ? UiGlobals.redux.getState()?.auth?.user : null,
		token = getUserToken(user),
		authHeaders = getRepositoryAuthHeaders(token);

	if (reportType === REPORT_TYPES__EXCEL) {
		return downloadInBackground(url, params, authHeaders);
	} else {
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...authHeaders,
			},
			body: JSON.stringify(params),
		};
		return downloadWithFetch(url, options);
	}
};