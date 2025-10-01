/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */

import { TagEditor } from './Tag.js';
import AttachmentDirectoriesEditorWindow from '../../../Window/AttachmentDirectoriesEditorWindow.js';

function AttachmentDirectoriesTagEditor(props) {
	return <TagEditor
				reference="AttachmentDirectoriesTagEditor"
				model="AttachmentDirectories"
				uniqueRepository={true}
				Editor={AttachmentDirectoriesEditorWindow}
				usePermissions={true}
				{...props}
			/>;
}

export default AttachmentDirectoriesTagEditor;