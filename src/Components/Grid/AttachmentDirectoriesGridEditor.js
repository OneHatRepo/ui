/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */

import {
	SELECTION_MODE_SINGLE,
} from '../../Constants/Selection.js';
import { WindowedGridEditor } from './Grid.js';
import AttachmentDirectoriesEditorWindow from '../Window/AttachmentDirectoriesEditorWindow.js';
import AttachmentDirectoriesGridColumns from './Columns/AttachmentDirectoriesGridColumns.js';

export default function AttachmentDirectoriesGridEditor(props) {
	return <WindowedGridEditor
				reference="AttachmentDirectoriesGridEditor"
				model="AttachmentDirectories"
				usePermissions={true}
				selectionMode={SELECTION_MODE_SINGLE}
				Editor={AttachmentDirectoriesEditorWindow}
				columnsConfig={AttachmentDirectoriesGridColumns}
				
				
				{...props}
			/>;
}