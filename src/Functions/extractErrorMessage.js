import _ from 'lodash';

// AI generated function to extract the first meaningful error message 
// from various possible error structures

export default function extractErrorMessage(...args) {
	const queue = [...args];
	const seen = new Set();

	while (queue.length) {
		const current = queue.shift();
		if (_.isNil(current)) {
			continue;
		}
		if (_.isString(current)) {
			const value = current.trim();
			if (value) {
				return value;
			}
			continue;
		}
		if (_.isArray(current)) {
			queue.push(...current);
			continue;
		}
		if (!_.isObject(current)) {
			continue;
		}
		if (seen.has(current)) {
			continue;
		}
		seen.add(current);

		const candidates = [
			current.message,
			current.msg,
			current.error,
			current.errorMessage,
			current.detail,
			current.details,
			current.response?.data?.message,
			current.response?.data?.error,
			current.response?.data?.detail,
			current.response?.data?.details,
		];
		queue.push(...candidates);
	}

	return '';
}
