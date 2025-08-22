import { cloneElement, isValidElement } from 'react';
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
import { EDITOR_TYPE__PLAIN } from '../../Constants/Editor';
import {
	UI_MODE_WEB,
	CURRENT_MODE,
} from '../../Constants/UiModes.js';
import {
	REPORT_TYPES__EXCEL,
	REPORT_TYPES__PDF,
} from '../../Constants/ReportTypes.js';
import Form from '../Form/Form.js';
import IconButton from '../Buttons/IconButton.js';
import withComponent from '../Hoc/withComponent.js';
import withAlert from '../Hoc/withAlert.js';
import testProps from '../../Functions/testProps.js';
import ChartLine from '../Icons/ChartLine.js';
import Pdf from '../Icons/Pdf.js';
import Excel from '../Icons/Excel.js';
import getReport from '../../Functions/getReport.js';
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
			disableExcel = false,
			showReportHeaders = true,
			isQuickReport = false,
			additionalData = {},
			quickReportData = {},
			alert,
		} = props,
		buttons = [],
		onPressQuickReport = () => {
			downloadReport({
				reportId,
				reportType: REPORT_TYPES__EXCEL,
				showReportHeaders,
				data: {
					...additionalData,
					...quickReportData,
				},
			});
		},
		downloadReport = (args) => {
			getReport(args);
			alert('Download started');
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
						onPress={onPressQuickReport}
						className={clsx(
							'flex-1',
							'items-center',
							'justify-center',
							'flex-col',
							'bg-white',
							'p-3',
							'rounded-lg',
							'border',
							'border-primary-300',
							'hover:bg-primary-300',
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
					</Pressable>
				</VStackNative>;
	}

	if (!disableExcel) {
		buttons.push({
			...testProps('excelBtn'),
			key: 'excelBtn',
			text: 'Download Excel',
			icon: Excel,
			onPress: (data) => downloadReport({
				reportId,
				data: {
					...data,
					...additionalData,
				},
				reportType: REPORT_TYPES__EXCEL,
				showReportHeaders,
			}),
			disabledOnInvalid: true,
		});
	}
	if (!disablePdf) {
		buttons.push({
			...testProps('pdfBtn'),
			key: 'pdfBtn',
			text: 'Download PDF',
			icon: Pdf,
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
	return <VStackNative
				{...testProps('Report-' + reportId)}
				className={clsx(
					'w-full',
					'border',
					'border-primary-300',
					'p-4',
					'mb-3',
					'bg-white',
					'rounded-lg',
					'shadow-sm',
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
					type={EDITOR_TYPE__PLAIN}
					additionalFooterButtons={buttons}
					{...props._form}
				/>
			</VStackNative>;
}

export default withComponent(withAlert(Report));