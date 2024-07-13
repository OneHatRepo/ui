import * as yup from 'yup';

export default function json() {
	return yup.mixed().test(
		'is-json',
		'${path} is not valid JSON',
		value => {
			try {
				JSON.parse(value);
				return true; // Valid JSON
			} catch (error) {
				return false; // Invalid JSON
			}
		}
	);
}
