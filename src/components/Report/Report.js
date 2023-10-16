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
import Form from '../Form/Form.js';
import withComponent from '../Hoc/withComponent.js';
import ChartLine from '../Icons/ChartLine.js';
import Pdf from '../Icons/Pdf.js';
import Excel from '../Icons/Excel.js';
import UiGlobals from '../../UiGlobals.js';
import _ from 'lodash';

const
	PDF = 'PDF',
	EXCEL = 'PhpOffice';

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
		styles = UiGlobals.styles,
		url = UiGlobals.baseURL + 'Reports/getReport',
		buttons = [],
		downloadWithFetch = (data) => {
			const options = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			};
			fetch(url, options)
				.then( res => res.blob() )
				.then( blob => {
					const
						winName = 'ReportWindow',
						opts = 'resizable=yes,height=600,width=800,location=0,menubar=0,scrollbars=1',
						externalWindow = window.open('', winName, opts),
						file = externalWindow.URL.createObjectURL(blob);
					externalWindow.location.assign(file);
				});
		},
		getReport = (reportType, data) => {
			const params = {
					report_id: reportId,
					outputFileType: reportType,
					showReportHeaders,
					// download_token, // not sure this is needed
					...data,
				},
				closeWindow = reportType === EXCEL;

			downloadWithFetch(params, closeWindow);
		};

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
			key: 'ExcelBtn',
			text: 'Download Excel',
			leftIcon: <Icon as={Excel} size="md" color="#fff" />,
			onPress: (data) => getReport(EXCEL, data),
			ml: 1,
		});
	}
	if (!disablePdf) {
		buttons.push({
			key: 'pdfBtn',
			text: 'Download PDF',
			leftIcon: <Icon as={Pdf} size="md" color="#fff" />,
			onPress: (data) => getReport(PDF, data),
			ml: 1,
		});
	}
	return <Column w="100%" borderWidth={1} borderColor="primary.300" pt={4} mb={3}>
				<Row>
					{icon && <Column>{icon}</Column>}
					<Column>
						<Text fontSize="2xl">{title}</Text>
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