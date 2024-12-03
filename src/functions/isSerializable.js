export default function isSerializable(value, seen = new WeakSet()) {
	// Handle primitive types that are serializable or explicitly unserializable
	if (value === null || typeof value === 'boolean' || typeof value === 'string' || typeof value === 'number') {
		return true;
	}
	if (typeof value === 'undefined' || typeof value === 'function' || typeof value === 'symbol' || typeof value === 'bigint') {
		return false;
	}

	// Handle objects (including arrays)
	if (typeof value === 'object') {
		// Check for circular references
		if (seen.has(value)) {
			return false;
		}
		seen.add(value);

		for (const key in value) {
			if (!isSerializable(value[key], seen)) {
				return false;
			}
		}
	}

	return true;
}