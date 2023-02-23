import UiGlobals from '../UiGlobals.js';
import CKEditor from '../PlatformImports/ReactNative/CKEditor';
import Datetime from '../PlatformImports/ReactNative/Datetime';
import Draggable from '../PlatformImports/ReactNative/Draggable';
import ScreenContainer from '../Components/Container/ScreenContainer';
import _ from 'lodash';

export default function registerReactNativeComponents() {
	_.merge(UiGlobals.components, {
		CKEditor,
		Datetime,
		Draggable,
		ScreenContainer,
	});
}