import UiGlobals from '../UiGlobals.js';
import CKEditor from '../Components/Form/Field/CKEditor/CKEditor.js';
import Datetime from '../PlatformImports/Web/Datetime';
import Draggable from '../PlatformImports/Web/Draggable';
import _ from 'lodash';

export function registerWebComponents() {
	_.merge(UiGlobals.components, {
		CKEditor,
		Datetime,
		Draggable,
	});
}