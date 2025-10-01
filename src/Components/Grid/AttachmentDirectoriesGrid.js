/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */

import Grid from './Grid.js';
import AttachmentDirectoriesGridColumns from './Columns/AttachmentDirectoriesGridColumns.js';

export default function AttachmentDirectoriesGrid(props) {
	return <Grid
				reference="AttachmentDirectoriesGrid"
				model="AttachmentDirectories"
				usePermissions={true}
				columnsConfig={AttachmentDirectoriesGridColumns}

				{...props}
			/>;
}