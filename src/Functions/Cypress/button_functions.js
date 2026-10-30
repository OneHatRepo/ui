import {
	getDomNode,
	getDomNodes,
	getDomNodeIfExists,
	getTestIdSelectors,
} from './dom_functions.js';
import _ from 'lodash';
const $ = Cypress.$;


export function clickAddButton(parentSelectors) {
	cy.log('clickAddButton');
	return clickButton(parentSelectors, 'addBtn');
}
export function clickSaveButton(parentSelectors) {
	cy.log('clickSaveButton');
	return clickButton(parentSelectors, 'saveBtn');
}
export function clickEditButton(parentSelectors) {
	cy.log('clickEditButton');
	return clickButton(parentSelectors, 'editBtn');
}
export function clickDeleteButton(parentSelectors) {
	cy.log('clickDeleteButton');
	return clickButton(parentSelectors, 'deleteBtn');
}
export function clickDuplicateButton(parentSelectors) {
	cy.log('clickDuplicateButton');
	return clickButton(parentSelectors, 'duplicateBtn');
}
export function clickReloadButton(parentSelectors) {
	cy.log('clickReloadButton');
	return clickButton(parentSelectors, 'reloadBtn');
}
export function clickCloseButton(parentSelectors) {
	cy.log('clickCloseButton');
	return clickButton(parentSelectors, 'closeBtn');
}
export function clickCancelButton(parentSelectors) {
	cy.log('clickCancelButton');
	return clickButton(parentSelectors, 'cancelBtn');
}
export function clickOkButton(parentSelectors) {
	cy.log('clickOkButton');
	return clickButton(parentSelectors, 'okBtn');
}
export function clickYesButton(parentSelectors) {
	cy.log('clickYesButton');
	return clickButton(parentSelectors, 'yesBtn');
}
export function clickNoButton(parentSelectors) {
	cy.log('clickNoButton');
	return clickButton(parentSelectors, 'noBtn');
}
export function clickExpandButton(parentSelectors) {
	cy.log('clickExpandButton');
	return clickButton(parentSelectors, 'expandBtn');
}
export function clickXButton(parentSelectors) {
	cy.log('clickXButton');
	return clickButton(parentSelectors, 'xBtn');
}
export function clickXButtonIfEnabled(parentSelectors) {
	cy.log('clickXButtonIfEnabled');
	return clickButtonIfEnabled(parentSelectors, 'xBtn');
}
export function clickClearFiltersButton(parentSelectors) {
	cy.log('clickClearFiltersButton');
	return clickButton(parentSelectors, 'clearFiltersBtn');
}
export function clickTrigger(parentSelectors) {
	cy.log('clickTrigger');
	return clickButton(parentSelectors, 'trigger');
}
export function clickToEditButton(parentSelectors) {
	cy.log('clickToEditButton');
	return clickButton(parentSelectors, 'toEditBtn');
}
export function clickToEditButtonIfExists(parentSelectors) {
	cy.log('clickToEditButtonIfExists');
	return clickButtonIfExists(parentSelectors, 'toEditBtn', { timeout: 5000 });
}
export function clickToViewButton(parentSelectors) {
	cy.log('clickToViewButton');
	return clickButton(parentSelectors, 'toViewBtn', { timeout: 5000 });
}
export function clickToViewButtonIfExists(parentSelectors) {
	cy.log('clickToViewButtonIfExists');
	return clickButtonIfExists(parentSelectors, 'toViewBtn', { timeout: 5000 });
}
export function toFullMode(parentSelectors) {
	cy.log('toFullMode');
	return clickButtonIfEnabled(parentSelectors, 'fullModeBtn');
}
export function toSideMode(parentSelectors) {
	cy.log('toSideMode');
	return clickButtonIfEnabled(parentSelectors, 'sideModeBtn');
}
export function clickButton(parentSelectors, name, options) { // requires the button to be enabled
	if (_.isString(parentSelectors)) {
		parentSelectors = [parentSelectors];
	}
	cy.log('clickButton ' + name);
	return getDomNode([...parentSelectors, name], options)
				.should('not.have.attr', 'data-disabled', 'true') // Check that the element is not disabled
				.click({ force: true });
}
export function clickButtonIfEnabled(parentSelectors, name, options) { // allows button to be disabled
	if (_.isString(parentSelectors)) {
		parentSelectors = [parentSelectors];
	}
	return getDomNode([...parentSelectors, name], options)
				.click({ force: true });
}

/**
 * Clicks a button if it exists within the specified parent selectors.
 * @param {string|string[]} parentSelectors - The parent selectors to scope the search.
 * @param {string} name - The test ID of the button to click.
 * @param {object} options - Optional settings for the click operation.
 * @param {number} options.timeout - Maximum time to wait for the button to appear.
 * @param {number} options.interval - Interval between retries.
 * @param {boolean} options.isSelectorsRaw - Whether the parent selectors are raw CSS selectors.
 * @param {boolean} options.checkDataDisabled - Whether to check the 'data-disabled' attribute.
 * @param {boolean} options.errorIfDisabled - Whether to throw an error if the button is disabled.
 * @param {function} options.callback - Callback function to execute after clicking the button.
 * @returns {Cypress.Chainable|null} - The clicked node or null if not found.
 */
export function clickButtonIfExists(parentSelectors, name, options) {
	if (_.isString(parentSelectors)) {
		parentSelectors = [parentSelectors];
	}

	Cypress.log({ name: 'clickButtonIfExists', message: 'name: ' + name + ', parentSelectors: ' + JSON.stringify(parentSelectors) });
	const
		timeout = options?.timeout ?? Cypress.config('defaultCommandTimeout'),
		interval = options?.interval ?? 100,
		startedAt = Date.now(),
		isSelectorsRaw = options?.isSelectorsRaw || false,
		shouldCheckDataDisabled = options?.checkDataDisabled ?? true,
		shouldErrorIfDisabled = options?.errorIfDisabled || false,
		callback = options?.callback,
		selector = isSelectorsRaw
			? ((_.isString(parentSelectors) ? parentSelectors : parentSelectors.join(' ')) + ' ' + getTestIdSelectors(name, true))
			: getTestIdSelectors([...parentSelectors, name], true);

	const findAndClick = () => cy.get('body', { log: false }).then(($body) => {
		const node = $body.find(selector).first();
		if (node.length) {
			Cypress.log({ name: 'clickButtonIfExists', message: 'found node' });
			const isDisabled = shouldCheckDataDisabled && _.toString(node.attr('data-disabled')).toLowerCase() === 'true';
			if (isDisabled) {
				Cypress.log({ name: 'clickButtonIfExists', message: 'found disabled node' });
				if (shouldErrorIfDisabled) {
					throw new Error('clickButtonIfExists found a disabled button: ' + selector);
				}
				return null;
			}

			return cy.wrap(node).click({ force: true }).then(() => {
				if (_.isFunction(callback)) {
					return callback(node);
				}
			}).then(() => {
				Cypress.log({ name: 'clickButtonIfExists', message: 'clicked node' });
				return node;
			});
		}

		if (Date.now() - startedAt >= timeout) {
			Cypress.log({ name: 'clickButtonIfExists', message: 'did not find node within timeout of ' + timeout });
			return null;
		}

		return cy.wait(interval, { log: false }).then(findAndClick);
	});

	return findAndClick();
}
