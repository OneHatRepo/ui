import { useState } from 'react';
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
import inArray from '../../../Functions/inArray.js';
import AsyncOperation from '../../Layout/AsyncOperation';
import testProps from '../../../Functions/testProps.js';
import Button from '../../Buttons/Button.js';
import Toolbar from '../../Toolbar/Toolbar.js';
import Xmark from '../../Icons/Xmark.js';
import * as yup from 'yup';


// This is the body of a Modal


export default function BulkAssignTechnician(props) {
	const {
			selection,
			hideModal,
		} = props,
		[mode, setMode] = useState(ASYNC_OPERATION_MODES__INIT),
		FleetsRepository = oneHatData.getRepository('Fleets'),
		EquipmentRepository = oneHatData.getRepository('Equipment');

	if (!selection[0]?.repository) {
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

	return <VStack className="h-full">
				<AsyncOperation
					Repository={selection[0]?.nodeType === 'Fleets' ? FleetsRepository : EquipmentRepository}
					title="Bulk Assign Technician"
					isCollapsible={false}
					reference="BulkAssignTechnician"
					process="BulkAssignTechnician"
					getProgressUpdates={true}
					getInitialProgress={false}
					updateInterval={1000}
					onChangeMode={setMode}
					_form={{
						items: [
							{
								type: 'DisplayField',
								text: `You are about to assign a technician to ${assignTo}.`,
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
							[hiddenFieldName]: selection.map(item => item.actualId).join(','),
						},
					}}
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
