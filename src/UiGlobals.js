import { isBrowser, isNode, isWebWorker, isJsDom, isDeno } from "browser-or-node";
import {
	UI_MODE_WEB,
	UI_MODE_REACT_NATIVE,
} from './Constants/UiModes.js';


const Globals = {
	mode: null,
};

if (isBrowser || isWebWorker) {
	Globals.mode = UI_MODE_WEB;
} else if (isNode) {
	Globals.mode = UI_MODE_REACT_NATIVE;
}

export default Globals;