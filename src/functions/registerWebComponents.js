import UiGlobals from '../UiGlobals.js';
import Attachments from '../PlatformImports/Web/Attachments.js';
// import CKEditor from '../Components/Form/Field/CKEditor/CKEditor.js';
import Datetime from '../PlatformImports/Web/Datetime.js';
import Draggable from '../PlatformImports/Web/Draggable.js';
import File from '../PlatformImports/Web/File.js';
import JsonEditor from '../PlatformImports/Web/JsonEditor.js';
import JsonViewer from '../PlatformImports/Web/JsonViewer.js';
import useWindowSize from '../PlatformImports/Web/useWindowSize.js';
import _ from 'lodash';

export default function registerWebComponents() {
	_.merge(UiGlobals.components, {
		Attachments,
		// CKEditor, // The CKEditor was giving me CSS import errors, so had to disable it until I can fix those
		Datetime,
		Draggable,
		File,
		JsonEditor,
		JsonViewer,
		useWindowSize,
	});
}