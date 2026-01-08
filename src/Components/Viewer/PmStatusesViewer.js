import DisplayField from '../Form/Field/DisplayField.js';
import clsx from 'clsx';
import {
	PM_STATUSES__OK,
	PM_STATUSES__PM_DUE,
	PM_STATUSES__DELAYED,
	PM_STATUSES__WILL_CALL,
	PM_STATUSES__SCHEDULED,
	PM_STATUSES__OVERDUE,
	PM_STATUSES__COMPLETED,
} from '../../Constants/PmStatuses.js';

export default function PmStatusesViewer(props) {
	let text = '';
	switch(props.id) {
		case PM_STATUSES__OK:
			text = 'OK';
			break;
		case PM_STATUSES__PM_DUE:
			text = 'Due';
			break;
		case PM_STATUSES__DELAYED:
			text = 'Delayed';
			break;
		case PM_STATUSES__WILL_CALL:
			text = 'Will Call';
			break;
		case PM_STATUSES__SCHEDULED:
			text = 'Scheduled';
			break;
		case PM_STATUSES__OVERDUE:
			text = 'Overdue';
			break;
		case PM_STATUSES__COMPLETED:
			text = 'Completed';
			break;
		default:
			text = 'Unknown';
	}
	let className = clsx(
		'flex-none',
	);
	if (props.className) {
		className += ' ' + props.className;
	}
	return <DisplayField
				text={text}
				{...props}
				className={className}
			/>;
}