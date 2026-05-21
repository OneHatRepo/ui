import Editor from './Editor.js';
import _ from 'lodash';

export default function ReportPresetsEditor(props) {

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
		                        "name": "report_presets__name"
		                    },
		                ]
		            }
		        ]
		    }
		],
		ancillaryItems = [],
		columnDefaults = { // defaults for each column defined in 'items', for use in Form amd Viewer
		};
	return <Editor
				reference="ReportPresetsEditor"
				title="Report Presets"
				items={items}
				ancillaryItems={ancillaryItems}
				columnDefaults={columnDefaults}
				{...props}
			/>;
}

