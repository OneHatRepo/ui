import {
	Text,
	VStack,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import {
	PM_SCHEDULE_MODES__HISTORICAL_USAGE,
	PM_SCHEDULE_MODES__EXPECTED_USAGE,
	PM_SCHEDULE_MODES__NO_ESTIMATION,
	PM_SCHEDULE_MODES__WILL_CALL,
} from '../../Constants/PmScheduleModes.js';
import {
	PM_STATUSES__OK,
} from '../../Constants/PmStatuses.js';
import Button from '../Buttons/Button.js';
import Json from '../Form/Field/Json.js';
import Panel from '../Panel/Panel.js';
import Footer from '../Layout/Footer.js';
import Viewer from '../Viewer/Viewer.js';
import testProps from '../../Functions/testProps.js';
import _ from 'lodash';

export default function PmCalcDebugViewer(props) {

	const {
			metersPmSchedule,
			onClose,
		} = props,
		json = metersPmSchedule?.properties.meters_pm_schedules__debug_json.json,
		flatten = (obj, prefix = '', result = {}) => {
			for (const key in obj) {
				if (obj.hasOwnProperty(key)) {
					const
						newKey = prefix ? `${prefix}.${key}` : key,
						value = obj[key];
					
					if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
						// Recursively flatten nested objects
						flatten(value, newKey, result);
					} else if (Array.isArray(value)) {
						// Flatten arrays using index as key
						value.forEach((item, index) => {
							const arrayKey = `${newKey}.${index}`;
							if (item !== null && typeof item === 'object') {
								flatten(item, arrayKey, result);
							} else {
								result[arrayKey] = item;
							}
						});
					} else {
						// Assign primitive values and null
						result[newKey] = value;
					}
				}
			}
			return result;
		},
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
						"title": "General",
						"reference": "general",
						"defaults": {},
						"items": [
							{
								label: 'PM Schedule',
								name: 'pmSchedule.name',
							},
							{
								label: 'Next PM Date',
								name: 'nextPmDate',
							},
							{
								label: 'Status',
								name: 'pm_status_name',
							},
							json.overduePms > 0 && {
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
							json.pm_status_id === 6 && {
								label: 'Grace Period End Date',
								name: 'maxGracePeriodDateTime',
							},
							{
								label: 'Last Reset Date',
								name: 'resetDate',
								tooltip: 'Indicates whether the calculation was based on days or usage (meter). ' +
										'If both methods are applicable, the one resulting in the earlier PM date is chosen.',
							},
							json.workOrder?.title && {
								label: 'Work Order',
								name: 'workOrder.title',
							},
							json.workOrder?.service_order && {
								label: 'Work Order',
								name: 'workOrder.service_order',
							},
							{
								label: 'Meter Accrued Since Last PM',
								name: 'meterAccruedSinceLatestPm',
							},
							{
								label: 'Meter Remaining Until Next PM',
								name: 'meterRemainingUntilNextPm',
							},
							{
								label: 'Days Since Last PM',
								name: 'daysSinceLatestPm',
							},
							{
								label: 'Days Left Until Next PM',
								name: 'daysLeft',
							},
							// json.isDelayed && {
							// 	label: 'Is Delayed',
							// 	name: 'isDelayed',
							// },
							// json.isOverride && {
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
							json.pmSchedule.interval_days && {
								label: 'Interval Days',
								name: 'pmSchedule.interval_days',
							},
							json.pmSchedule.interval_meter && {
								label: 'Interval Meter',
								name: 'pmSchedule.interval_meter',
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
							},
							{
								label: 'Latest Meter Reading',
								name: 'latestMeterReading',
							},
							{
								label: 'Avg Daily Meter',
								name: 'avgDailyMeter',
							},
						]
					},

				]
			}
		];

	flattenedJson.pmScheduleMode = getPmScheduleMode(json.pmSchedule.pm_schedule_mode_id);

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