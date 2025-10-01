/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */
import Editor from './Editor.js';
import _ from 'lodash';

export default function AttachmentsEditor(props) {

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
		                        "name": "attachments__model_display"
		                    },
		                    {
		                        "name": "attachments__size_formatted"
		                    },
		                    {
		                        "name": "attachments__info"
		                    },
		                    {
		                        "name": "attachments__uri"
		                    },
		                    {
		                        "name": "attachments__attachment_directory_id"
		                    },
		                    {
		                        "name": "attachments__abs_path"
		                    },
		                    {
		                        "name": "attachments__model"
		                    },
		                    {
		                        "name": "attachments__modelid"
		                    },
		                    {
		                        "name": "attachments__uuid"
		                    },
		                    {
		                        "name": "attachments__path"
		                    },
		                    {
		                        "name": "attachments__filename"
		                    },
		                    {
		                        "name": "attachments__mimetype"
		                    },
		                    {
		                        "name": "attachments__size"
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
				reference="AttachmentsEditor"
				title="Attachments"
				items={items}
				ancillaryItems={ancillaryItems}
				columnDefaults={columnDefaults}
				{...props}
			/>;
}

