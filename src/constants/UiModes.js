import { isBrowser, isNode, isWebWorker, } from '../Functions/PlatformDetector.js';


export const UI_MODE_WEB = 'Web';
export const UI_MODE_REACT_NATIVE = 'ReactNative';

export let CURRENT_MODE;
if (isBrowser || isWebWorker) {
	CURRENT_MODE = UI_MODE_WEB;
} else if (isNode) {
	CURRENT_MODE = UI_MODE_REACT_NATIVE;
}
