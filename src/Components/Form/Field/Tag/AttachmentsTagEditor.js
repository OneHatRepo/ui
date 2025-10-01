/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */

import { TagEditor } from './Tag.js';
import AttachmentsEditorWindow from '../../../Window/AttachmentsEditorWindow.js';

function AttachmentsTagEditor(props) {
	return <TagEditor
				reference="AttachmentsTagEditor"
				model="Attachments"
				uniqueRepository={true}
				Editor={AttachmentsEditorWindow}
				usePermissions={true}
				{...props}
			/>;
}

export default AttachmentsTagEditor;