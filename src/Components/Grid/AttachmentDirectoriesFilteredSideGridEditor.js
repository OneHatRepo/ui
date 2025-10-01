/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */

import AttachmentDirectoriesSideGridEditor from './AttachmentDirectoriesSideGridEditor.js';

export default function AttachmentDirectoriesFilteredSideGridEditor(props) {
	return <AttachmentDirectoriesSideGridEditor
				reference="AttachmentDirectoriesFilteredSideGridEditor"
				useFilters={true}

				{...props}
			/>;
}