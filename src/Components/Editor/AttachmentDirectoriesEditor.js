/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */
import Editor from './Editor.js';
import _ from 'lodash';

export default function AttachmentDirectoriesEditor(props) {

	const
		items = [
		    {
		        "type": "Column",
		        "flex": 1,
		        "defaults": {},
		        "items": [
		            {
		                "type": "FieldSet",
		                "title": "General",
		                "reference": "general",
		                "defaults": {},
		                "items": [
		                    {
		                        "name": "attachment_directories__name"
		                    },
		                    {
		                        "name": "attachment_directories__model"
		                    },
		                    {
		                        "name": "attachment_directories__modelid"
		                    }
		                ]
		            }
		        ]
		    }
		],
		ancillaryItems = [],
		columnDefaults = { // defaults for each column defined in 'items', for use in Form amd Viewer
		};
	return <Editor
				reference="AttachmentDirectoriesEditor"
				title="AttachmentDirectories"
				items={items}
				ancillaryItems={ancillaryItems}
				columnDefaults={columnDefaults}
				{...props}
			/>;
}

