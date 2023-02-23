import UiGlobals from '../UiGlobals.js';
import CKEditor from '../Components/Form/Field/CKEditor/CKEditor.js';
import _ from 'lodash';

export function registerWebComponents() {
	_.merge(UiGlobals.components, {
		CKEditor,
	});
}