/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */
import oneHatData from '@onehat/data';
import Editor from '../../Editor/Editor.js';
import useAdjustedWindowSize from '../../../Hooks/useAdjustedWindowSize.js';

export default function MetersEditor(props) {
	const {
			selection,

			// withModal
			showModal,
			hideModal,

			// Customization
			includeExtendedCalculatedFields = false,
			onManagePmTemplates,
		} = props,
		meter = selection[0],
		meter_id = meter?.id,
		meter_display = meter?.displayValue,
		equipment_id = meter?.meters__equipment_id,
		[w1, h1] = useAdjustedWindowSize(500, 500),
		[w2, h2] = useAdjustedWindowSize(700, 500),
		Equipment = oneHatData.getRepository('Equipment'),
		handleManagePmTemplates = () => {
			if (!onManagePmTemplates) {
				return;
			}

			const
				equipment = Equipment.getById(equipment_id),
				equipment_display = equipment?.displayValue;

			onManagePmTemplates({
				equipment_id,
				equipment_display,
				meter_id,
				meter_display,
				showModal,
				hideModal,
				h1,
				w1,
				h2,
				w2,
			});
		},
		items = [
			{
				type: 'Column',
				flex: 1,
				defaults: {},
				items: [
					{
						type: 'FieldSet',
						title: 'Specs',
						reference: 'specs',
						defaults: {},
						items: [
							{
								name: 'meters__name',
							},
							{
								name: 'meters__meter_type',
							},
							{
								name: 'meters__in_service_date',
							},
							{
								name: 'meters__in_service_meter',
							},
							{
								name: 'meters__expected_meter_per_mo',
							},
							{
								name: 'meters__available_meter_per_wk',
							},
							{
								name: 'meters__pm_schedules',
								mustSaveBeforeEditingJoinData: true,
								joinDataConfig: {
									also_resets: {
										getBaseParams: (values, outerValueId) => {
											const baseParams = {
												'conditions[MetersPmSchedules.meter_id]': meter_id,
											};
											if (outerValueId) {
												baseParams['conditions[MetersPmSchedules.pm_schedule_id <>]'] = outerValueId;
											}
											return baseParams;
										},
									},
								},
							},
							onManagePmTemplates && {
								name: 'managePmTemplatesBtn',
								type: 'Button',
								text: 'Manage PM Templates',
								isEditable: false,
								isEditingEnabledInPlainEditor: true,
								isHiddenInViewMode: true,
								isDisabled: true, // TODO: flesh this out when new PM Manager is built
								onPress: handleManagePmTemplates,
							},
							{
								name: 'meters__comments',
							},
						],
					},
					{
						type: 'FieldSet',
						title: 'Calculated',
						reference: 'calculated',
						defaults: {},
						items: [
							{
								name: 'meters__is_primary',
								isEditable: false,
								isEditingEnabledInPlainEditor: true,
							},
							{
								name: 'meters__nickname',
								isEditable: false,
								isEditingEnabledInPlainEditor: true,
							},
							{
								name: 'meters__latest_meter_reading',
								isEditable: false,
								isEditingEnabledInPlainEditor: true,
							},
							...(includeExtendedCalculatedFields ? [
								{
									name: 'meters__latest_inspection_date',
									isEditable: false,
									isEditingEnabledInPlainEditor: true,
								},
								{
									name: 'meters__latest_inspection_passed',
									isEditable: false,
									isEditingEnabledInPlainEditor: true,
								},
							] : []),
						],
					},
				],
			},
		],
		ancillaryItems = [
			{
				title: 'Meter Readings',
				type: 'MeterReadingsGridEditor',
				selectorId: 'meter_readings__meter_id',
			},
			{
				title: 'Pm Events',
				type: 'PmEventsGridEditor',
				selectorId: 'pm_events__meter_id',
			},
			// {
			// 	title: 'Work Orders',
			// 	type: 'WorkOrdersGridEditor',
			// 	selectorId: 'work_orders__meter_id',
			// },
		],
		columnDefaults = {};

	return <Editor
				reference="MetersEditor"
				title="Meters"
				items={items}
				ancillaryItems={ancillaryItems}
				columnDefaults={columnDefaults}
				{...props}
			/>;
}
