import * as yup from 'yup';
import _ from 'lodash';

export default function json(isRequired = false) {
	return yup.mixed().test(
		'is-json',
		'${path} is not valid JSON',
		value => {
			try {
				const json = JSON.parse(value);
				// Valid JSON
				if (isRequired && _.isEmpty(json)) {
					return false; // Empty JSON
				}
				return true;
			} catch (error) {
				return false; // Invalid JSON
			}
		}
	);
}
