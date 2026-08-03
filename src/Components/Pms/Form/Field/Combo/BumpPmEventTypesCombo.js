import {
	PM_EVENT_TYPES__INITIAL,
	PM_EVENT_TYPES__WORK_ORDER,
	PM_EVENT_TYPES__ALERT,
	PM_EVENT_TYPES__COMPLETE,
	PM_EVENT_TYPES__RESET,
	PM_EVENT_TYPES__DELAY_BY_DAYS,
	PM_EVENT_TYPES__DELAY_BY_METER,
	PM_EVENT_TYPES__SCHEDULE_PM,
	PM_EVENT_TYPES__WILL_CALL,
	PM_EVENT_TYPES__ASSIGN_TECHNICIAN,
	PM_EVENT_TYPES__COMMENT,
} from '../../../../../Constants/PmEventTypes.js';
import getComponentFromType from '../../../../../Functions/getComponentFromType.js';

function BumpPmEventTypesCombo(props) {
	const PmEventTypesCombo = getComponentFromType('PmEventTypesCombo');
	return <PmEventTypesCombo
				reference="BumpPmEventTypesCombo"
				model="PmEventTypes"
				uniqueRepository={true}
				usePermissions={true}
				baseParams={{
					'conditions[pm_event_types__id IN]': [
						PM_EVENT_TYPES__COMPLETE,
						PM_EVENT_TYPES__RESET,
						PM_EVENT_TYPES__DELAY_BY_DAYS,
						PM_EVENT_TYPES__DELAY_BY_METER,
						PM_EVENT_TYPES__WILL_CALL,
					],
				}}
				{...props}
			/>;
}

export default BumpPmEventTypesCombo;