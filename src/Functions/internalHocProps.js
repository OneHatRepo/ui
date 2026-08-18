import _ from 'lodash';

export const INTERNAL_HOC_PROPS_META_KEY = '__onehatInternalHocProps';

export function getInternalHocPropNames(props = {}) {
	const names = props?.[INTERNAL_HOC_PROPS_META_KEY];
	if (!_.isArray(names)) {
		return [];
	}
	return _.uniq(_.filter(names, _.isString));
}

export function withInjectedHocProps(baseProps = {}, injectedProps = {}) {
	const existing = getInternalHocPropNames(baseProps);
	const injectedNames = Object.keys(injectedProps);

	return {
		...baseProps,
		...injectedProps,
		[INTERNAL_HOC_PROPS_META_KEY]: _.uniq([
			...existing,
			...injectedNames,
		]),
	};
}
