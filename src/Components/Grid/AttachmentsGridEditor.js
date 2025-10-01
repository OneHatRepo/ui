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
import AttachmentsEditorWindow from '../Window/AttachmentsEditorWindow.js';
import AttachmentsGridColumns from './Columns/AttachmentsGridColumns.js';

export default function AttachmentsGridEditor(props) {
	return <WindowedGridEditor
				reference="AttachmentsGridEditor"
				model="Attachments"
				usePermissions={true}
				selectionMode={SELECTION_MODE_SINGLE}
				Editor={AttachmentsEditorWindow}
				columnsConfig={AttachmentsGridColumns}
				
				
				{...props}
			/>;
}