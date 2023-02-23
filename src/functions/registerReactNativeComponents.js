import UiGlobals from '../UiGlobals.js';
import Datetime from '../PlatformImports/ReactNative/Datetime';
import Draggable from '../PlatformImports/ReactNative/Draggable';
import _ from 'lodash';

export function registerReactNativeComponents() {
	_.merge(UiGlobals.components, {
		Datetime,
		Draggable,
	});
}