/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */

import AttachmentDirectoriesInlineGridEditor from './AttachmentDirectoriesInlineGridEditor.js';

export default function AttachmentDirectoriesFilteredInlineGridEditor(props) {
	return <AttachmentDirectoriesInlineGridEditor
				reference="AttachmentDirectoriesFilteredInlineGridEditor"
				useFilters={true}

				{...props}
			/>;
}