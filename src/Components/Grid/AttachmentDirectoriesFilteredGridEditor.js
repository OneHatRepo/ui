/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */

import AttachmentDirectoriesGridEditor from './AttachmentDirectoriesGridEditor.js';

export default function AttachmentDirectoriesFilteredGridEditor(props) {
	return <AttachmentDirectoriesGridEditor
				reference="AttachmentDirectoriesFilteredGridEditor"
				useFilters={true}

				{...props}
			/>;
}