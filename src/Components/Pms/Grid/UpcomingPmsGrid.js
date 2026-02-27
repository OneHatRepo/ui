import { useState, useEffect, } from 'react';
import {
	VStack,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import {
	PM_EVENT_TYPES__DELAY_BY_DAYS,
} from '../../../Constants/PmEventTypes.js';
import {
	PM_STATUSES__PM_DUE,
	PM_STATUSES__DELAYED,
	PM_STATUSES__WILL_CALL,
	PM_STATUSES__OVERDUE,
} from '../../../Constants/PmStatuses.js';
import {
	EDITOR_TYPE__WINDOWED,
} from '../../../Constants/Editor.js';
import {
	WO_CLASSES__PM,
} from '@src/Constants/WoClasses.js';
import oneHatData from '@onehat/data';
import Grid from '../../Grid/Grid.js';
import Loading from '../../Messages/Loading.js';
import IconButton from '../../Buttons/IconButton.js';
import ScreenHeader from '../../Layout/ScreenHeader.js';
import withAlert from '../../Hoc/withAlert.js';
import withComponent from '../../Hoc/withComponent.js';
import withData from '../../Hoc/withData.js';
import withSelection from '../../Hoc/withSelection.js';
import withWindowedEditor from '../../Hoc/withWindowedEditor.js';
import useAdjustedWindowSize from '../../../Hooks/useAdjustedWindowSize.js';
import Calculator from '../../Icons/Calculator.js';
import Clipboard from '../../Icons/Clipboard.js';
import OilCan from '../../Icons/OilCan.js';
import Bump from '../../Icons/Bump.js';
import BumpPmsEditorWindow from '../Window/BumpPmsEditorWindow.js';
import PmCalcDebugViewer from '../../Viewer/PmCalcDebugViewer.js';
import {
	EquipmentIcon,
} from '@src/Components/Icons/index';
import EquipmentEditor from '@src/Components/Editor/EquipmentEditor.js';
import UiGlobals from '../../../UiGlobals.js';


function UpcomingPmsGrid(props) {
	const {
			onAdd: onAddBumper,
			addWorkOrder,
			editWorkOrder,
			setWorkOrderIsIgnoreNextSelectionChange,
			setWorkOrderSelection,
			setWithEditListeners,
			setIsEditorShown,
			nodeId,
			nodeType,

			// withAlert
			alert,

			// withComponent
			self,

			// withModal
			showModal,
			hideModal,

			// config
			includeWorkOrderButton = false,
			getRowProps = (item) => {
				const rowProps = {
					borderBottomWidth: 1,
					borderBottomColor: 'trueGray.500',
				};
				if (item.meters_pm_schedules__pm_status_id === PM_STATUSES__PM_DUE) {
					rowProps.bg = '#f9eabb';
				}
				if (item.meters_pm_schedules__pm_status_id === PM_STATUSES__DELAYED) {
					rowProps.bg = '#d4fed2';
				}
				if (item.meters_pm_schedules__pm_status_id === PM_STATUSES__WILL_CALL) {
					rowProps.bg = '#cdf1ff';
				}
				if (item.meters_pm_schedules__pm_status_id === PM_STATUSES__OVERDUE) {
					rowProps.bg = '#ffd1d1';
				}
				return rowProps;
			},
		} = props,
		styles = UiGlobals.styles,
		UpcomingPms = oneHatData.getRepository('UpcomingPms'),
		[Equipment] = useState(() => oneHatData.getRepository('Equipment', true)),
		[WorkOrders] = useState(() => oneHatData.getRepository('WorkOrders', true)),
		[isReady, setIsReady] = useState(false),
		[width, height] = useAdjustedWindowSize(styles.DEFAULT_WINDOW_WIDTH, styles.DEFAULT_WINDOW_HEIGHT),
		onBump = async (metersPmSchedule) => {
			setWithEditListeners({
				onAfterAddSave: () => {
					setIsEditorShown(false);
				},
			});
			onAddBumper(null, {
				pm_events__meter_id: metersPmSchedule.meters_pm_schedules__meter_id,
				pm_events__pm_schedule_id: metersPmSchedule.meters_pm_schedules__pm_schedule_id,
				pm_events__pm_event_type_id: PM_EVENT_TYPES__DELAY_BY_DAYS,
				pm_events__interval: 30,
			});
		},	
		onAddEditWorkOrder = async (metersPmSchedule) => {
			if (!metersPmSchedule.meters_pm_schedules__has_open_work_order) {
				addWorkOrder(null, {
					work_orders__wo_class_id: WO_CLASSES__PM,
					work_orders__equipment: JSON.stringify([{
						id: metersPmSchedule.meters_pm_schedules__meter_id,
						text: metersPmSchedule.equipment__nickname,
					}]),
					work_orders__pm_schedule_id: metersPmSchedule.meters_pm_schedules__pm_schedule_id,
				});
			} else {
				await WorkOrders.loadOneAdditionalEntity(metersPmSchedule.meters_pm_schedules__open_work_order_id);
				const workOrderToEdit = WorkOrders.getById(metersPmSchedule.meters_pm_schedules__open_work_order_id);
				setWorkOrderIsIgnoreNextSelectionChange(true);
				setWorkOrderSelection([workOrderToEdit]);
				editWorkOrder();
			}
		},
		onViewEquipment = async (metersPmSchedule) => {
			const
				Editor = EquipmentEditor,
				id = metersPmSchedule.meters__equipment_id,
				repository = Equipment;
			if (repository.isLoading) {
				await repository.waitUntilDoneLoading();
			}
			let record = repository.getById(id);
			if (!record && repository.loadOneAdditionalEntity) {
				record = await repository.loadOneAdditionalEntity(id);
			}
			if (!record) {
				alert('Equipment record could not be found!');
				return;
			}
			
			showModal({
				title: 'Equipment Viewer',
				body: <Editor
							editorType={EDITOR_TYPE__WINDOWED}
							parent={self}
							reference="viewer"
							Repository={repository}
							isEditorViewOnly={true}
							selection={[record]}
							onEditorClose={hideModal}
							className={`
								w-full
								p-0
							`}
						/>,
				onCancel: hideModal,
				h: height,
				w: width,
			});
		},
		onShowCalcDebug = async (metersPmSchedule) => {
			showModal({
				body: <PmCalcDebugViewer
							parent={self}
							reference="viewer"
							metersPmSchedule={metersPmSchedule}
							onClose={hideModal}
							className={`
								w-full
								p-0
							`}
						/>,
				onCancel: hideModal,
				h: height,
				w: width,
			});
		};

	useEffect(() => {
		if (!UpcomingPms) {
			return;
		}
		if (!nodeId || !nodeType) {
			return;
		}

		(async () => {
			let isChanged = false;
			if (!UpcomingPms.hasBaseParam('forUpcomingPms')) {
				UpcomingPms.setBaseParam('forUpcomingPms', true);
				isChanged = true;
			}
			if (nodeId !== null && typeof nodeId !== 'undefined' && UpcomingPms.getBaseParam('nodeId') !== nodeId) {
				UpcomingPms.setBaseParam('nodeId', nodeId);
				isChanged = true;
			}
			if (nodeType !== null && typeof nodeType !== 'undefined' && UpcomingPms.getBaseParam('nodeType') !== nodeType) {
				UpcomingPms.setBaseParam('nodeType', nodeType);
				isChanged = true;
			}
			if (isChanged && UpcomingPms.isLoaded) {
				await UpcomingPms.reload();
			}
			setIsReady(true);
		})();
		
	}, [nodeId, nodeType, UpcomingPms]);

	if (!isReady) {
		return <Loading />;
	}

	return <VStack className="flex-1 w-full">
				<ScreenHeader title="Upcoming PMs" icon={OilCan} />
				<Grid
					reference="upcomingPmsGrid"
					Repository={UpcomingPms}
					useFilters={true}
					searchAllText={false}
					forceLoadOnRender={true}
					areCellsScrollable={false}
					showClearFiltersButton={false}
					customFilters={[
						{
							id: 'nextPmDue',
							title: 'Show Thru',
							tooltip: 'This is the latest date to display',
							field: 'nextPmDue',
							type: 'Date',
							value: UiGlobals.dates.oneMonthFromNow,
							getRepoFilters: (value) => {
								return [
									{
										name: 'nextPmDue',
										value,
									},
								];
							},
						},
						{
							id: 'showOverdue',
							title: 'Overdue?',
							tooltip: 'Should we include overdue PMs?',
							field: 'showOverdue',
							type: 'Toggle',
							value: true,
							getRepoFilters: (value) => {
								return [
									{
										name: 'showOverdue',
										value,
									},
								];
							},
						},
						{
							id: 'showDue',
							title: 'Due?',
							tooltip: 'Should we include due PMs?',
							field: 'showDue',
							type: 'Toggle',
							value: true,
							getRepoFilters: (value) => {
								return [
									{
										name: 'showDue',
										value,
									},
								];
							},
						},
						{
							id: 'showOk',
							title: 'OK?',
							tooltip: 'Should we include OK PMs?',
							field: 'showOk',
							type: 'Toggle',
							value: false,
							getRepoFilters: (value) => {
								return [
									{
										name: 'showOk',
										value,
									},
								];
							},
						},
						{
							id: 'showWillCall',
							title: 'Will Call?',
							tooltip: 'Should we include "will call" PMs?',
							field: 'showWillCall',
							type: 'Toggle',
							value: false,
							getRepoFilters: (value) => {
								return [
									{
										name: 'showWillCall',
										value,
									},
								];
							},
						},
					]}
					columnsConfig={[
						{
							id: 'bump',
							header: 'Bump',
							w: 70,
							isSortable: false,
							isEditable: false,
							isReorderable: false,
							isResizable: false,
							isHidable: false,
							renderer: (entity, fieldName, cellProps, key) => {
								const className = clsx(
									cellProps.className,
									'flex',
									'items-center',
									'justify-center',
								);
								return <IconButton
											key={key}
											{...cellProps}
											className={className}
											icon={Bump}
											_icon={{
												size: 'xl',
											}}
											onPress={() => onBump(entity)}
											tooltip="Bump"
										/>;
							},
						},
						...(includeWorkOrderButton ? [
							{
								id: 'wo',
								header: '+WO',
								w: 60,
								isSortable: false,
								isEditable: false,
								isReorderable: false,
								isResizable: false,
								isHidable: false,
								renderer: (entity, fieldName, cellProps, key) => {
									const className = clsx(
										cellProps.className,
										'flex',
										'items-center',
										'justify-center'
									);
									return <IconButton
												key={key}
												{...cellProps}
												className={className}
												icon={Clipboard}
												_icon={{
													size: 'xl',
												}}
												onPress={() => onAddEditWorkOrder(entity)}
												tooltip="Create/edit a work order to reset this PM. Only resets when work order is closed."
											/>;
								},
							},
						] : []),
						{
							id: 'calc',
							header: 'Calc',
							w: 60,
							isSortable: false,
							isEditable: false,
							isReorderable: false,
							isResizable: false,
							isHidable: false,
							renderer: (entity, fieldName, cellProps, key) => {
								const className = clsx(
									cellProps.className,
									'flex',
									'items-center',
									'justify-center'
								);
								return <IconButton
											key={key}
											{...cellProps}
											className={className}
											icon={Calculator}
											_icon={{
												size: 'xl',
											}}
											onPress={() => onShowCalcDebug(entity)}
											tooltip="Show how this PM's 'Next PM Due' was calculated"
										/>;
							},
						},
						{
							id: 'meter',
							header: 'EQ',
							w: 60,
							isSortable: false,
							isEditable: false,
							isReorderable: false,
							isResizable: false,
							isHidable: false,
							renderer: (entity, fieldName, cellProps, key) => {
								const className = clsx(
									cellProps.className,
									'flex',
									'items-center',
									'justify-center'
								);
								return <IconButton
											key={key}
											{...cellProps}
											className={className}
											icon={EquipmentIcon}
											_icon={{
												size: 'xl',
											}}
											onPress={() => onViewEquipment(entity)}
											tooltip="View Equipment"
										/>;
							},
						},
						{
							id: 'meters__nickname',
							header: 'Eq/Meter',
							fieldName: 'meters__nickname',
							isSortable: false,
							isEditable: false,
							isReorderable: false,
							isResizable: true,
							w: 150,
						},
						...(includeWorkOrderButton ? [
							{
								id: 'meters_pm_schedules__has_open_work_order',
								header: 'WIP?',
								fieldName: 'meters_pm_schedules__has_open_work_order',
								isSortable: true,
								isEditable: true,
								isReorderable: true,
								isResizable: true,
								w: 60,
							},
						] : []),
						{
							id: 'meters_pm_schedules__next_pm_due',
							header: 'Next PM Due',
							fieldName: 'meters_pm_schedules__next_pm_due',
							isSortable: true,
							isEditable: false,
							isReorderable: false,
							isResizable: true,
							w: 140,
						},
						{
							id: 'pm_statuses__name',
							header: 'PM Status',
							fieldName: 'pm_statuses__name',
							isSortable: true,
							isEditable: false,
							isReorderable: false,
							isResizable: true,
							w: 100,
						},
						{
							id: 'meters_pm_schedules__latest_pm_date',
							header: 'Last PM',
							fieldName: 'meters_pm_schedules__latest_pm_date',
							isSortable: true,
							isEditable: false,
							isReorderable: false,
							isResizable: true,
							w: 140,
						},
						{
							id: 'pm_schedules__name',
							header: 'Pm Schedule',
							fieldName: 'pm_schedules__name',
							isSortable: false,
							isEditable: false,
							isReorderable: false,
							isResizable: true,
							w: 250,
						},
						{
							id: 'meters_pm_schedules__display_path',
							header: 'Path',
							fieldName: 'meters_pm_schedules__display_path',
							isSortable: true,
							isEditable: false,
							isReorderable: false,
							isResizable: true,
							w: 300,
						},
					]}
					getRowProps={getRowProps}
				/>
			</VStack>;
}

function reloadUpcomingPms() {
	oneHatData.getRepository('UpcomingPms').reload();
}

function withBumper(WrappedComponent) {
	const Component = withAlert(withData(withSelection(withWindowedEditor(WrappedComponent))));
	return (props) => {
		const {
				onAdd,
				onEdit,
				setSelection,
				setIsIgnoreNextSelectionChange,
				Repository,
				...propsToPass
			} = props;
			
		return <Component
					{...propsToPass}
					reference="bumper"
					Editor={BumpPmsEditorWindow}
					model="PmEvents"
					onAdd={reloadUpcomingPms}
					alreadyHasWithEditor={false}
					alreadyHasWithData={false}
					alreadyHasWithSelection={false}
					addWorkOrder={onAdd}
					editWorkOrder={onEdit}
					setWorkOrderSelection={setSelection}
					setWorkOrderIsIgnoreNextSelectionChange={setIsIgnoreNextSelectionChange}
				/>;
	};
}

function withWorkOrdersAdder(WrappedComponent) {
	const Component = withAlert(withData(withSelection(withWindowedEditor(WrappedComponent))));
	return (props) => {
		const {
			BumpWorkOrdersEditorWindow,
		} = props;
		
		if (!BumpWorkOrdersEditorWindow) {
			return <WrappedComponent {...props} />;
		}

		return <Component
					{...props}
					reference="workOrdersAdder"
					Editor={BumpWorkOrdersEditorWindow}
					model="WorkOrders"
					onAdd={reloadUpcomingPms}
					onSave={reloadUpcomingPms}
					onDelete={reloadUpcomingPms}
				/>;
	};
}

function withReference(WrappedComponent) {
	return (props) => {
		return <WrappedComponent
					reference="UpcomingPmsGrid"
					{...props}
				/>;
	};
}

export default withReference(withComponent(withWorkOrdersAdder(withBumper(UpcomingPmsGrid))));
