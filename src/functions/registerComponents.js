import UiGlobals from '../UiGlobals.js';

export default function registerComponents(newComponents) {
	_.merge(UiGlobals.components, newComponents);
}