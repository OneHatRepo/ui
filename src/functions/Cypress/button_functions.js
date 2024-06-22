
import {
	getDomNode,
	getDomNodes,
} from './dom_functions.js';
import _ from 'lodash';
const $ = Cypress.$;


export function clickAddButton(parentSelectors) {
	return clickButton(parentSelectors, 'addBtn');
}
export function clickSaveButton(parentSelectors) {
	return clickButton(parentSelectors, 'saveBtn');
}
export function clickEditButton(parentSelectors) {
	return clickButton(parentSelectors, 'editBtn');
}
export function clickDeleteButton(parentSelectors) {
	return clickButton(parentSelectors, 'deleteBtn');
}
export function clickDuplicateButton(parentSelectors) {
	return clickButton(parentSelectors, 'duplicateBtn');
}
export function clickReloadButton(parentSelectors) {
	return clickButton(parentSelectors, 'reloadPageBtn');
}
export function clickCloseButton(parentSelectors) {
	return clickButton(parentSelectors, 'closeBtn');
}
export function clickCancelButton(parentSelectors) {
	return clickButton(parentSelectors, 'cancelBtn');
}
export function clickOkButton(parentSelectors) {
	return clickButton(parentSelectors, 'okBtn');
}
export function clickYesButton(parentSelectors) {
	return clickButton(parentSelectors, 'yesBtn');
}
export function clickNoButton(parentSelectors) {
	return clickButton(parentSelectors, 'noBtn');
}
export function clickXButton(parentSelectors) {
	return clickButton(parentSelectors, 'xBtn');
}
export function clickTrigger(parentSelectors) {
	return clickButton(parentSelectors, 'trigger');
}
export function clickToEditButton(parentSelectors) {
	return clickButton(parentSelectors, 'toEditBtn');
}
export function clickToEditButtonIfExists(parentSelectors) {
	return clickButtonIfExists(parentSelectors, 'toEditBtn');
}
export function clickToViewButton(parentSelectors) {
	return clickButton(parentSelectors, 'toViewBtn');
}
export function clickToViewButtonIfExists(parentSelectors) {
	return clickButtonIfExists(parentSelectors, 'toViewBtn');
}
export function toFullMode(parentSelectors) {
	return clickButton(parentSelectors, 'fullModeBtn');
}
export function toSideMode(parentSelectors) {
	return clickButton(parentSelectors, 'sideModeBtn');
}
export function clickButton(parentSelectors, name) {
	if (_.isString(parentSelectors)) {
		parentSelectors = [parentSelectors];
	}
	return getDomNode([...parentSelectors, name])
				// .scrollIntoView()
				.click({ force: true });
}
export function clickButtonIfExists(parentSelectors, name) {
	if (_.isString(parentSelectors)) {
		parentSelectors = [parentSelectors];
	}
	return getDomNode([...parentSelectors, name]).then((node) => {
		if (node) {
			node.click();
		}
	});
}