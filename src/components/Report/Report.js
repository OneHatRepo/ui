import { cloneElement, isValidElement } from 'react';
import {
	Box,
	HStack,
	Icon,
	Text,
	VStack,
	VStackNative,
} from '@project-components/Gluestack';
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
import withComponent from '../Hoc/withComponent.js';
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
			// icon,
			disablePdf = false,
			disableExcel = false,
			includePresets = false,
			showReportHeaders = true,
			h = '300px',
		} = props,
		buttons = [];

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

	if (!disableExcel) {
		buttons.push({
			...testProps('excelBtn'),
			key: 'excelBtn',
			text: 'Download Excel',
			icon: Excel,
			onPress: (data) => getReport({
				reportId,
				data,
				reportType: REPORT_TYPES__EXCEL,
				showReportHeaders,
			}),
		});
	}
	if (!disablePdf) {
		buttons.push({
			...testProps('pdfBtn'),
			key: 'pdfBtn',
			text: 'Download PDF',
			icon: Pdf,
			onPress: (data) => getReport({
				reportId,
				data,
				reportType: REPORT_TYPES__PDF,
				showReportHeaders,
			}),
		});
	}
	return <VStackNative
				{...testProps('Report-' + reportId)}
				className={`
					w-full
					border
					border-primary-300
					p-4
					mb-3
					rounded-lg
				`}
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

export default withComponent(Report);