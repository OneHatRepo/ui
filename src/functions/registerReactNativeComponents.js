import UiGlobals from '../UiGlobals.js';
import Datetime from '../PlatformImports/ReactNative/Datetime';
import Draggable from '../PlatformImports/ReactNative/Draggable';
import ScreenContainer from '../Components/Container/ScreenContainer';
import _ from 'lodash';

export default function registerReactNativeComponents() {
	_.merge(UiGlobals.components, {
		Datetime,
		Draggable,
		ScreenContainer,
	});
}