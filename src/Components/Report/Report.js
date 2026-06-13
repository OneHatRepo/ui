import { cloneElement, isValidElement, useState, } from 'react';
import {
	Box,
	HStack,
	Icon,
	Pressable,
	Text,
	VStack,
	VStackNative,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import { useSelector, useDispatch } from 'react-redux';
import { EDITOR_TYPE__PLAIN } from '../../Constants/Editor';
import {
	selectUser,
} from '../../Models/Slices/AuthSlice.js';
import {
	UI_MODE_WEB,
	CURRENT_MODE,
} from '../../Constants/UiModes.js';
import {
	REPORT_TYPES__EXCEL,
	REPORT_TYPES__PDF,
} from '../../Constants/ReportTypes.js';
import oneHatData from '@onehat/data';
import Form from '../Form/Form.js';
import IconButton from '../Buttons/IconButton.js';
import withComponent from '../Hoc/withComponent.js';
import withAlert from '../Hoc/withAlert.js';
import getComponentFromType from '../../Functions/getComponentFromType.js';
import testProps from '../../Functions/testProps.js';
import ChartLine from '../Icons/ChartLine.js';
import Calendar from '../Icons/Calendar.js';
import Plus from '../Icons/Plus.js';
import Pdf from '../Icons/Pdf.js';
import Share from '../Icons/Share.js';
import Excel from '../Icons/Excel.js';
import getReport from '../../Functions/getReport.js';
import * as yup from 'yup';
import _ from 'lodash';

function Report(props) {
	if (CURRENT_MODE !== UI_MODE_WEB) {
		return <Text>Reports are web only!</Text>;
	}
	const {
			title,
			description,
			reportId,
			disablePdf = false,
			pdfButtonText = 'Download PDF',
			disableExcel = false,
			excelButtonText = 'Download Excel',
			showReportHeaders = true,
			isQuickReport = false,
			isDisabled = false,
			usePresets = false,
			useQueue = false,
			useScheduledReports = false,
			disabledMessage = 'Report is Disabled',
			additionalData = {},
			quickReportData = {},

			// withAlert
			alert,
			showInfo,
			showModal,
			hideModal,

			// withComponent
			self,
		} = props,
		formProps = props._form || {},
		hasFormItems = formProps?.items?.[0]?.items?.length,
		showPresets = usePresets && hasFormItems,
		user = useSelector(selectUser),
		[isValid, setIsValid] = useState(!hasFormItems), // if there are no form items, consider the form valid by default; otherwise, start as invalid until the form says otherwise
		getCurrentReportFormData = () => {
			const
				form = self?.children?.form,
				formValues = form?.formGetValues?.();
			if (!_.isPlainObject(formValues)) {
				alert('Unable to get form data');
				return {};
			}
			return formValues;
		},
		setCurrentReportFormData = (data) => {
			const form = self?.children?.form;
			if (!form || !_.isPlainObject(data)) {
				alert('Unable to set form data');
				return;
			}
			_.each(data, (value, key) => {
				form.formSetValue(key, value);
			});
		},
		footerProps = formProps.footerProps || {},
		footerClassName = clsx(
			footerProps.className,
			'flex-wrap',
		),
		onPressQuickReport = () => {
			return downloadReport({
				reportId,
				reportType: REPORT_TYPES__EXCEL,
				showReportHeaders,
				data: {
					...additionalData,
					...quickReportData,
				},
			});
		},
		downloadReport = async (args) => {
			try {
				alert('Download started');
				await getReport(args);
			} catch (error) {
				alert(error?.message || 'Unable to download report. Please try again.');
			}
		},
		manageReportSchedules = async (formData) => {
			// onBeforeAdd to add the formData to the new schedule

			// It should handle things differently if showPresets is true/false.
			// If true, schedule presets.
			// If false, just schedule the report without form data.
			

			// Show a modal with ReportSchedulesGridEditor with baseParams of this reportId, 
			const ReportSchedulesSideGridEditor = getComponentFromType('ReportSchedulesSideGridEditor');
			showModal({
				title: 'Schedules for "' + title + '"',
				body: <ReportSchedulesSideGridEditor
							baseParams={{
								'conditions[user_id]': user.id,
								'conditions[reportid]': reportId,
							}}
						/>,
				canClose: true,
				whichModal: 'schedulesModal',
				h: 800,
				w: 1100,
			});


		},
		getRepository = () => {
			let repository;
			try {
				// There is no 'Reports' repository (bc there is no 'Reports' model), 
				// so just get the first OneBuild repository; doesn't matter which one
	
				repository = oneHatData.getRepositoriesByType('onebuild', true); // true to get the first only

			} catch (error) {
				alert('Error getting repository: ' + (error?.message || error));
				return null;
			}
			return repository;
		},
		addToQueue = async (formData) => {
			const
				repository = getRepository(),
				data = {
					report_id: reportId,
					...formData,
					...additionalData,
				},
				result = await repository._send('POST', 'Reports/addToQueue', data),
				response = repository._processServerResponse(result);
			if (!response.success) {
				alert(response.message || 'Failed to add report to queue');
				return;
			}

			showInfo('Report added to queue.');
		},
		selectReportPreset = (reportPresetId) => {
			// Change the form settings based on the selected preset
			const
				form = self?.children?.form,
				ReportPresets = self?.children?.reportPresetsComboEditor?.repository;
			if (!form || !ReportPresets) {
				return;
			}
			
			const reportPreset = ReportPresets?.getById(reportPresetId);
			if (!reportPreset) {
				alert('Selected report preset not found');
				return;
			}

			// apply the config to the form
			const config = reportPreset.properties.report_presets__config.getParsedValue(); // get the actual JS object
			setCurrentReportFormData(config);
		},
		shareReportPreset = (parent) => {

			// show a Modal with UserSelector, excluding current user.
			showModal({
				title: 'Share Report Preset',
				body: <Form
						instructions="Please select which user to share with."
						editorType={EDITOR_TYPE__PLAIN}
						className="flex-1"
						items={[
							{
								name: 'instructions',
								type: 'DisplayField',
								text: 'Please select which user to share with.',
								className: 'mb-3',
							},
							{
								type: 'Column',
								flex: 1,
								items: [
									{
										name: 'user_id',
										type: 'UsersCombo',
										label: 'User',
										baseParams: {
											'conditions[id <>]': user.id,
										},
									},
								],
							},
						]}
						validator={yup.object({
							user_id: yup.number().integer().required(),
						})}
						onCancel={(e) => {
							hideModal();
						}}
						onClose={(e) => {
							hideModal();
						}}
						onSubmit={async (data, e) => {
							const
								ReportPresets = self?.children?.reportPresetsComboEditor?.repository,
								reportPreset = parent.selection[0],
								params = {
									report_preset_id: reportPreset.id,
									user_id: data.user_id,
								},
								result = await ReportPresets._send('POST', 'ReportPresets/share', params),
								response = ReportPresets._processServerResponse(result);

							// Close the modal
							hideModal();

							if (response.success) {
								showInfo('Report preset shared successfully.');
							}
						}}
					/>,
				canClose: true,
				whichModal: 'shareReportPresetModal',
				h: 220,
				w: 500,
			});
		};

	const propsIcon = props._icon || {};
	propsIcon.className = 'w-full h-full text-primary-500';
	let icon = props.icon;
	if (_.isEmpty(icon)) {
		icon = ChartLine;
	}
	if (isValidElement(icon)) {
		if (!_.isEmpty(propsIcon)) {
			icon = cloneElement(icon, {...propsIcon});
		}
	} else {
		icon = <Icon as={icon} {...propsIcon} />;
	}

	if (isQuickReport) {
		let className = clsx(
			'QuickReport',
			'flex-1',
			'm-2',
		);
		if (props.className) {
			className += ' ' + props.className;
		}
		return <VStackNative
					{...testProps('QuickReport-' + reportId)}
					className={className}
				>
					<Pressable
						onPress={!isDisabled ? onPressQuickReport : null}
						className={clsx(
							'relative', // creates the positioning context for absolute children
							'flex-1',
							'items-center',
							'justify-center',
							'flex-col',
							'bg-white',
							'p-3',
							'rounded-lg',
							'border',
							'border-primary-300',
							!isDisabled ? 'hover:bg-primary-300' : null,
						)}
					>
						{icon}
						<Text
							className={clsx(
								'text-black',
								'text-center',
								'text-[17px]',
								'leading-tight',
								'mt-2',
							)}
						>{title}</Text>
						{isDisabled &&
							<Box
								className={clsx(
									'absolute',
									'h-full',
									'w-full',
									'z-1000',
									'flex',
									'items-center',
									'justify-center',
								)}
							>
								<Box
									className={clsx(
										'absolute',
										'h-full',
										'w-full',
										'rounded-lg',
										'z-0',
										'bg-white',
										'opacity-[0.8]',
									)}
								/>
								<Text
									className={clsx(
										'absolute',
										'h-full',
										'w-full',
										'z-1000',
										'flex',
										'items-center',
										'justify-center',
										'px-[20px]',
										'text-center',
										'text-[23px]',
										'text-red-500',
										'italic',
									)}
								>Disabled</Text>
							</Box>}
					</Pressable>
				</VStackNative>;
	}

	let footerItems = [];
	if (showPresets) { // if no form items, no need for ReportPresets!
		footerItems.push({
			...testProps('reportPresetsComboEditor'),
			parent: self,
			reference: 'reportPresetsComboEditor',
			key: 'reportPresetsComboEditor',
			type: 'ReportPresetsComboEditor',
			tooltip: 'Report Presets',
			placeholder: 'Presets',
			disableAdd: !isValid, // only allow creating a preset if the form is valid, since the preset will capture the current form config
			disableEdit: true, // too complicated to edit, just allow add/delete/share
			className: 'w-[130px]',
			baseParams: {
				'conditions[reportid]': reportId, // reportid is a generated field, so you can search on it, but change capitalization
			},
			onChangeValue: selectReportPreset,
			_grid: {
				onBeforeAdd: (addValues) => {
					// add the current form values to ReportPresets.config when creating a new preset
					return {
						...addValues,
						report_presets__config: {
							...getCurrentReportFormData(),
							report_id: reportId,
						},
					};
				},
				additionalToolbarButtons: [
					{
						...testProps('shareBtn'),
						key: 'shareBtn',
						text: 'Share Report Preset',
						icon: Share,
						getIsButtonDisabled: (selection) => !selection?.[0]?.id,
						handler: shareReportPreset,
					},
				],
			},
		});
	}
	if (useScheduledReports) {
		footerItems.push({
			...testProps('manageReportSchedulesBtn'),
			key: 'manageReportSchedulesBtn',
			type: 'Button',
			tooltip: 'Manage delivery schedules for this report',
			icon: Calendar,
			onPress: manageReportSchedules,
			disableOnInvalid: true,
		});
	}
	if (useQueue) {
		footerItems.push({
			...testProps('queueBtn'),
			key: 'queueBtn',
			type: 'Button',
			tooltip: 'Immediately add to Queue',
			icon: Plus,
			onPress: addToQueue,
			disableOnInvalid: true,
		});
	}
	if (!disableExcel) {
		footerItems.push({
			...testProps('excelBtn'),
			key: 'excelBtn',
			type: 'Button',
			text: excelButtonText,
			icon: Excel,
			tooltip: excelButtonText !== 'Download Excel' ? 'Download Excel' : null,
			onPress: (data) => downloadReport({
				reportId,
				data: {
					...data,
					...additionalData,
				},
				reportType: REPORT_TYPES__EXCEL,
				showReportHeaders,
			}),
			disableOnInvalid: true,
		});
	}
	if (!disablePdf) {
		footerItems.push({
			...testProps('pdfBtn'),
			key: 'pdfBtn',
			type: 'Button',
			text: pdfButtonText,
			icon: Pdf,
			tooltip: pdfButtonText !== 'Download PDF' ? 'Download PDF' : null,
			onPress: (data) => downloadReport({
				reportId,
				data: {
					...data,
					...additionalData,
				},
				reportType: REPORT_TYPES__PDF,
				showReportHeaders,
			}),
			disableOnInvalid: true,
		});
	}
	if (footerItems.length) {
		footerItems = footerItems.map(item => {
			const Component = getComponentFromType(item.type);
			return <Component {...item} />;
		});
	}
	return <VStackNative
				{...testProps('Report-' + reportId)}
				className={clsx(
					'relative', // creates the positioning context for absolute children
					'w-full',
					'border',
					'border-primary-300',
					'mb-3',
					'bg-white',
					'rounded-lg',
					'shadow-sm',
				)}
			>
				<Box
					className={clsx(
						'p-4',
					)}
				>
					<HStack>
						<Box className="w-[50px] mr-4">
							{icon}
						</Box>
						<VStack className="flex-1">
							<Text className="text-2xl max-w-full">{title}</Text>
							<Text className="text-sm">{description}</Text>
						</VStack>
					</HStack>
					<Form
						parent={self}
						reference="form"
						editorType={EDITOR_TYPE__PLAIN}
						additionalFooterItems={footerItems}
						{...formProps}
						footerProps={{
							...footerProps,
							className: footerClassName,
						}}
						onValidityChange={(isValid) => {
							setIsValid(isValid);
						}}
					/>
				</Box>
				{isDisabled &&
					<Box
						className={clsx(
							'absolute',
							'h-full',
							'w-full',
							'z-1000',
							'flex',
							'items-center',
							'justify-center',
						)}
					>
						<Box
							className={clsx(
								'absolute',
								'h-full',
								'w-full',
								'rounded-lg',
								'z-0',
								'bg-white',
								'opacity-[0.8]',
							)}
						/>
						<Text
							className={clsx(
								'absolute',
								'h-full',
								'w-full',
								'z-1000',
								'flex',
								'items-center',
								'justify-center',
								'px-[20px]',
								'text-center',
								'text-[23px]',
								'text-red-500',
								'italic',
							)}
						>{disabledMessage}</Text>
					</Box>}
			</VStackNative>;
}

function withAdditionalProps(WrappedComponent) {
	return (props) => {
		return <WrappedComponent
					reference={props.reference || 'report'}
					{...props}
				/>;
	};
}

export default withAdditionalProps(withComponent(withAlert(Report)));