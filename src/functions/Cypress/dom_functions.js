
/**
 * Get the first DOM node matching the nested selectors.
 * (Note: it gets the first matching element from each selector, not just the last one.)
 * @argument {string | string[]} selectors - data-testid attribute values
 * If an array is given, these will be considered nested selectors.
 * e.g. ['parent', 'child'] will be converted to '[data-testid="parent"] [data-testid="child"]'
 * @return Cypress chainer
 */
export function getDomNode(selectors) {
	return cy.get(getTestIdSelectors(selectors, true));
}

/**
 * Get *all* DOM nodes matching the nested selectors.
 * @argument {string | string[]} selectors - data-testid attribute values
 * If an array is given, these will be considered nested selectors.
 * e.g. ['parent', 'child'] will be converted to '[data-testid="parent"] [data-testid="child"]'
 * @return Cypress chainer
 */
export function getDomNodes(selectors) {
	return cy.get(getTestIdSelectors(selectors));
}

/**
 * Builds selector string for data-testid attributes.
 * @argument {string | string[]} selectors - data-testid attribute values
 * If an array is given, these will be considered nested selectors.
 * e.g. ['parent', 'child'] will be converted to '[data-testid="parent"] [data-testid="child"]'
 * @return {string}
 */
export function getTestIdSelectors(selectors, isGetFirst = false) {
	if (_.isString(selectors)) {
		selectors = [selectors];
	}
	const selectorParts = _.map(selectors, (selector) => {
		if (selector.match(/=/)) { // selector is something like [role="switch"], so don't use data-testid
			return selector;
		}
		return '[data-testid="' + selector + '"]' + (isGetFirst ? ':first' : '');
	});
	return selectorParts.join(' ');
}
