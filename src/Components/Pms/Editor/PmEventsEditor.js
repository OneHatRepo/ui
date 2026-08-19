import { useState, useEffect, useRef, } from 'react';
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
import useForceUpdate from '../../../Hooks/useForceUpdate.js';
import withAlert from '../../Hoc/withAlert.js';
import withComponent from '../../Hoc/withComponent.js';
import Gauge from '../../Icons/Gauge.js';
import oneHatData from '@onehat/data';
import _ from 'lodash';

function PmEventsEditor(props) {
	const {
			selection,
			isBump = false,
			self,
		} = props,
		pmEvent = selection[0],
		forceUpdate = useForceUpdate(),
		isFirstRun = useRef(true),
		meterId = useRef(pmEvent?.pm_events__meter_id), // EquipmentEditor.PmEventsFilteredGridEditor & UpcomingPmsGrid.onBump both add this by default
		equipmentId = useRef(null),
		pmScheduleId = useRef(pmEvent?.pm_events__pm_schedule_id), // UpcomingPmsGrid.onBump adds this by default
		pmEventTypeId = useRef(pmEvent?.pm_events__pm_event_type_id),
		hasMultipleMeters = useRef(null),
		hasMultiplePmSchedules = useRef(null),
		[isIntervalHidden, setIsIntervalHidden] = useState(true),
		[isDateHidden, setIsDateHidden] = useState(true),
		[isMeterReadingHidden, setIsMeterReadingHidden] = useState(true),
		[isPmTechnicianHidden, setIsPmTechnicianHidden] = useState(true),
		[isDetailsHidden, setIsDetailsHidden] = useState(true),
		[isPmScheduleDisabled, setIsPmScheduleDisabled] = useState(true),
		[Meters, setMeters] = useState(null),
		[PmSchedules, setPmSchedules] = useState(null),
		[MetersPmSchedules, setMetersPmSchedules] = useState(null),
		getIsFirstRun = () => {
			return isFirstRun.current;
		},
		setIsFirstRun = (value) => {
			isFirstRun.current = value;
		},
		getMeterId = () => {
			return meterId.current;
		},
		setMeterId = (value) => {
			meterId.current = value;
		},
		getPmScheduleId = () => {
			return pmScheduleId.current;
		},
		setPmScheduleId = (value) => {
			pmScheduleId.current = value;
		},
		getPmEventTypeId = () => {
			return pmEventTypeId.current;
		},
		setPmEventTypeId = (value) => {
			pmEventTypeId.current = value;
		},
		getEquipmentId = () => {
			return equipmentId.current;
		},
		setEquipmentId = (value) => {
			equipmentId.current = value;
		},
		getHasMultipleMeters = () => {
			return hasMultipleMeters.current;
		},
		setHasMultipleMeters = (value) => {
			hasMultipleMeters.current = value;
		},
		getHasMultiplePmSchedules = () => {
			return hasMultiplePmSchedules.current;
		},
		setHasMultiplePmSchedules = (value) => {
			hasMultiplePmSchedules.current = value;
		},
		viewerSetup = (values) => {
			const {
					pm_events__pm_event_type_id,
				} = values;
			adjustHiddenFieldsForPmEventType(pm_events__pm_event_type_id);
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
			adjustForm();
		},
		getForm = () => {
			return self?.children?.PmEventsEditor?.children?.form
				|| self?.children?.editor?.children?.form
				|| self?.children?.form
				|| null;
		},
		adjustForm = async () => {
			const form = getForm();
			if (!form) {
				setTimeout(() => {
					adjustForm();
				}, 100);
				return;
			}

			let
				fv = form.formGetValues(),
				{
					pm_events__meter_id,
					pm_events__pm_schedule_id,
					pm_events__pm_event_type_id,
				} = fv,
				isFirstRun = getIsFirstRun(),
				isMeterIdChanged = pm_events__meter_id !== getMeterId(),
				isPmScheduleIdChanged = pm_events__pm_schedule_id !== getPmScheduleId(),
				isPmEventTypeIdChanged = pm_events__pm_event_type_id !== getPmEventTypeId(),
				meter = pm_events__meter_id ? await getMeterById(pm_events__meter_id) : null;

			if (isFirstRun) {
				setIsFirstRun(false);
			}

			adjustHiddenFieldsForPmEventType(pm_events__pm_event_type_id);
			setIsPmScheduleDisabled(!meter);
			
			let hasChangedRefs = false;
			if (!getEquipmentId() && meter) {
				// if no EquipmentId has been set yet, set it
				Meters.setBaseParam('conditions[meters__equipment_id]', meter.meters__equipment_id); // so future Meter selections are limited to the same Equipment
				setEquipmentId(meter.meters__equipment_id);
				hasChangedRefs = true;
			}
			if ((isMeterIdChanged || isFirstRun) && meter) {
				// if isFirstRun, or isMeterIdChanged, set meterId and hasMultipleMeters
				setMeterId(meter.id);
				setHasMultipleMeters(meter.equipment__has_multiple_meters);
				hasChangedRefs = true;
				if (isMeterIdChanged) {
					// clear the pm_schedule_id field since the Meter has changed
					form.formSetValue('pm_events__pm_schedule_id', null);
					form.trigger('pm_events__pm_schedule_id');
					isPmScheduleIdChanged = true; // force the next block to run, since the pm_schedule_id has been cleared
				}
			}
			if ((isPmScheduleIdChanged || isFirstRun) && meter) {
				// if isFirstRun, or isPmScheduleIdChanged, set pmScheduleId and hasMultiplePmSchedules
				setPmScheduleId(pm_events__pm_schedule_id);
				const pmSchedules = await getPmSchedulesForMeterId(pm_events__meter_id);
				setHasMultiplePmSchedules(pmSchedules.length > 1);
				if (pmSchedules.length === 1) {
					// auto-set the pm_schedule_id since only one exists for the selected Meter
					const pmScheduleId = pmSchedules[0].pm_schedules__id;
					setPmScheduleId(pmScheduleId);
					form.formSetValue('pm_events__pm_schedule_id', pmScheduleId);
					form.trigger('pm_events__pm_schedule_id');
				} else if (pmSchedules.length === 0) {
					// no PmSchedules exist for the selected Meter
					setPmScheduleId(null);
					alert('No PM schedules exist for the selected meter. Please select a different meter or create a PM schedule for this meter.');
					setIsPmScheduleDisabled(true);
				}
				hasChangedRefs = true;
			}
			if (isPmEventTypeIdChanged || isFirstRun) {
				setPmEventTypeId(pm_events__pm_event_type_id);
				form.trigger('pm_events__interval');
				form.trigger('pm_events__associated_date');
				form.trigger('pm_events__meter_reading');
				form.trigger('pm_events__user_id');
				
				hasChangedRefs = true;
			}

			if (hasChangedRefs) {
				forceUpdate();
			}
		},
		adjustHiddenFieldsForPmEventType = (pm_events__pm_event_type_id) => {
			switch(pm_events__pm_event_type_id) {
				case PM_EVENT_TYPES__INITIAL:
				case PM_EVENT_TYPES__WORK_ORDER:
				case PM_EVENT_TYPES__ALERT:
				case PM_EVENT_TYPES__COMPLETE:
					setIsIntervalHidden(true);
					setIsDateHidden(true);
					setIsMeterReadingHidden(false);
					setIsDetailsHidden(false);
					setIsPmTechnicianHidden(true);
					break;
				case PM_EVENT_TYPES__RESET:
					setIsIntervalHidden(true);
					setIsDateHidden(true);
					setIsMeterReadingHidden(true);
					setIsDetailsHidden(true);
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
		getMeterById = async (meterId) => {
			let meter = Meters.getById(meterId);
			if (!meter) {
				// load the Meter from server
				await Meters.loadOneAdditionalEntity(meterId);
				meter = Meters.getById(meterId);
			}
			return meter;
		},
		getPmSchedulesForMeterId = async (meterId) => {
			// Preload or empty the PmSchedules repository based on the meterId
			if (!meterId) {
				PmSchedules.clearAll();
			} else {
				if (PmSchedules.getBaseParam('conditions[meters_pm_schedules__meter_id]') !== meterId) {
					PmSchedules.setBaseParam('conditions[meters_pm_schedules__meter_id]', meterId);
					await PmSchedules.load();
				}
			}
			return PmSchedules.entities;
		},
		onChangeMeter = async () => {
			adjustForm();
		},
		onChangePmEventType = () => {
			adjustForm();
		},
		onSetCurrentMeterReading = async () => {
			const
				form = getForm(),
				meter = await getMeterById(getMeterId());
			if (!form) {
				return;
			}
			if (!meter) {
				alert('Selected meter not found. Please select a different meter.');
				return;
			}
			const latestMeterReading = meter.meters__latest_meter_reading;
			if (latestMeterReading === null || latestMeterReading === undefined) {
				alert('Current meter reading not available for the selected meter.');
				return;
			}
			form.formSetValue('pm_events__meter_reading', latestMeterReading);
			form.trigger('pm_events__meter_reading');

			adjustForm();
		};

	useEffect(() => {
		// deal with the unique Repositories
		let Meters = null,
			PmSchedules = null,
			MetersPmSchedules = null,
			isMounted = true;

		(async () => {
			Meters = await oneHatData.getUniqueRepository('Meters');
			PmSchedules = await oneHatData.getUniqueRepository('PmSchedules');
			MetersPmSchedules = await oneHatData.getUniqueRepository('MetersPmSchedules');

			// If unmounted before await resolves, delete immediately and skip setState.
			if (!isMounted) {
				if (Meters?.id) {
					oneHatData.deleteRepository(Meters.id);
				}
				if (PmSchedules?.id) {
					oneHatData.deleteRepository(PmSchedules.id);
				}
				if (MetersPmSchedules?.id) {
					oneHatData.deleteRepository(MetersPmSchedules.id);
				}
				return;
			}

			setMeters(Meters);
			setPmSchedules(PmSchedules);
			setMetersPmSchedules(MetersPmSchedules);
		})();

		// cleanup when component is unmounted
		return () => {
			isMounted = false;
			if (Meters?.id) {
				oneHatData.deleteRepository(Meters.id);
			}
			if (PmSchedules?.id) {
				oneHatData.deleteRepository(PmSchedules.id);
			}
			if (MetersPmSchedules?.id) {
				oneHatData.deleteRepository(MetersPmSchedules.id);
			}
		};
	}, []);

	useEffect(() => {

		if (!Meters || !PmSchedules) {
			return;
		}

		// set Meters baseParams
		if (Meters.getBaseParam('onlyOnPmSchedules') !== true) {
			Meters.setBaseParam('onlyOnPmSchedules', true);
		}
		if (PmSchedules.getBaseParam('leftJoinWith') !== 'MetersPmSchedules') {
			PmSchedules.setBaseParam('leftJoinWith', 'MetersPmSchedules');
		}

	}, [Meters, PmSchedules]);

	if (!Meters || !PmSchedules) {
		return null;
	}

	const overviewItems = [{
		name: 'pm_events__pm_event_type_id',
		onChange: onChangePmEventType,
		editorType: isBump ? 'BumpPmEventTypesCombo' : 'PmEventManualTypesCombo',
		_grid: {
			className: isBump ? 'min-h-[230px]' : 'min-h-[330px]',
		},
	}];
	if (!isBump) {
		if (getHasMultipleMeters()) {
			overviewItems.push({
				name: 'pm_events__meter_id',
				tooltip: "Eq/Meter associated with this PM Event.\n" + 
						// "Dropdown list shows only meters with an assigned PM schedule.\n" +
						"Meter name will be omitted if only the Equipment's primary meter exists, otherwise it will be shown.",
				onChange: onChangeMeter,
				Repository: Meters,
			});
		}
		if (getHasMultiplePmSchedules()) {
			overviewItems.push({
				name: 'pm_events__pm_schedule_id',
				tooltip: 'Dropdown list shows only PM schedules assigned to this meter.',
				isDisabled: isPmScheduleDisabled,
				Repository: PmSchedules,
			});
		}
	}

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
								minValue: 1,
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
											ret = true;
											break;
									}
									return ret;
								},
								minValue: 0,
								isHidden: isMeterReadingHidden,
								additionalEditButtons: [
									{
										key: 'setCurrentMeterReadingBtn',
										tooltip: 'Set to Current Meter Reading',
										icon: Gauge,
										handler: onSetCurrentMeterReading,
									},
								],
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
				{...props}
				reference="PmEventsEditor"
				parent={self}
				title="PmEvents"
				items={items}
				ancillaryItems={ancillaryItems}
				columnDefaults={columnDefaults}
				formSetup={formSetup}
				viewerSetup={viewerSetup}
			/>;
}

export default withComponent(withAlert(PmEventsEditor));