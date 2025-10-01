/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */

import { ComboEditor } from './Combo.js';
import AttachmentsEditorWindow from '../../../Window/AttachmentsEditorWindow.js';

function AttachmentsComboEditor(props) {
	return <ComboEditor
				reference="AttachmentsComboEditor"
				model="Attachments"
				uniqueRepository={true}
				Editor={AttachmentsEditorWindow}
				usePermissions={true}
				{...props}
			/>;
}

export default AttachmentsComboEditor;