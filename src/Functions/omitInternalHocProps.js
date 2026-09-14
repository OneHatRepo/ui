import {
	INTERNAL_HOC_PROPS_META_KEY,
	getInternalHocPropNames,
} from './internalHocProps.js';

const INTERNAL_HOC_PROP_NAMES = new Set([
	// Keep non-HOC-view concerns that frequently leak to DOM/SVG and should never reach leaf UI primitives.
	'isEditable',
]);

const INTERNAL_HOC_PROP_PATTERNS = [
	/^disableWith[A-Z]/,
	/^alreadyHasWith[A-Z]/,
	/^secondaryDisableWith[A-Z]/,
	/^secondaryAlreadyHasWith[A-Z]/,
];

function shouldOmitInternalHocProp(propName, dynamicallyInjectedHocNames) {
	if (INTERNAL_HOC_PROP_NAMES.has(propName)) {
		return true;
	}

	if (dynamicallyInjectedHocNames?.has(propName)) {
		return true;
	}

	if (propName === INTERNAL_HOC_PROPS_META_KEY) {
		return true;
	}

	for (const pattern of INTERNAL_HOC_PROP_PATTERNS) {
		if (pattern.test(propName)) {
			return true;
		}
	}

	return false;
}

export default function omitInternalHocProps(props = {}) {
	if (!props || typeof props !== 'object') {
		return props;
	}

	const dynamicallyInjectedHocNames = new Set(getInternalHocPropNames(props));

	const sanitizedProps = {};
	for (const key of Object.keys(props)) {
		if (shouldOmitInternalHocProp(key, dynamicallyInjectedHocNames)) {
			continue;
		}
		sanitizedProps[key] = props[key];
	}

	for (const symbol of Object.getOwnPropertySymbols(props)) {
		sanitizedProps[symbol] = props[symbol];
	}

	return sanitizedProps;
}
