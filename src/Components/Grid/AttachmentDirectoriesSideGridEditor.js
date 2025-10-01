/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */

import { SideGridEditor } from './Grid.js';
import AttachmentDirectoriesEditor from '../Editor/AttachmentDirectoriesEditor.js';
import AttachmentDirectoriesGridColumns from './Columns/AttachmentDirectoriesGridColumns.js';

export default function AttachmentDirectoriesSideGridEditor(props) {
	return <SideGridEditor
				reference="AttachmentDirectoriesSideGridEditor"
				model="AttachmentDirectories"
				usePermissions={true}
				isCollapsible={false}
				Editor={AttachmentDirectoriesEditor}
				columnsConfig={AttachmentDirectoriesGridColumns}
				
				
				{...props}
			/>;
}