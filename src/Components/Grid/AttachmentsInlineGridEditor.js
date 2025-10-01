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
import AttachmentsGridColumns from './Columns/AttachmentsGridColumns.js';

export default function AttachmentsInlineGridEditor(props) {
	return <InlineGridEditor
				reference="AttachmentsInlineGridEditor"
				model="Attachments"
				usePermissions={true}
				selectionMode={SELECTION_MODE_SINGLE}
				columnsConfig={AttachmentsGridColumns}
				
				
				{...props}
			/>;
}