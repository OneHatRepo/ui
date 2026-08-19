import _ from 'lodash';

export const INTERNAL_HOC_PROPS_META_KEY = '__onehatInternalHocProps';

export function getInternalHocPropNames(props = {}) {
	const names = props?.[INTERNAL_HOC_PROPS_META_KEY];
	if (!_.isArray(names)) {
		return [];
	}
	return _.uniq(_.filter(names, _.isString));
}

export function withInjectedHocProps(baseProps = {}, injectedProps = {}, options = {}) {
	const
		existing = getInternalHocPropNames(baseProps),
		injectedNames = Object.keys(injectedProps || {}),
		passthroughPropNames = _.uniq(_.filter(options?.passthroughPropNames, _.isString)),
		internalInjectedNames = _.filter(injectedNames, (name) => !passthroughPropNames.includes(name)),
		allInternalNames = _.uniq([
			...existing,
			...internalInjectedNames,
		]),
		mergedProps = {
			...baseProps,
			...injectedProps,
		};

	if (!allInternalNames.length) {
		return mergedProps;
	}

	// Keep metadata off enumerable props so plain prop spreading doesn't forward it.
	Object.defineProperty(mergedProps, INTERNAL_HOC_PROPS_META_KEY, {
		value: allInternalNames,
		enumerable: false,
		writable: true,
		configurable: true,
	});

	return mergedProps;
}
