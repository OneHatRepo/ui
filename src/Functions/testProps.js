import { Platform } from "react-native";
import UiGlobals from '../UiGlobals.js';
import _ from 'lodash';

/*
This adds testID attribute

Target Platform    Native Component Attribute Under the Hood
web                data-testid (queried in Cypress by: document.querySelector(`[data-testid='MyTestId']`);)
iOS                accessibilityIdentifier
Android            resource-id
*/

export default function testProps(id, suffix) {

	// testProps should be able to be called twice in succession, so the input needs to handle the output correctly
	if (_.isObject(id)) {
		if (id.testID) {
			id = id.testID;
		} else if (id.__onehatTestId) {
			id = id.__onehatTestId;
		} else if (id.dataSet?.testid) {
			id = id.dataSet.testid;
		} else if (id.dataset?.testid) {
			id = id.dataset.testid;
		} else if (id['data-testid']) {
			id = id['data-testid'];
		} else if (id.id) {
			id = id.id;
		} else if (id?.path) { // id is actually 'self' object
			id = id.path;
		} else if (id?.reference) { // id is actually 'self' object
			id = id.reference;
		}
	}

	if (!id) {
		return {};
	}
	if (!_.isString(id)) {
		id = `${id}`;
	}
	if (id.match(/\s/g)) {
		id = id.replace(/\s/g, '_'); // convert any spaces to underscores
	}
	if (suffix) {
		id += suffix; // this is used in conjunction with 'self' object
	}
	if (Platform.OS === 'web') {
		return {
			__onehatTestId: id,
			dataSet: {
				testid: id,
			},
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