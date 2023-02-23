import UiGlobals from '../UiGlobals.js';
import _ from 'lodash';

export default function getComponentFromType(type) {
	if (_.isString(type)) {
		if (UiGlobals.components[type]) {
			return UiGlobals.components[type];
		}
		throw new Error('No mapping for ' + type + ' exists!');
	}
	return type;
}
