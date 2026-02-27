import PmEventsEditor from './PmEventsEditor.js';

export default function BumpPmsEditor(props) {
	return <PmEventsEditor
				isBump={true}
				{...props}
			/>;
}

