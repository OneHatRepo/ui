import {
	PM_EVENT_TYPES__COMPLETE,
	PM_EVENT_TYPES__RESET,
	PM_EVENT_TYPES__DELAY_BY_DAYS,
	PM_EVENT_TYPES__DELAY_BY_METER,
	PM_EVENT_TYPES__SCHEDULE_PM,
	PM_EVENT_TYPES__WILL_CALL,
	PM_EVENT_TYPES__ASSIGN_TECHNICIAN,
	PM_EVENT_TYPES__COMMENT,
} from '../Constants/PmEventTypes.js';
import inArray from './inArray.js';
import _ from 'lodash';

export default function verifyCanCrudPmEvents(selection) {
	let canCrud = true;
	_.each(selection, (entity) => {
		if (!inArray(entity.pm_events__pm_event_type_id, [
				// manual types
				PM_EVENT_TYPES__COMPLETE,
				PM_EVENT_TYPES__RESET,
				PM_EVENT_TYPES__DELAY_BY_DAYS,
				PM_EVENT_TYPES__DELAY_BY_METER,
				PM_EVENT_TYPES__SCHEDULE_PM,
				PM_EVENT_TYPES__WILL_CALL,
				PM_EVENT_TYPES__ASSIGN_TECHNICIAN,
				PM_EVENT_TYPES__COMMENT,
			])) {
			canCrud = false;
			return false;
		}
	});
	return canCrud;
};