import { CURRENT_MODE } from './Constants/UiModes.js';
import _ from 'lodash';


const Globals = {
	mode: CURRENT_MODE,
	customInflect: (str) => str,

	// global defaults
	paginationIsShowMoreOnly: false,
	autoAdjustPageSizeToHeight: true,
};

export default Globals;

export function setGlobals(globals) {
	_.merge(Globals, globals);
}