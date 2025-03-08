import UiGlobals from '../UiGlobals.js';
import _ from 'lodash';

export default function registerComponents(newComponents) {
	_.assign(UiGlobals.components, newComponents); // use assign instead of merge, so that it overwrites existing properties; however this does not work recursively
}
