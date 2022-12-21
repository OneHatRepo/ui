import { Platform } from "react-native";

export default function testProps(id) {
	if (typeof __DEV__ !== 'undefined' && !__DEV__) {
		return {};
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