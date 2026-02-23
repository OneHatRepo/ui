// This function takes a nested JSON object and flattens it into a single-level object with dot notation keys.
// For example, { a: { b: 1 } } becomes { 'a.b': 1 }
// or { a: [ { b: 1 }, { c: 2 } ] } becomes { 'a.0.b': 1, 'a.1.c': 2 }
function isPlainObject(value) {
	if (value === null || typeof value !== 'object') {
		return false;
	}

	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
}

export default function flatten(obj, prefix = '', result = {}) {
	if (obj === null || typeof obj !== 'object') {
		return result;
	}

	for (const key of Object.keys(obj)) {
		const
			newKey = prefix ? `${prefix}.${key}` : key,
			value = obj[key];

		if (isPlainObject(value)) {
			flatten(value, newKey, result);
		} else if (Array.isArray(value)) {
			value.forEach((item, index) => {
				const arrayKey = `${newKey}.${index}`;
				if (isPlainObject(item) || Array.isArray(item)) {
					flatten(item, arrayKey, result);
				} else {
					result[arrayKey] = item;
				}
			});
		} else {
			result[newKey] = value;
		}
	}
	return result;
}