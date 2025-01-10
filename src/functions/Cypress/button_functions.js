import 'cypress-if'; // for clickButtonIfExists only!
import {
	getDomNode,
	getDomNodes,
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
	return clickButtonIfEnabled(parentSelectors, 'xBtn', true);
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
	return clickButtonIfExists(parentSelectors, 'toEditBtn');
}
export function clickToViewButton(parentSelectors) {
	cy.log('clickToViewButton');
	return clickButton(parentSelectors, 'toViewBtn');
}
export function clickToViewButtonIfExists(parentSelectors) {
	cy.log('clickToViewButtonIfExists');
	return clickButtonIfExists(parentSelectors, 'toViewBtn');
}
export function toFullMode(parentSelectors) {
	cy.log('toFullMode');
	return clickButton(parentSelectors, 'fullModeBtn');
}
export function toSideMode(parentSelectors) {
	cy.log('toSideMode');
	return clickButton(parentSelectors, 'sideModeBtn');
}
export function clickButton(parentSelectors, name) { // requires the button to be enabled
	if (_.isString(parentSelectors)) {
		parentSelectors = [parentSelectors];
	}
	cy.log('clickButton ' + name);
	return getDomNode([...parentSelectors, name])
				.should('not.have.attr', 'data-disabled', 'true') // Check that the element is not disabled
				.click({ force: true });
}
export function clickButtonIfEnabled(parentSelectors, name) { // allows button to be disabled
	if (_.isString(parentSelectors)) {
		parentSelectors = [parentSelectors];
	}
	return getDomNode([...parentSelectors, name])
				.click({ force: true });
}
export function clickButtonIfExists(parentSelectors, name) {
	if (_.isString(parentSelectors)) {
		parentSelectors = [parentSelectors];
	}
	return getDomNode([...parentSelectors, name]).if().then((node) => { // NOTE if() is a cypress-if function
		if (node) {
			node.click();
		}
	});
}