/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */

import {
	SELECTION_MODE_SINGLE,
} from '../../Constants/Selection.js';
import { InlineGridEditor } from './Grid.js';
import AttachmentDirectoriesGridColumns from './Columns/AttachmentDirectoriesGridColumns.js';

export default function AttachmentDirectoriesInlineGridEditor(props) {
	return <InlineGridEditor
				reference="AttachmentDirectoriesInlineGridEditor"
				model="AttachmentDirectories"
				usePermissions={true}
				selectionMode={SELECTION_MODE_SINGLE}
				columnsConfig={AttachmentDirectoriesGridColumns}
				
				
				{...props}
			/>;
}