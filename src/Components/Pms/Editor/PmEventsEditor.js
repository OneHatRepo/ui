import { useState, useEffect, } from 'react';
import Editor from '../../Editor/Editor.js';
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
} from '../../../Constants/PmEventTypes.js';
import oneHatData from '@onehat/data';
import _ from 'lodash';

export default function PmEventsEditor(props) {

	const {
			selection,
			isBump = false,
		} = props,
		record = selection[0],
		[isIntervalHidden, setIsIntervalHidden] = useState(false),
		[isDateHidden, setIsDateHidden] = useState(false),
		[isMeterReadingHidden, setIsMeterReadingHidden] = useState(false),
		[isPmTechnicianHidden, setIsPmTechnicianHidden] = useState(false),
		[isDetailsHidden, setIsDetailsHidden] = useState(false),
		[isPmScheduleDisabled, setIsPmScheduleDisabled] = useState(false),
		[Meters] = useState(() => oneHatData.getRepository('Meters', true)),
		[PmSchedules] = useState(() => oneHatData.getRepository('PmSchedules', true)),
		viewerSetup = (values) => {
			const {
					pm_events__pm_event_type_id,
				} = values;
			adjustHiddenFields(pm_events__pm_event_type_id);
		},
		formSetup = (formSetValue, formGetValues, formState) => {
			if (isBump) {
				// normalize the initialValues, so cancel button doesn't show a confirmation dialog box
				const initialValues = formGetValues();
				_.forOwn(initialValues, (value, key) => {
					formSetValue(key, value, {
						shouldDirty: false,
						shouldTouch: false,
						shouldValidate: false,
					});
				});
			}
			adjustForm(formGetValues);
		},
		onChangeMeter = (newValue, formSetValue, formGetValues, formState, trigger) => {
			// clear the pm_schedule_id field and repository since the meter has changed
			PmSchedules.clearAll();
			formSetValue('pm_events__pm_schedule_id', null);
			trigger('pm_events__pm_schedule_id');

			adjustForm(formGetValues);
		},
		onChangePmEventType = (newValue, formSetValue, formGetValues, formState, trigger) => {
			adjustForm(formGetValues);
		},
		adjustForm = (formGetValues) => {
			const {
					pm_events__meter_id,
					pm_events__pm_event_type_id,
				} = formGetValues();
			adjustHiddenFields(pm_events__pm_event_type_id);
			setIsPmScheduleDisabled(pm_events__meter_id === null);

			if (Meters.getBaseParam('onlyOnPmSchedules') !== true) {
				Meters.setBaseParam('onlyOnPmSchedules', true);
			}

			// Preload or empty the PmSchedules repository based on the selected meter_id
			if (!pm_events__meter_id) {
				PmSchedules.clearAll();
			} else {
				if (PmSchedules.getBaseParam('leftJoinWith') !== 'MetersPmSchedules') {
					PmSchedules.setBaseParam('leftJoinWith', 'MetersPmSchedules');
				}
				if (PmSchedules.getBaseParam('conditions[meters_pm_schedules__meter_id]') !== pm_events__meter_id) {
					PmSchedules.setBaseParam('conditions[meters_pm_schedules__meter_id]', pm_events__meter_id);
					PmSchedules.load();
				}
			}
		},
		adjustHiddenFields = (pm_events__pm_event_type_id) => {
			switch(pm_events__pm_event_type_id) {
				case PM_EVENT_TYPES__INITIAL:
				case PM_EVENT_TYPES__WORK_ORDER:
				case PM_EVENT_TYPES__ALERT:
					setIsIntervalHidden(true);
					setIsDateHidden(true);
					setIsMeterReadingHidden(false);
					setIsDetailsHidden(false);
					setIsPmTechnicianHidden(true);
					break;
				case PM_EVENT_TYPES__COMPLETE:
				case PM_EVENT_TYPES__RESET:
					setIsIntervalHidden(true);
					setIsDateHidden(true);
					setIsMeterReadingHidden(false);
					setIsDetailsHidden(false);
					setIsPmTechnicianHidden(true);
					break;
				case PM_EVENT_TYPES__DELAY_BY_DAYS:
				case PM_EVENT_TYPES__DELAY_BY_METER:
					setIsIntervalHidden(false);
					setIsDateHidden(true);
					setIsMeterReadingHidden(true);
					setIsDetailsHidden(false);
					setIsPmTechnicianHidden(true);
					break;
				case PM_EVENT_TYPES__SCHEDULE_PM:
					setIsIntervalHidden(true);
					setIsDateHidden(false);
					setIsMeterReadingHidden(true);
					setIsDetailsHidden(false);
					setIsPmTechnicianHidden(true);
					break;
				case PM_EVENT_TYPES__WILL_CALL:
				case PM_EVENT_TYPES__COMMENT:
					setIsIntervalHidden(true);
					setIsDateHidden(true);
					setIsMeterReadingHidden(true);
					setIsDetailsHidden(true);
					break;
				case PM_EVENT_TYPES__ASSIGN_TECHNICIAN:
					setIsIntervalHidden(true);
					setIsDateHidden(true);
					setIsMeterReadingHidden(true);
					setIsDetailsHidden(false);
					setIsPmTechnicianHidden(false);
					break;
			}
		},
		overviewItems = [];
	
	if (!isBump) {
		overviewItems.push({
			name: 'pm_events__meter_id',
			tooltip: "Eq/Meter associated with this PM Event.\n" + 
					"Dropdown list shows only meters with an assigned PM schedule.\n" +
					"Meter name will be omitted if only the Equipment's primary meter exists, otherwise it will be shown.",
			onChange: onChangeMeter,
			Repository: Meters,
		});
		overviewItems.push({
			name: 'pm_events__pm_schedule_id',
			tooltip: 'Dropdown list shows only PM schedules assigned to this meter.',
			isDisabled: isPmScheduleDisabled,
			Repository: PmSchedules,
		});
	}
	overviewItems.push({
		name: 'pm_events__pm_event_type_id',
		onChange: onChangePmEventType,
		editorType: isBump ? 'BumpPmEventTypesCombo' : 'PmEventManualTypesCombo',
	});

	const items = [
		    {
		        "type": "Column",
		        "flex": 1,
		        "defaults": {},
		        "items": [
		            {
		                "type": "FieldSet",
		                "title": "Overview",
		                "reference": "overview",
		                "defaults": {},
		                "items": overviewItems,
		            },
		            {
		                "type": "FieldSet",
		                "title": "Details",
		                "reference": "details",
		                "defaults": {},
						isHidden: isDetailsHidden,
		                "items": [
		                    {
		                        "name": "pm_events__interval",
								tooltip: 'Interval to delay by',
								isHidden: isIntervalHidden,
								getIsRequired: (formGetValues, formState) => {
									const {
											pm_events__pm_event_type_id,
										} = formGetValues();
									let ret = false;
									switch(pm_events__pm_event_type_id) {
										case PM_EVENT_TYPES__DELAY_BY_DAYS:
										case PM_EVENT_TYPES__DELAY_BY_METER:
											ret = true;
											break;
									}
									return ret;
								},
		                    },
		                    {
		                        "name": "pm_events__associated_date",
								tooltip: 'When to schedule the PM for',
								isHidden: isDateHidden,
								getIsRequired: (formGetValues, formState) => {
									const {
											pm_events__pm_event_type_id,
										} = formGetValues();
									let ret = false;
									switch(pm_events__pm_event_type_id) {
										case PM_EVENT_TYPES__SCHEDULE_PM:
											ret = true;
											break;
									}
									return ret;
								},
		                    },
		                    {
		                        "name": "pm_events__meter_reading",
								tooltip: 'Meter reading at the time of the PM event',
								getIsRequired: (formGetValues, formState) => {
									const {
											pm_events__pm_event_type_id,
										} = formGetValues();
									let ret = false;
									switch(pm_events__pm_event_type_id) {
										case PM_EVENT_TYPES__COMPLETE:
										case PM_EVENT_TYPES__RESET:
											ret = true;
											break;
									}
									return ret;
								},
								isHidden: isMeterReadingHidden,
		                    },
		                    {
		                        "name": "pm_events__user_id",
								tooltip: 'Technician to assign',
								getIsRequired: (formGetValues, formState) => {
									const {
											pm_events__pm_event_type_id,
										} = formGetValues();
									let ret = false;
									switch(pm_events__pm_event_type_id) {
										case PM_EVENT_TYPES__ASSIGN_TECHNICIAN:
											ret = true;
											break;
									}
									return ret;
								},
								isHidden: isPmTechnicianHidden,
		                    },
		                ]
		            }
		        ]
		    },
		    {
		        "type": "Column",
		        "flex": 1,
		        "defaults": {},
		        "items": [
		            {
		                "type": "FieldSet",
		                "title": "Comments",
		                "reference": "comments",
		                "defaults": {},
		                "items": [
		                    {
		                        "name": "pm_events__comments"
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
				reference="PmEventsEditor"
				title="PmEvents"
				items={items}
				ancillaryItems={ancillaryItems}
				columnDefaults={columnDefaults}
				formSetup={formSetup}
				viewerSetup={viewerSetup}
				{...props}
			/>;
}

