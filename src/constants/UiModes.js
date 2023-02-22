import { isBrowser, isNode, isWebWorker, isJsDom, isDeno } from "browser-or-node";


export const UI_MODE_WEB = 'UI_MODE_WEB';
export const UI_MODE_REACT_NATIVE = 'UI_MODE_REACT_NATIVE';

export let CURRENT_MODE;
if (isBrowser || isWebWorker) {
	CURRENT_MODE = UI_MODE_WEB;
} else if (isNode) {
	CURRENT_MODE = UI_MODE_REACT_NATIVE;
}
