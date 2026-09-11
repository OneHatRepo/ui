import {
	INTERNAL_HOC_PROPS_META_KEY,
	getInternalHocPropNames,
} from './internalHocProps.js';
import { Platform } from 'react-native';

const INTERNAL_WEB_TEST_ID_PROP = '__onehatTestId';

function toWebDataAttributeName(key) {
	if (!key || typeof key !== 'string') {
		return null;
	}

	return `data-${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}`;
}

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

export default function omitInternalHocProps(props = {}, options = {}) {
	if (!props || typeof props !== 'object') {
		return props;
	}

	const isDomPrimitive = !!options.isDomPrimitive;

	const dynamicallyInjectedHocNames = new Set(getInternalHocPropNames(props));
	const fallbackWebTestId = Platform.OS === 'web' && props[INTERNAL_WEB_TEST_ID_PROP]
		? `${props[INTERNAL_WEB_TEST_ID_PROP]}`
		: null;

	const sanitizedProps = {};
	for (const key of Object.keys(props)) {
		if (key === INTERNAL_WEB_TEST_ID_PROP) {
			continue;
		}

		if (Platform.OS === 'web' && key === 'testID') {
			if (isDomPrimitive) {
				if (!sanitizedProps['data-testid'] && props[key]) {
					sanitizedProps['data-testid'] = `${props[key]}`;
				}
				continue;
			}

			sanitizedProps.testID = props[key];
			if (!sanitizedProps['data-testid'] && props[key]) {
				sanitizedProps['data-testid'] = `${props[key]}`;
			}
			continue;
		}

		if (Platform.OS === 'web' && key === 'dataSet' && props[key] && typeof props[key] === 'object') {
			if (!isDomPrimitive) {
				sanitizedProps.dataSet = {
					...(sanitizedProps.dataSet || {}),
					...props[key],
				};
				continue;
			}

			for (const dataSetKey of Object.keys(props[key])) {
				const attrName = toWebDataAttributeName(dataSetKey);
				if (!attrName) {
					continue;
				}

				const value = props[key][dataSetKey];
				if (value === undefined || value === null) {
					continue;
				}

				sanitizedProps[attrName] = `${value}`;
			}
			continue;
		}

		if (shouldOmitInternalHocProp(key, dynamicallyInjectedHocNames)) {
			continue;
		}
		sanitizedProps[key] = props[key];
	}

	if (fallbackWebTestId) {
		if (!sanitizedProps['data-testid']) {
			sanitizedProps['data-testid'] = fallbackWebTestId;
		}

		if (!isDomPrimitive && !sanitizedProps.testID) {
			sanitizedProps.testID = fallbackWebTestId;
		}
	}

	for (const symbol of Object.getOwnPropertySymbols(props)) {
		sanitizedProps[symbol] = props[symbol];
	}

	return sanitizedProps;
}
