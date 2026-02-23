import {
	Text,
	VStack,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import {
	MOMENT_DATE_FORMAT_6,
} from '../../Constants/Dates.js';
import {
	PM_SCHEDULE_MODES__HISTORICAL_USAGE,
	PM_SCHEDULE_MODES__EXPECTED_USAGE,
	PM_SCHEDULE_MODES__NO_ESTIMATION,
	PM_SCHEDULE_MODES__WILL_CALL,
} from '../../Constants/PmScheduleModes.js';
import {
	PM_STATUSES__OK,
	PM_STATUSES__PM_DUE,
	PM_STATUSES__DELAYED,
	PM_STATUSES__WILL_CALL,
	PM_STATUSES__SCHEDULED,
	PM_STATUSES__OVERDUE,
	PM_STATUSES__COMPLETED,
} from '../../Constants/PmStatuses.js';
import {
	METER_TYPES__HOURS,
	METER_TYPES__HOURS_UNITS,
	METER_TYPES__HOURS_TEXT,
	METER_TYPES__MILES,
	METER_TYPES__MILES_UNITS,
	METER_TYPES__MILES_TEXT,
} from '../../Constants/MeterTypes.js';
import flatten from '../../Functions/flatten.js';
import Button from '../Buttons/Button.js';
import Json from '../Form/Field/Json.js';
import Panel from '../Panel/Panel.js';
import Footer from '../Layout/Footer.js';
import Viewer from '../Viewer/Viewer.js';
import testProps from '../../Functions/testProps.js';
import moment from 'moment';
import _ from 'lodash';

export default function PmCalcDebugViewer(props) {

	const {
			metersPmSchedule,
			onClose,
		} = props,
		json = metersPmSchedule?.properties.meters_pm_schedules__debug_json.json,
		ucfirst = (string) => {
			return string.charAt(0).toUpperCase() + string.slice(1);
		},
		getPmScheduleMode = (pm_schedule_mode_id) => {
			switch(pm_schedule_mode_id) {
				case PM_SCHEDULE_MODES__HISTORICAL_USAGE:
					return 'Historical Usage';
				case PM_SCHEDULE_MODES__EXPECTED_USAGE:
					return 'Expected Usage';
				case PM_SCHEDULE_MODES__NO_ESTIMATION:
					return 'No Estimation';
				case PM_SCHEDULE_MODES__WILL_CALL:
					return 'Will Call';
				default:
					return 'Unknown Mode';
			}
		},
		flattenedJson = flatten(json),
		formatDaysValue = (value, record, self) => {
			if (value === null || value === undefined) {
				return value;
			}
			return parseInt(_.round(value), 10);
		},
		formatMeterValue = (value, record, self) => {
			if (value === null || value === undefined) {
				return value;
			}
			let ret;
			const meterType = parseInt(record?.meter_type, 10);
			switch(meterType) {
				case METER_TYPES__HOURS:
					ret = `${value} ${METER_TYPES__HOURS_UNITS}`;
					break;
				case METER_TYPES__MILES:
					ret = `${value} ${METER_TYPES__MILES_UNITS}`;
					break;
			}
			return ret;
		},
		formatDateValue = (value, record, self) => {
			if (value === null || value === undefined) {
				return value;
			}

			// convert from datetime to pretty-printed date
			return moment(value).format(MOMENT_DATE_FORMAT_6);
		},
		items = [
			{
				"type": "Column",
				"flex": 1,
				"defaults": {
					labelWidth: 300,
				},
				"items": [
					/*
						$lines[] = $obj['pm_schedule_name'] . ' for ' . $obj['equipment_unit_number'];
						if (isset($obj['pm_status_name'])) {
							$lines[] = "PM Status: " . $obj['pm_status_name'];
						}
						if (isset($obj['nextPmDate'])) {
							$lines[] = "Next PM Date: " . $obj['nextPmDate'];
						}
						if (isset($obj['pm_status_id']) && $obj['pm_status_id'] === PM_STATUSES__OVERDUE) {
							$lines[] = "Grace Period Ends: " . $obj['maxGracePeriodDateTime'];
							$lines[] = "Overdue by # Cycles: " . $obj['cycleDays'];
						}

						if (isset($obj['calculationMode'])) {
							$lines[] = "\nHow it was calculated:";
							$lines[] = "   Calculation Mode: " . $obj['calculationMode'];
							$lines[] = "   In Service Date: " . $obj['inServiceDate'];
							if (isset($obj['isOverride']) && $obj['isOverride']) {
								$lines[] = '   Is Override: Yes';
								$lines[] = "   Override Event Date: " . ($obj['overrideEventDate'] ?? 'N/A');
							} else {
								$lines[] = "   Last Reset Date: " . $obj['resetDate'];
								if (isset($obj['resetEvent']['workOrder']['service_order'])) {
									$lines[] = "      Service Order: " . $obj['resetEvent']['workOrder']['service_order'];
								}
								$lines[] = "   Interval Days: " . $obj['intervalDays'];
								$lines[] = "   Days Until Next PM: " . $obj['daysLeft'];
								$lines[] = "   Interval Meter: " . $obj['intervalMeter'];
								if (isset($obj['latestMeterReading']['value'])) {
									$lines[] = "   Latest Meter Reading: " . $obj['latestMeterReading']['value'] . " on " . $obj['latestMeterReading']['date'];
								}
								$lines[] = "   Meter Accrued Since Latest PM: " . $obj['meterAccruedSinceLatestPm'];
								$lines[] = "   Avg Daily Meter: " . $obj['avgDailyMeter'];
								$lines[] = "   Meter Until Next PM: " . $obj['meterRemainingUntilNextPm'];
								$lines[] = "   Controlling Method: " . $obj['controllingMethod'];
							}
							if (isset($obj['isDelayed']) && $obj['isDelayed']) {
								$lines[] = '   Is Delayed: Yes';
								$lines[] = "   Delay Threshold Date: " . ($obj['delayThresholdDate'] ?? 'N/A');
							}
						}


record: avgDailyMeter: 0.1
avgDailyMeterDebugInfo.avgDailyMeter: 0.1286721083100221
avgDailyMeterDebugInfo.current: 0
avgDailyMeterDebugInfo.days: 202.06399305555556
avgDailyMeterDebugInfo.extrapolateBasedOnExpected: false
avgDailyMeterDebugInfo.inServiceDate: "2023-07-06"
avgDailyMeterDebugInfo.meter: 26
avgDailyMeterDebugInfo.meterReadingsCount: 7
avgDailyMeterDebugInfo.meterStack.0.earliest.date: "2024-03-27T18:50:33-05:00"
avgDailyMeterDebugInfo.meterStack.0.earliest.is_replacement: false
avgDailyMeterDebugInfo.meterStack.0.earliest.meter_source_id: 2
avgDailyMeterDebugInfo.meterStack.0.earliest.neighbors: null
avgDailyMeterDebugInfo.meterStack.0.earliest.value: 1674
avgDailyMeterDebugInfo.meterStack.0.latest.date: "2024-10-15T20:22:42-05:00"
avgDailyMeterDebugInfo.meterStack.0.latest.is_replacement: false
avgDailyMeterDebugInfo.meterStack.0.latest.meter_source_id: 2
avgDailyMeterDebugInfo.meterStack.0.latest.neighbors: null
avgDailyMeterDebugInfo.meterStack.0.latest.value: 1700
avgDailyMeterDebugInfo.seconds: 17458329
avgDailyMeterDebugInfo.startNewStack: false
avgDailyMeterDebugInfo.toDate: "2024-10-15 20:22:42"
byDays: "2025-01-13 20:22:42"
byMeter: null
calculationMode: "no estimation"
controllingMethod: "Days"
crossedThresholdMeterReading: null
cycleDays: 90
daysLeft: -406.2
daysSinceLatestPm: 0
delayThresholdDate: "2024-10-15 20:22:42"
ignoreDate: "2016-02-23"
inServiceDate: "2023-07-06"
intervalDays: 90
intervalMeter: 250
isDelayed: false
isOverride: false
latestMeterReading.comments: null
latestMeterReading.date: "2024-10-15T20:22:42-05:00"
latestMeterReading.delta: 14
latestMeterReading.id: 781
latestMeterReading.is_bad: false
latestMeterReading.is_force: false
latestMeterReading.is_pm_clock_reset: true
latestMeterReading.is_replacement: false
latestMeterReading.meter_id: 106
latestMeterReading.meter_source.id: 2
latestMeterReading.meter_source.name: "Work Order"
latestMeterReading.meter_source_id: 2
latestMeterReading.neighbors: null
latestMeterReading.pm_event_id: null
latestMeterReading.tel_usage_id: null
latestMeterReading.value: 1700
latestMeterReading.work_order_id: 943
maxGracePeriodDateTime: "2025-01-27 20:22:42"
meterAccruedSinceLatestPm: 0
meterAccruedSinceLatestPmDebugInfo.abDays: 105.01708333333333
meterAccruedSinceLatestPmDebugInfo.abMeter: 14
meterAccruedSinceLatestPmDebugInfo.abMeterPerDay: 0.13331164374050253
meterAccruedSinceLatestPmDebugInfo.averageDailyMeter: null
meterAccruedSinceLatestPmDebugInfo.bDays: 0
meterAccruedSinceLatestPmDebugInfo.bMeter: 0
meterAccruedSinceLatestPmDebugInfo.bdDays: null
meterAccruedSinceLatestPmDebugInfo.bdMeter: null
meterAccruedSinceLatestPmDebugInfo.cDays: 0
meterAccruedSinceLatestPmDebugInfo.cMeter: 0
meterAccruedSinceLatestPmDebugInfo.cMeterPerDay: null
meterAccruedSinceLatestPmDebugInfo.checkForReplacements: true
meterAccruedSinceLatestPmDebugInfo.dDays: 496.19255787037036
meterAccruedSinceLatestPmDebugInfo.dMeter: 0
meterAccruedSinceLatestPmDebugInfo.deDays: null
meterAccruedSinceLatestPmDebugInfo.deMeter: null
meterAccruedSinceLatestPmDebugInfo.deMeterPerDay: null
meterAccruedSinceLatestPmDebugInfo.extrapolateBasedOnExpected: false
meterAccruedSinceLatestPmDebugInfo.extrapolateBasedOnHistory: false
meterAccruedSinceLatestPmDebugInfo.firstMeterReading.date: "2024-10-15T20:22:42-05:00"
meterAccruedSinceLatestPmDebugInfo.firstMeterReading.id: 781
meterAccruedSinceLatestPmDebugInfo.firstMeterReading.meter_source_id: 2
meterAccruedSinceLatestPmDebugInfo.firstMeterReading.neighbors: null
meterAccruedSinceLatestPmDebugInfo.firstMeterReading.value: 1700
meterAccruedSinceLatestPmDebugInfo.fromDate: "2024-10-15 20:22:42"
meterAccruedSinceLatestPmDebugInfo.latestMeterReading.date: "2024-10-15T20:22:42-05:00"
meterAccruedSinceLatestPmDebugInfo.latestMeterReading.id: 781
meterAccruedSinceLatestPmDebugInfo.latestMeterReading.meter_source_id: 2
meterAccruedSinceLatestPmDebugInfo.latestMeterReading.neighbors: null
meterAccruedSinceLatestPmDebugInfo.latestMeterReading.value: 1700
meterAccruedSinceLatestPmDebugInfo.nextMeterReading: null
meterAccruedSinceLatestPmDebugInfo.previousMeterReading.date: "2024-07-02T19:58:06-05:00"
meterAccruedSinceLatestPmDebugInfo.previousMeterReading.id: 620
meterAccruedSinceLatestPmDebugInfo.previousMeterReading.is_replacement: false
meterAccruedSinceLatestPmDebugInfo.previousMeterReading.meter_source_id: 2
meterAccruedSinceLatestPmDebugInfo.previousMeterReading.neighbors: null
meterAccruedSinceLatestPmDebugInfo.previousMeterReading.value: 1686
meterAccruedSinceLatestPmDebugInfo.timeFrameMeter: 0
meterAccruedSinceLatestPmDebugInfo.toDate: "2026-02-23 23:59:59"
meterRemainingUntilNextPm: 250
meter_id: 106
meter_type: 1
nextPmDate: "2025-01-13 20:22:42"
offsetDays: 0
offsetMeter: 0
overduePms: 5
overrideEvent: null
overrideEventDate: null
pmSchedule.id: 2
pmSchedule.interval_days: 90
pmSchedule.interval_meter: 250
pmSchedule.job_code: "PM250"
pmSchedule.name: "PM250/90/No Estimation"
pmSchedule.pm_schedule_mode_id: 3
pmSchedule.repeats: true
pmScheduleMode: "No Estimation"
pm_status_id: 6
pm_status_name: "Overdue"
resetDate: "2024-10-15 20:22:42"
resetEvent.associated_date: null
resetEvent.comments: null
resetEvent.date: "2024-10-15T20:22:42-05:00"
resetEvent.id: 539
resetEvent.interval: null
resetEvent.meter_id: 106
resetEvent.meter_reading: null
resetEvent.offset_days: null
resetEvent.offset_meter: null
resetEvent.pm_event_type.id: 2
resetEvent.pm_event_type.is_delay: false
resetEvent.pm_event_type.is_info: false
resetEvent.pm_event_type.is_manual: false
resetEvent.pm_event_type.is_override: false
resetEvent.pm_event_type.is_reset: true
resetEvent.pm_event_type.name: "PM Work Order"
resetEvent.pm_event_type.sort_order: null
resetEvent.pm_event_type_id: 2
resetEvent.pm_schedule_id: 2
resetEvent.reset_by: null
resetEvent.user_id: null
resetEvent.work_order_id: 943
resetEventDate: "2024-10-15 20:22:42"
toDate: "2026-02-23 23:59:59"
workOrder.bill_to_business_partner_id: 55121
workOrder.bill_to_name: "ZIMMERMAN TRUCK BODIES"
workOrder.business_partner_id: 55121
workOrder.cause: null
workOrder.close_date: null
workOrder.comments: null
workOrder.complaint: "YALE #2PM"
workOrder.complete_date: null
workOrder.correction: "B PM SERVICE ARRIVED AT CUSTOMER LOCATION. LOCATED EQUIPMENT AND  MOVED TO A SAFE WORKING AREA.PERFORMED PM SERVICE PER ATTACHED PM  FORM."
workOrder.coverage: null
workOrder.enterprise_id: 18
workOrder.equipment_id: 106
workOrder.equipment_path: "MH PMs - SE240 Ottumwa / ZIMMERMAN TRUCK BODIES"
workOrder.id: 943
workOrder.invoice_date: "2024-10-16T08:18:14-05:00"
workOrder.invoice_number: null
workOrder.is_force_meter_good: false
workOrder.is_ltm: false
workOrder.is_remote_phantom: false
workOrder.is_scheduled: false
workOrder.is_verified: false
workOrder.meter_date: "2024-10-15T20:22:42-05:00"
workOrder.meter_id: 106
workOrder.meter_reading: 1700
workOrder.open_date: "2024-10-15T20:22:42-05:00"
workOrder.original_destination: null
workOrder.original_destination_enterprise_id: null
workOrder.original_destination_equipment_exists: false
workOrder.original_destination_equipment_id: null
workOrder.original_destination_manufacturer_id: null
workOrder.original_destination_serial_number: null
workOrder.original_destination_unit_number: null
workOrder.pm_schedule_id: 2
workOrder.po_number: ""
workOrder.repaired_by_branch: null
workOrder.repaired_by_company: null
workOrder.segment: 1
workOrder.segment_type: 4
workOrder.service_center_id: 18
workOrder.service_order: "S24011951"
workOrder.ship_to_address: "101 E NORTH ST"
workOrder.ship_to_business_partner_id: 55121
workOrder.ship_to_city: "CANTRIL"
workOrder.ship_to_name: "ZIMMERMAN TRUCK BODIES"
workOrder.ship_to_state_abbr: "IA"
workOrder.ship_to_zip: "52542-1001"
workOrder.sold_to_address: " 101 E NORTH ST "
workOrder.sold_to_business_partner_id: 55121
workOrder.sold_to_city: "CANTRIL"
workOrder.sold_to_name: "ZIMMERMAN TRUCK BODIES"
workOrder.sold_to_state_abbr: "IA"
workOrder.sold_to_zip: "52542-1001"
workOrder.tax: "10.49"
workOrder.time_out_of_service: null
workOrder.total: "160.34"
workOrder.total_labors: "0.00"
workOrder.total_others: "0.00"
workOrder.total_parts: "0.00"
workOrder.wo_class_id: 18
workOrder.wo_mode_id: 3
workOrder.wo_number: null
workOrder.wo_service_type_id: null

					*/
					{
						"type": "FieldSet",
						"title": "General",
						"reference": "general",
						"defaults": {},
						"items": [
							{
								label: 'PM Schedule',
								name: 'pmSchedule.name',
								viewerFormatter: (value, record, self) => {
									debugger;
									return `${record['pmSchedule.name']} for ${record.equipment_unit_number}`;
								},
							},
							{
								label: 'Status',
								name: 'pm_status_name',
							},
							{
								label: 'Next PM Date',
								name: 'nextPmDate',
								viewerFormatter: formatDateValue,
							},
							json?.overduePms > 0 && {
								label: 'Overdue PMs',
								name: 'overduePms',
							},
						],
					},
					{
						"type": "FieldSet",
						"title": "Calculation Details",
						"reference": "calcDetails",
						"defaults": {},
						"items": [
							{
								label: 'Controlling Method',
								name: 'controllingMethod',
								tooltip: 'Indicates whether the calculation was based on days or usage (meter). ' +
										'If both methods are applicable, the one resulting in the earlier PM date is chosen.',
							},
							(json?.pm_status_id === PM_STATUSES__OVERDUE || json?.pm_status_id === PM_STATUSES__PM_DUE) && {
								label: 'Grace Period End Date',
								name: 'maxGracePeriodDateTime',
								viewerFormatter: formatDateValue,
							},
							{
								label: 'Last Reset Date',
								name: 'resetDate',
								tooltip: 'Indicates whether the calculation was based on days or usage (meter). ' +
										'If both methods are applicable, the one resulting in the earlier PM date is chosen.',
								viewerFormatter: formatDateValue,
							},
							json?.workOrder?.title && {
								label: 'Work Order',
								name: 'workOrder.title',
							},
							json?.workOrder?.service_order && {
								label: 'Work Order',
								name: 'workOrder.service_order',
							},
							{
								label: 'Meter Accrued Since Last PM',
								name: 'meterAccruedSinceLatestPm',
								viewerFormatter: formatMeterValue,
							},
							{
								label: 'Meter Remaining Until Next PM',
								name: 'meterRemainingUntilNextPm',
								viewerFormatter: formatMeterValue,
							},
							{
								label: 'Days Since Last PM',
								name: 'daysSinceLatestPm',
								viewerFormatter: formatDaysValue,
							},
							{
								label: 'Days Left Until Next PM',
								name: 'daysLeft',
								viewerFormatter: formatDaysValue,
							},
							// json?.isDelayed && {
							// 	label: 'Is Delayed',
							// 	name: 'isDelayed',
							// },
							// json?.isOverride && {
							// 	label: 'Is Override',
							// 	name: 'isOverride',
							// },
						]
					},
					{
						"type": "FieldSet",
						"title": "PM Schedule Config",
						"reference": "pmSchedule",
						"defaults": {},
						"items": [
							json?.pmSchedule?.interval_days && {
								label: 'Interval Days',
								name: 'pmSchedule.interval_days',
							},
							json?.pmSchedule?.interval_meter && {
								label: 'Interval Meter',
								name: 'pmSchedule.interval_meter',
								viewerFormatter: formatMeterValue,
							},
							{
								label: 'Mode',
								name: 'pmScheduleMode',
							},
						]
					},
					{
						"type": "FieldSet",
						"title": "Equipment",
						"reference": "equipment",
						"defaults": {},
						"items": [
							{
								label: 'In Service Date',
								name: 'inServiceDate',
								viewerFormatter: formatDateValue,
							},
							{
								label: 'Latest Meter Reading',
								name: 'latestMeterReading',
								viewerFormatter: formatMeterValue,
							},
							{
								label: 'Avg Daily Meter',
								name: 'avgDailyMeter',
								viewerFormatter: formatMeterValue,
							},
						]
					},

				]
			}
		];

	flattenedJson.pmScheduleMode = getPmScheduleMode(json?.pmSchedule.pm_schedule_mode_id);

	return <Panel
				title="PM Calculation Info"
				className="PmCalcViewer-Panel"
				isScrollable={true}
				footer={<Footer className="justify-end">
								<Button
									{...testProps('closeBtn')}
									key="closeBtn"
									onPress={onClose}
									className="text-white"
									text="Close"
								/>
						</Footer>}
			>
				<Viewer
					record={flattenedJson}
					items={items}
				/>
				{/* <VStack className="PmCalcDebugViewer-VStack p-4">
					
					<Text>Equipment: {metersPmSchedule.meters__nickname}</Text>
					<Json
						value={metersPmSchedule.meters_pm_schedules__debug_json}
						displaySize="expanded"
						editable={false}
						collapsed={2}
					/>
				</VStack> */}
			</Panel>;
}