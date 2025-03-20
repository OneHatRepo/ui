import { isReactNative, isBrowser, isWebWorker, } from '../Functions/PlatformDetector.js';


export const UI_MODE_WEB = 'Web';
export const UI_MODE_NATIVE = 'Native';
export const UI_MODE_REACT_NATIVE = 'Native'; // for backward compatibility

export let CURRENT_MODE;
if (isBrowser || isWebWorker) {
	CURRENT_MODE = UI_MODE_WEB;
} else if (isReactNative) {
	CURRENT_MODE = UI_MODE_NATIVE;
}
