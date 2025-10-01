/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */

import AttachmentsGrid from './AttachmentsGrid.js';

export default function AttachmentsFilteredGrid(props) {
	return <AttachmentsGrid
				reference="AttachmentsFilteredGrid"
				useFilters={true}
				
				{...props}
			/>;
}