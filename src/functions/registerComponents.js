import UiGlobals from '../UiGlobals.js';
import _ from 'lodash';

export default function registerComponents(newComponents) {
	_.merge(UiGlobals.components, newComponents);
}
