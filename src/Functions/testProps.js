import { Platform } from "react-native";
import UiGlobals from '../UiGlobals.js';

// This adds a data-testid attribute to the DOM node,
// which can be quried in Cypress by: document.querySelector(`[data-testid='MyTestId']`);

export default function testProps(id, suffix) {
	if (!UiGlobals.debugMode) {
		return {};
	}
	if (id?.path) { // id is actually 'self' object
		id = id.path;
	} else if (id?.reference) { // id is actually 'self' object
		id = id.reference;
	}
	if (!id) {
		return {};
	}
	if (id.match(/\s/g)) {
		id = id.replace(/\s/g, '_'); // convert any spaces to underscores
	}
	if (suffix) {
		id += suffix; // this is used in conjunction with 'self' object
	}
	if (!window && Platform.OS === 'android') {
		return {
			accessibilityLabel: id,
			accessible: true,
		};
	}
	return {
		testID: id,
	};
}

export function pickerTestProps(id) {
	return {
		pickerProps: {...testProps(id + 'Picker')},
		touchableWrapperProps: {...testProps(id + 'Trigger')},
		touchableDoneProps: {...testProps(id + 'Done')},
	};
}