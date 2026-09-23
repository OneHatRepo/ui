import _ from 'lodash';

export default function isEmptyValue(value, options = {}) {
	const {
		treatZeroAsEmpty = false,
	} = options;

	return value === null ||
			value === undefined ||
			value === '' ||
			(treatZeroAsEmpty && value === 0) ||
			(_.isObject(value) && _.isEmpty(value));
}
