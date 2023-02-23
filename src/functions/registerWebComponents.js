import UiGlobals from '../UiGlobals.js';
import CKEditor from '../Components/Form/Field/CKEditor/CKEditor.js';
import Datetime from '../PlatformImports/Web/Datetime.js';
import Draggable from '../PlatformImports/Web/Draggable.js';
import _ from 'lodash';

export default function registerWebComponents() {
	_.merge(UiGlobals.components, {
		CKEditor,
		Datetime,
		Draggable,
	});
}