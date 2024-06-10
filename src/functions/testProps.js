import { Platform } from "react-native";

// This adds a data-testid attribute to the DOM node,
// which can be quried in Cypress by: document.querySelector(`[data-testid='MyTestId']`);

export default function testProps(id) {
	if (typeof __DEV__ === 'undefined' || !__DEV__) {
		return {}; // don't add test props in production
	}
	if (id?.reference) {
		// id is actually 'self' object
		id = id.reference;
	}
	if (id.match(/\s/g)) {
		id = id.replace(/\s/g, '_'); // convert any spaces to underscores
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