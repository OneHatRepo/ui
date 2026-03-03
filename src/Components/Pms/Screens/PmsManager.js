import { useState, useEffect, } from 'react';
import { useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import {
	selectTreeSelection,
} from '@src/Models/Slices/AppSlice';
import {
	NODE_TYPES__FLEETS,
	NODE_TYPES__EQUIPMENT,
} from '@src/Constants/NodeTypes.js';
import oneHatData from '@onehat/data';
import testProps from '../../../Functions/testProps.js';
import verifyCanCrud from '../../../Functions/verifyCanCrudPmEvents.js';
import ManagerScreen from '../../Screens/Manager.js';
import Bell from '../../Icons/Bell.js';
import ClockRegular from '../../Icons/ClockRegular.js';
import OilCan from '../../Icons/OilCan.js';
import TabBar from '../../Tab/TabBar.js';
import TreeSpecific from '../Layout/TreeSpecific/TreeSpecific.js';
import UpcomingPmsGrid from '@src/Components/Grid/UpcomingPmsGrid.js';
import PmEventsFilteredGridEditor from '@src/Components/Grid/PmEventsFilteredGridEditor.js';
import PmEventsFilteredSideGridEditor from '@src/Components/Grid/PmEventsFilteredSideGridEditor.js';
import _ from 'lodash';

const EmptyWrapper = ({ children }) => {
	return <>{children}</>;
};

export default function PmsManager(props) {
	const {
			Wrapper = EmptyWrapper,
		} = props,
		treeSelection = useSelector(selectTreeSelection),
		isActive = useIsFocused(),
		[defaultMeterId, setDefaultMeterId] = useState(null),
		[Equipment] = useState(() => oneHatData.getRepository('Equipment', true)),
		treeNode = treeSelection?.[0],
		isFleet = treeNode?.nodeType === NODE_TYPES__FLEETS,
		isEquipment = treeNode?.nodeType === NODE_TYPES__EQUIPMENT;

	useEffect(() => {
		if (isEquipment) {
			(async () => {
				// Fetch the primary_meter_id for this Equipment
				const idToUse = treeNode?.actualId || treeNode?.id;
				let entity = Equipment.getById(idToUse);
				if (!entity) {
					entity = await Equipment.loadOneAdditionalEntity(idToUse);
				}
				let defaultMeterId = null;
				if (entity && !entity.equipment__has_multiple_meters) {
					defaultMeterId = entity.equipment__primary_meter_id;
				}
				setDefaultMeterId(defaultMeterId);
			})();
		} else {
			setDefaultMeterId(null);
		}
	}, [treeNode]);
		
	if (!isActive) {
		return null;
	}

	let fleetId = null,
		selectorId = null,
		selectorSelectedField = undefined; // so the default prop assignment will work in Grid (won't work with null)
	if (isFleet) {
		selectorId = 'pm_events__fleet_id';
		selectorSelectedField = 'actualId';
		fleetId = treeNode.actualId;
	} else if (isEquipment) {
		selectorId = 'pm_events__equipment_id';
		selectorSelectedField = 'actualId';
		fleetId = treeNode.equipment__fleet_id;
	}

	const
		gridProps = {
			reference: 'PmEventsGridEditor',
			canRecordBeEdited: verifyCanCrud,
			canRecordBeDeleted: verifyCanCrud,
			canRecordBeDuplicated: verifyCanCrud,
			selectorId,
			selectorSelected: treeSelection[0],
			selectorSelectedField,
			defaultValues: defaultMeterId ? {
				pm_events__meter_id: defaultMeterId,
			} : undefined,
		};

	return <TabBar
				{...testProps('PmsManager')}
				reference="PmsManager"
				tabs={[
					{
						title: 'Upcoming PMs',
						icon: Bell,
						...testProps('UpcomingPmsGrid'),
						content: <Wrapper>
									<TreeSpecific>
										<UpcomingPmsGrid
											reference="UpcomingPmsGrid"
											nodeType={treeNode?.nodeType}
											nodeId={treeNode?.[selectorSelectedField]}
										/>
									</TreeSpecific>
								</Wrapper>,
					},
					{
						title: 'PM Events',
						icon: ClockRegular,
						...testProps('PmsManager'),
						content: <ManagerScreen
									title="PmEvents"
									icon={OilCan}
									reference="PmEventsManager"
									fullModeComponent={<Wrapper>
															<TreeSpecific>
																<PmEventsFilteredGridEditor
																	{...gridProps}
																/>
															</TreeSpecific>
														</Wrapper>}
									sideModeComponent={<Wrapper>
															<TreeSpecific>
																<PmEventsFilteredSideGridEditor
																	{...gridProps}
																/>
															</TreeSpecific>
														</Wrapper>}
								/>,
					},
				]}
			/>;
}
