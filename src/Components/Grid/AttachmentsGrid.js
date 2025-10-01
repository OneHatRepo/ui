/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */

import Grid from './Grid.js';
import AttachmentsGridColumns from './Columns/AttachmentsGridColumns.js';

export default function AttachmentsGrid(props) {
	return <Grid
				reference="AttachmentsGrid"
				model="Attachments"
				usePermissions={true}
				columnsConfig={AttachmentsGridColumns}

				{...props}
			/>;
}