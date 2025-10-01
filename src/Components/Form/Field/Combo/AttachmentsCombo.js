/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */

import Combo from './Combo.js';

function AttachmentsCombo(props) {
	return <Combo
				reference="AttachmentsCombo"
				model="Attachments"
				uniqueRepository={true}
				usePermissions={true}
				{...props}
			/>;
}

export default AttachmentsCombo;