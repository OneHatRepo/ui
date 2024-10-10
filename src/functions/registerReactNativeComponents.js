import UiGlobals from '../UiGlobals.js';
import Datetime from '../PlatformImports/ReactNative/Datetime';
import Draggable from '../PlatformImports/ReactNative/Draggable';
import JsonEditor from '../PlatformImports/ReactNative/JsonEditor.js';
import ScreenContainer from '../Components/Container/ScreenContainer';
import useWindowSize from '../PlatformImports/ReactNative/useWindowSize.js';
import _ from 'lodash';

export default function registerReactNativeComponents() {
	_.merge(UiGlobals.components, {
		Datetime,
		Draggable,
		JsonEditor,
		ScreenContainer,
		useWindowSize,
	});
}