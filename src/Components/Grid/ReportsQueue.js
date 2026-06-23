
import { useState, useEffect, } from 'react';
import {
	Box,
	Text,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import { useSelector, useDispatch } from 'react-redux';
import oneHatData from '@onehat/data';
import {
	setIsWaitModalShown,
} from '../../Models/Slices/SystemSlice';
import {
	selectUser,
} from '../../Models/Slices/AuthSlice.js';
import {
	REPORT_QUEUE_STATUS__ALL,
} from '../../Constants/ReportQueueStatuses.js';
import IconButton from '../Buttons/IconButton';
import withAlert from '../../Components/Hoc/withAlert.js';
import useForceUpdate from '../../Hooks/useForceUpdate.js';
import getComponentFromType from '../../Functions/getComponentFromType.js';
import Rotate from '../Icons/Rotate.js';
import X from '../Icons/X.js';

function ReportsQueue(props) {
	const {
			// withAlert
			alert,
			showInfo,
		} = props,
		dispatch = useDispatch(),
		forceUpdate = useForceUpdate(),
		user = useSelector(selectUser),
		UtilQueuedReports = oneHatData.getRepository('UtilQueuedReports'),
		onRequeueFailedJob = async (entity) => {
			dispatch(setIsWaitModalShown(true));

			try {
				const result = await UtilQueuedReports._send('POST', 'UtilQueuedReports/requeueFailedJob', {
					util_queued_report_id: entity.id,
				});
				const response = UtilQueuedReports._processServerResponse(result);
				if (response.success) {

					await entity.reload();
					
					forceUpdate();

					showInfo('Job requeued successfully.');
				}

			} catch (error) {
				alert('An error occurred while requeuing the job. Please try again.');
			} finally {
				dispatch(setIsWaitModalShown(false));
			}
		},
		onCancel = async (entity) => {
			dispatch(setIsWaitModalShown(true));

			try {
				const result = await UtilQueuedReports._send('POST', 'UtilQueuedReports/cancelPendingJob', {
					util_queued_report_id: entity.id,
				});
				const response = UtilQueuedReports._processServerResponse(result);
				if (response.success) {

					await entity.reload();
					
					forceUpdate();

					showInfo('Job cancelled successfully.');
				}

			} catch (error) {
				alert('An error occurred while cancelling the job. Please try again.');
			} finally {
				dispatch(setIsWaitModalShown(false));
			}
		};

	useEffect(() => {

		setTimeout(() => {
			UtilQueuedReports.reload();
		}, 60 * 1000);
		
	}, [UtilQueuedReports]);
	
	const UtilQueuedReportsFilteredGridEditor = getComponentFromType('UtilQueuedReportsFilteredGridEditor');
	
	return <UtilQueuedReportsFilteredGridEditor
				reference="ReportsQueue"
				usePermissions={false}
				Repository={UtilQueuedReports}
				
				title="Reports Queue"
				className="w-full h-full"
				searchAllText={false}
				showClearFiltersButton={false}
				customFilters={[
					{
						id: 'status',
						title: 'Status',
						tooltip: 'Select which status to display in the queue.',
						field: 'status',
						type: 'ReportQueueStatusesCombo',
						value: REPORT_QUEUE_STATUS__ALL,
						getRepoFilters: (value) => {
							return [
								{
									name: 'status',
									value,
								},
							];
						},
					},
					{
						id: 'showAllUsers',
						title: 'All Users?',
						tooltip: 'Should we include queued reports from ALL users, so you can see the overall queue status?',
						field: 'showAllUsers',
						type: 'Toggle',
						value: false,
						getRepoFilters: (value) => {
							return [
								{
									name: 'showAllUsers',
									value,
								},
							];
						},
					},
				]}
				columnsConfig={[
					{
						id: 'action',
						header: 'Action',
						w: 70,
						isSortable: false,
						isEditable: false,
						isReorderable: false,
						isResizable: false,
						isHidable: false,
						renderer: (entity, fieldName, cellProps, key) => {
							const
								isUser = entity.util_queued_reports__user_id === user?.id,
								className = clsx(
									cellProps.className,
									'flex',
									'items-center',
									'justify-center',
								);
							let action,
								icon,
								tooltip;
							if (entity.util_queued_reports__is_in_process && isUser) {
								action = onCancel;
								icon = X;
								tooltip = 'Cancel this report';
							} else if (entity.util_queued_reports__success === false && isUser) {
								action = onRequeueFailedJob;
								icon = Rotate;
								tooltip = 'Requeue this failed report';
							} else {
								// no available action
								return <Box {...cellProps} className={className} />;
							}
							return <IconButton
										key={key}
										{...cellProps}
										className={className}
										icon={icon}
										_icon={{
											size: 'xl',
										}}
										onPress={() => action(entity)}
										tooltip={tooltip}
									/>;
						},
					},
					{
						"id": "util_queued_reports__report_title",
						"header": "Report", // MOD
						"fieldName": "util_queued_reports__report_title",
						"isSortable": false,
						"isEditable": false,
						"isReorderable": true,
						"isResizable": true,
						"w": 250 // MOD
					},
					{
						"id": "util_queued_reports__report_preset_name",
						"header": "Preset", // MOD
						"fieldName": "util_queued_reports__report_preset_name",
						"isSortable": false,
						"isEditable": false,
						"isReorderable": true,
						"isResizable": true,
						"w": 150
					},
					{
						"id": "util_queued_reports__submitted",
						"header": "Submitted",
						"fieldName": "util_queued_reports__submitted",
						"isSortable": true,
						"isEditable": true,
						"isReorderable": true,
						"isResizable": true,
						"w": 200
					},
					{
						"id": "util_queued_reports__is_in_process",
						"header": "In Process?",
						"fieldName": "util_queued_reports__is_in_process",
						"isSortable": true,
						"isEditable": true,
						"isReorderable": true,
						"isResizable": true,
						"w": 100
					},
					{
						"id": "util_queued_reports__success",
						"header": "Success",
						"fieldName": "util_queued_reports__success",
						"isSortable": true,
						"isEditable": true,
						"isReorderable": true,
						"isResizable": true,
						"w": 100
					},
					{
						"id": "util_queued_reports__run_time",
						"header": "Run Time",
						"fieldName": "util_queued_reports__run_time",
						"isSortable": true,
						"isEditable": true,
						"isReorderable": true,
						"isResizable": true,
						"w": 100
					},
				]}
				getRowProps={(item) => {
					const rowProps = {
						borderBottomWidth: 1,
						borderBottomColor: 'trueGray.500',
					};
					if (item.util_queued_reports__is_in_process) {
						rowProps.bg = '#f9eabb';
					} else if (item.util_queued_reports__success === false) {
						rowProps.bg = '#ffd1d1';
					}
					return rowProps;
				}}
				disableAdd={true}
				disableEdit={true}
				disableDelete={true}
				disableDuplicate={true}
				disableView={true}
				disableCopy={true}

				{...props}
			/>;
}

export default withAlert(ReportsQueue);