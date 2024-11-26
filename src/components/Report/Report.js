import React from 'react';
import {
	Column,
	Icon,
	Row,
	Text,
} from 'native-base';
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
	propsIcon.size = 60;
	propsIcon.px = 5;
	let icon = props.icon;
	if (_.isEmpty(icon)) {
		icon = ChartLine;
	}
	if (React.isValidElement(icon)) {
		if (!_.isEmpty(propsIcon)) {
			icon = React.cloneElement(icon, {...propsIcon});
		}
	} else {
		icon = <Icon as={icon} {...propsIcon} />;
	}

	if (!disableExcel) {
		buttons.push({
			...testProps('excelBtn'),
			key: 'excelBtn',
			text: 'Download Excel',
			leftIcon: <Icon as={Excel} size="md" color="#fff" />,
			onPress: (data) => getReport({
				reportId,
				data,
				reportType: REPORT_TYPES__EXCEL,
				showReportHeaders,
			}),
			ml: 1,
		});
	}
	if (!disablePdf) {
		buttons.push({
			...testProps('pdfBtn'),
			key: 'pdfBtn',
			text: 'Download PDF',
			leftIcon: <Icon as={Pdf} size="md" color="#fff" />,
			onPress: (data) => getReport({
				reportId,
				data,
				reportType: REPORT_TYPES__PDF,
				showReportHeaders,
			}),
			ml: 1,
		});
	}
	return <Column {...testProps('Report-' + reportId)} w="100%" borderWidth={1} borderColor="primary.300" pt={4} mb={3}>
				<Row>
					{icon && <Column>{icon}</Column>}
					<Column flex={1}>
						<Text fontSize="2xl" maxWidth="100%">{title}</Text>
						<Text fontSize="sm">{description}</Text>
					</Column>
				</Row>
				<Form
					type={EDITOR_TYPE__PLAIN}
					additionalFooterButtons={buttons}
					{...props._form}
				/>
			</Column>;
}

export default withComponent(Report);