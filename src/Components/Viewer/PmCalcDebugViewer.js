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
		record = flatten(json),
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
		formatBooleanValue = (value, record, self) => {
			if (value === null || value === undefined) {
				return 'N/A';
			}
			return value ? 'Yes' : 'No';
		},
		formatDaysValue = (value, record, self) => {
			if (value === null || value === undefined) {
				return 'N/A';
			}
			return parseInt(_.round(value), 10);
		},
		formatMeterValue = (value, record, self) => {
			if (value === null || value === undefined) {
				return 'N/A';
			}
			let ret;
			const meterType = parseInt(record?.meter_type, 10);
			let units = meterType === METER_TYPES__HOURS ? METER_TYPES__HOURS_UNITS : meterType === METER_TYPES__MILES ? METER_TYPES__MILES_UNITS : '';
			if (value === 1) {
				units = units.replace(/s$/, ''); // remove plural 's' if value is 1
			}
			switch(meterType) {
				case METER_TYPES__HOURS:
					ret = `${value} ${units}`;
					break;
				case METER_TYPES__MILES:
					ret = `${value} ${units}`;
					break;
			}
			return ret;
		},
		formatDateValue = (value, record, self) => {
			if (value === null || value === undefined) {
				return 'N/A';
			}

			// convert from datetime to pretty-printed date
			return moment(value).format(MOMENT_DATE_FORMAT_6);
		},
		formatStatusValue = (value, record, self) => {
			let ret = value,
				classNames = null;

			switch(record['pm_status_id']) {
				case PM_STATUSES__OVERDUE:
					classNames = [
						'text-red-500',
						'font-bold',
					];
					break;
				case PM_STATUSES__PM_DUE:
					classNames = [
						'text-[#c89903]',
					];
					break;
				case PM_STATUSES__DELAYED:
					classNames = [
						'text-green-500',
					];
					break;
				case PM_STATUSES__WILL_CALL:
					classNames = [
						'text-blue-500',
					];
					break;
			}
			if (classNames) {
				// special formatting
				ret = <Text
							className={clsx(
								classNames,
								'px-3',
								'py-2',
							)}
						>{value}</Text>;
			}
			return ret;
		},
		items = [
			{
				"type": "Column",
				"flex": 1,
				"defaults": {
					labelWidth: 300,
				},
				"items": [
					{
						"type": "FieldSet",
						"title": "Overview",
						"reference": "overview",
						"defaults": {},
						"items": [
							record['pmSchedule.name'] && {
								label: 'PM Schedule',
								name: 'pmSchedule.name',
							},
							record['pm_status_name'] && {
								label: 'Status',
								name: 'pm_status_name',
								viewerFormatter: formatStatusValue,
							},
							record['nextPmDate'] && {
								label: 'Next PM Date',
								name: 'nextPmDate',
								viewerFormatter: formatDateValue,
							},
							record['pm_status_id'] && record['pm_status_id'] === PM_STATUSES__OVERDUE && {
								label: 'Grace Period Ends',
								name: 'maxGracePeriodDateTime',
								viewerFormatter: formatDateValue,
							},
							record['pm_status_id'] && record['pm_status_id'] === PM_STATUSES__OVERDUE && {
								label: 'Overdue by # Cycles',
								name: 'overduePms',
							},
						],
					},
					record['calculationMode'] && {
						"type": "FieldSet",
						"title": "How it was calculated",
						"reference": "calcDetails",
						"defaults": {},
						"items": [
							{
								label: 'Calculation Mode',
								name: 'calculationMode',
							},
							{
								label: 'In Service Date',
								name: 'inServiceDate',
								viewerFormatter: formatDateValue,
							},
							...(record['isOverride'] ? [
								// these items are only for overrides
								{
									label: 'Is Override',
									name: 'isOverride',
									viewerFormatter: formatBooleanValue,
								},
								{
									label: 'Override Event Date',
									name: 'overrideEventDate',
									viewerFormatter: formatDateValue,
								},
							] : []),
							...(!record['isOverride'] ? [
								// these items are only for non-overrides
								{
									label: 'Last Reset Date',
									name: 'resetDate',
									viewerFormatter: formatDateValue,
								},
								record['workOrder.title'] && { // Gingerich
									label: 'Work Order',
									name: 'workOrder.title',
								},
								record['workOrder.service_order'] && { // MH
									label: 'Service Order',
									name: 'workOrder.service_order',
								},
								{
									label: 'Interval Days',
									name: 'intervalDays',
								},
								{
									label: 'Days Left Until Next PM',
									name: 'daysLeft',
									viewerFormatter: formatDaysValue,
								},
								{
									label: 'Interval Meter',
									name: 'intervalMeter',
									viewerFormatter: formatMeterValue,
								},
								typeof record['latestMeterReading.value'] !== 'undefined' && { // typeof so it allows 0
									label: 'Latest Meter Reading',
									name: 'latestMeterReading',
									viewerFormatter: (value, record) => {
										const
											meterValue = formatMeterValue(record['latestMeterReading.value'], record),
											meterDate = formatDateValue(record['latestMeterReading.date'], record);
										return `${meterValue} on ${meterDate}`;
									}
								},
								{
									label: 'Meter Accrued Since Latest PM',
									name: 'meterAccruedSinceLatestPm',
									viewerFormatter: formatMeterValue,
								},
								{
									label: 'Avg Daily Meter',
									name: 'avgDailyMeter',
									viewerFormatter: formatMeterValue,
								},
								{
									label: 'Meter Until Next PM',
									name: 'meterRemainingUntilNextPm',
									viewerFormatter: formatMeterValue,
								},
								{
									label: 'Controlling Method',
									name: 'controllingMethod',
									tooltip: 'Indicates whether the calculation was based on days or usage (meter). ' +
											'If both methods are applicable, the one resulting in the earlier PM date is chosen.',
								},
							] : []),

							...(record['isOverride'] ? [
								// these items are only for delays
								{
									label: 'Is Delayed',
									name: 'isDelayed',
									viewerFormatter: formatBooleanValue,
								},
								{
									label: 'Delay Threshold Date',
									name: 'delayThresholdDate',
									viewerFormatter: formatDateValue,
								},
							] : []),
						]
					},

				]
			}
		];

	record.pmScheduleMode = getPmScheduleMode(json?.pmSchedule.pm_schedule_mode_id);

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
					record={record}
					items={items}
				/>
			</Panel>;
}