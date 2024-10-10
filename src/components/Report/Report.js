import React from 'react';
import {
	VStack,
	Icon,
	HStack,
	Text,
} from '@gluestack-ui/themed';
import { EDITOR_TYPE__PLAIN } from '../../Constants/Editor';
import {
	UI_MODE_WEB,
	CURRENT_MODE,
} from '../../Constants/UiModes.js';
import Form from '../Form/Form.js';
import withComponent from '../Hoc/withComponent.js';
import testProps from '../../Functions/testProps.js';
import ChartLine from '../Icons/ChartLine.js';
import Pdf from '../Icons/Pdf.js';
import Excel from '../Icons/Excel.js';
import UiGlobals from '../../UiGlobals.js';
import downloadInBackground from '../../Functions/downloadInBackground.js';
import downloadWithFetch from '../../Functions/downloadWithFetch.js';
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
		url = UiGlobals.baseURL + 'Reports/getReport',
		buttons = [],
		getReport = (reportType, data) => {
			const params = {
					report_id: reportId,
					outputFileType: reportType,
					showReportHeaders,
					// download_token, // not sure this is needed
					...data,
				};

			if (reportType === EXCEL) {
				downloadInBackground(url, params);
			} else {
				const options = {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(params),
				};
				downloadWithFetch(url, options);
			}
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
			...testProps('excelBtn'),
			key: 'excelBtn',
			text: 'Download Excel',
			leftIcon: <Icon as={Excel} size="md" color="#fff" />,
			onPress: (data) => getReport(EXCEL, data),
			ml: 1,
		});
	}
	if (!disablePdf) {
		buttons.push({
			...testProps('pdfBtn'),
			key: 'pdfBtn',
			text: 'Download PDF',
			leftIcon: <Icon as={Pdf} size="md" color="#fff" />,
			onPress: (data) => getReport(PDF, data),
			ml: 1,
		});
	}
	return <VStack {...testProps('Report-' + reportId)} w="100%" borderWidth={1} borderColor="primary.300" pt={4} mb={3}>
				<HStack>
					{icon && <VStack>{icon}</VStack>}
					<VStack flex={1}>
						<Text fontSize="2xl" maxWidth="100%">{title}</Text>
						<Text fontSize="sm">{description}</Text>
					</VStack>
				</HStack>
				<Form
					type={EDITOR_TYPE__PLAIN}
					additionalFooterButtons={buttons}
					{...props._form}
				/>
			</VStack>;
}

export default withComponent(Report);