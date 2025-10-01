/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */

import Tag from './Tag.js';
import AttachmentsEditorWindow from '../../../Window/AttachmentsEditorWindow.js';

function AttachmentsTag(props) {
	return <Tag
				reference="AttachmentsTag"
				model="Attachments"
				uniqueRepository={true}
				Editor={AttachmentsEditorWindow}
				usePermissions={true}
				{...props}
			/>;
}

export default AttachmentsTag;