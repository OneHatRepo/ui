import { useState, useEffect, } from 'react';
import {
	Text,
	VStack,
} from '@project-components/Gluestack';
import oneHatData from '@onehat/data';
import {
	ASYNC_OPERATION_MODES__INIT,
	ASYNC_OPERATION_MODES__START,
	ASYNC_OPERATION_MODES__PROCESSING,
	ASYNC_OPERATION_MODES__RESULTS,
} from '../../../Constants/Progress.js';
import { EDITOR_TYPE__PLAIN } from '../../../Constants/Editor.js';
import Form from '../../Form/Form.js';
import Panel from '../../Panel/Panel.js';
import inArray from '../../../Functions/inArray.js';
import withAlert from '../../Hoc/withAlert.js';
import withComponent from '../../Hoc/withComponent.js';
import AsyncOperation from '../../Layout/AsyncOperation';
import testProps from '../../../Functions/testProps.js';
import Button from '../../Buttons/Button.js';
import Toolbar from '../../Toolbar/Toolbar.js';
import Xmark from '../../Icons/Xmark.js';
import * as yup from 'yup';


// This is the body of a Modal


function AssignTechnician(props) {
	const {
			selection,
			hideModal,
			isSingle = false,

			// withComponent
			self,

			// withAlert
			alert,
		} = props,
		[mode, setMode] = useState(ASYNC_OPERATION_MODES__INIT),
		[meter, setMeter] = useState(null),
		[pmScheduleId, setPmScheduleId] = useState(null),
		[pmScheduleName, setPmScheduleName] = useState(null),
		Fleets = oneHatData.getRepository('Fleets'),
		Equipment = oneHatData.getRepository('Equipment'),
		[Meters] = useState(() => oneHatData.getRepository('Meters', true)),
		[MetersPmSchedules] = useState(() => oneHatData.getRepository('MetersPmSchedules', true));

	useEffect(() => {
		if (!isSingle) {
			return;
		}

		(async () => {
			const meterId = selection[0].equipment__primary_meter_id;
			let entity = Meters.getById(meterId);
			if (!entity) {
				entity = await Meters.loadOneAdditionalEntity(meterId);
			}
			if (!entity) {
				alert('Could not get Meter.');
			}
			setMeter(entity);

			// if Meter has only one PmSchedule, select it; if not show the Form to select a PmSchedule.
			MetersPmSchedules.setBaseParam('conditions[meters_pm_schedules__meter_id]', meterId);
			await MetersPmSchedules.load();
			const meterPmSchedule = MetersPmSchedules.entities;
			if (meterPmSchedule.length === 1) {
				setPmScheduleId(meterPmSchedule[0].id);
				setPmScheduleName(meterPmSchedule[0].pm_schedules__name);
			}

		})();
	}, [selection, isSingle]);

	useEffect(() => {
		// cleanup repositories when modal is closed
		return () => {
			if (Meters?.id) {
				oneHatData.deleteRepository(Meters.id);
			}
			if (MetersPmSchedules?.id) {
				oneHatData.deleteRepository(MetersPmSchedules.id);
			}
		};
	}, [Meters, MetersPmSchedules]);

	if (!selection[0]?.repository) {
		return;
	}

	if (isSingle && !meter) {
		return;
	}

	// construct assignTo (e.g. 'all equipment in Peoria', 'all equipment in 3 fleets', 'Unit 12345' etc)
	let nodeType = selection[0]?.nodeType || 'Equipment', // LitesTree has nodeType, EquipmentGrid does not
		assignTo = '',
		hiddenFieldName = 'equipment_id';
	if (nodeType === 'Fleets') {
		assignTo = 'all equipment in ';
		hiddenFieldName = 'fleet_id';
	}
	if (selection.length === 1) {
		assignTo += selection[0].displayValue;
	} else {
		assignTo += selection.length + ' ' + nodeType.charAt(0).toLowerCase() + nodeType.slice(1); // make first letter lower case
	}

	if (isSingle && !pmScheduleId) {
		// show Form to get PmSchedule
		return <Panel
					title="Select PM Schedule"
					isCollapsible={false}
					className="h-full"
				>
					<Form
						parent={self}
						reference="SelectPmSchedule"
						items={[
							{
								type: 'DisplayField',
								text: `Please select a PM Schedule of '${assignTo}' to assign to.`,
								className: 'mb-2',
							},
							{
								label: 'PM Schedule',
								name: 'pm_schedule_id',
								type: 'PmSchedulesCombo',
								baseParams: {
									'conditions[meters_pm_schedules__meter_id]': meter.id,
									leftJoinWith: 'MetersPmSchedules',
								},
								className: 'mb-1 mt-4',
								tooltip: 'Which PM Schedule to assign.',
							},
						]}
						validator={yup.object({
							pm_schedule_id: yup.number().required(),
						})}
						startingValues={{
							pm_schedule_id: null,
						}}
						editorType={EDITOR_TYPE__PLAIN}
						onCancel={hideModal}
						onClose={hideModal}
						onSubmit={(values) => {
							const
								pm_schedule_id = values.pm_schedule_id,
								Repository = self.children.SelectPmSchedule.children.pm_schedule_id.repository,
								pmSchedule = Repository.getById(pm_schedule_id);
							setPmScheduleId(pm_schedule_id);
							setPmScheduleName(pmSchedule.displayValue);
						}}
						submitBtnLabel="Select"
					/>
				</Panel>;
	}


	const formVars = {
		items: [
			{
				type: 'DisplayField',
				text: `You are about to assign a technician to '${assignTo}'` + 
						(isSingle ? " for PM Schedule '" + pmScheduleName + "'" : ' for all PM Schedules') + '.',
			},
			{
				type: 'PmTechniciansCombo',
				name: 'user_id',
				label: 'Technician',
				className: 'mb-1 mt-4',
				tooltip: 'Which technician to assign.',
			},
			{
				type: 'Hidden',
				name: hiddenFieldName,
			},
		],
		validator: yup.object({
			user_id: yup.number().integer().required(),
		}),
		startingValues: {
			user_id: null,
			pm_schedule_id: pmScheduleId,
			[hiddenFieldName]: selection.map(item => item.actualId || item.id).join(','),
		},
	};

	return <VStack className="h-full">
				<AsyncOperation
					Repository={selection[0]?.nodeType === 'Fleets' ? Fleets : Equipment}
					title="Assign Technician"
					isCollapsible={false}
					reference="AssignTechnician"
					process="AssignTechnician"
					getProgressUpdates={true}
					getInitialProgress={false}
					updateInterval={1000}
					onChangeMode={setMode}
					_form={formVars}
				/>
				<Toolbar>
					<Button
						{...testProps('cancelBtn')}
						key="cancelBtn"
						variant="outline"
						icon={Xmark}
						onPress={() => hideModal()}
						className="text-white"
						text={inArray(mode, [ASYNC_OPERATION_MODES__INIT, ASYNC_OPERATION_MODES__START]) ? 'Cancel' : (mode === ASYNC_OPERATION_MODES__PROCESSING ? 'Wait' : 'Close')}
						isDisabled={mode === ASYNC_OPERATION_MODES__PROCESSING}
					/>
				</Toolbar>
			</VStack>;

}

function withAdditionalProps(WrappedComponent) {
	return (props) => {
		return <WrappedComponent
					reference="AssignTechnician"
					{...props}
				/>;
	};
}

export default withAdditionalProps(withComponent(withAlert(AssignTechnician)));