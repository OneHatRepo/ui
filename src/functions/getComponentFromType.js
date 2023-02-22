import UiGlobals from '../UiGlobals.js';

export default function getComponentFromType(type) {
	if (_.isString(type)) {
		if (UiGlobals.components[type]) {
			return UiGlobals.components[type];
		}
		throw new Error('No mapping for ' + type + ' exists!');
	}
	return type;
}
