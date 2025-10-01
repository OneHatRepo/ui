/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */

import AttachmentsSideGridEditor from './AttachmentsSideGridEditor.js';

export default function AttachmentsFilteredSideGridEditor(props) {
	return <AttachmentsSideGridEditor
				reference="AttachmentsFilteredSideGridEditor"
				useFilters={true}

				{...props}
			/>;
}