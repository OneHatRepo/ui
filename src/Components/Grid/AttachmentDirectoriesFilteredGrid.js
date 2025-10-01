/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */

import AttachmentDirectoriesGrid from './AttachmentDirectoriesGrid.js';

export default function AttachmentDirectoriesFilteredGrid(props) {
	return <AttachmentDirectoriesGrid
				reference="AttachmentDirectoriesFilteredGrid"
				useFilters={true}
				
				{...props}
			/>;
}