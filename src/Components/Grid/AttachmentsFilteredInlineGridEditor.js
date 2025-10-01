/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */

import AttachmentsInlineGridEditor from './AttachmentsInlineGridEditor.js';

export default function AttachmentsFilteredInlineGridEditor(props) {
	return <AttachmentsInlineGridEditor
				reference="AttachmentsFilteredInlineGridEditor"
				useFilters={true}

				{...props}
			/>;
}