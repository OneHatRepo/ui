/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */

import AttachmentsGridEditor from './AttachmentsGridEditor.js';

export default function AttachmentsFilteredGridEditor(props) {
	return <AttachmentsGridEditor
				reference="AttachmentsFilteredGridEditor"
				useFilters={true}

				{...props}
			/>;
}