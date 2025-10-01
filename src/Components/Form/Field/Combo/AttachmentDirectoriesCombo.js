/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */

import Combo from './Combo.js';

function AttachmentDirectoriesCombo(props) {
	return <Combo
				reference="AttachmentDirectoriesCombo"
				model="AttachmentDirectories"
				uniqueRepository={true}
				usePermissions={true}
				{...props}
			/>;
}

export default AttachmentDirectoriesCombo;