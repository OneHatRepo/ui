/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */

import Tag from './Tag.js';
import AttachmentDirectoriesEditorWindow from '../../../Window/AttachmentDirectoriesEditorWindow.js';

function AttachmentDirectoriesTag(props) {
	return <Tag
				reference="AttachmentDirectoriesTag"
				model="AttachmentDirectories"
				uniqueRepository={true}
				Editor={AttachmentDirectoriesEditorWindow}
				usePermissions={true}
				{...props}
			/>;
}

export default AttachmentDirectoriesTag;