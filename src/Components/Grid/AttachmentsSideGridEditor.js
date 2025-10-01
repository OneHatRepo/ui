/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */

import { SideGridEditor } from './Grid.js';
import AttachmentsEditor from '../Editor/AttachmentsEditor.js';
import AttachmentsGridColumns from './Columns/AttachmentsGridColumns.js';

export default function AttachmentsSideGridEditor(props) {
	return <SideGridEditor
				reference="AttachmentsSideGridEditor"
				model="Attachments"
				usePermissions={true}
				isCollapsible={false}
				Editor={AttachmentsEditor}
				columnsConfig={AttachmentsGridColumns}
				
				
				{...props}
			/>;
}