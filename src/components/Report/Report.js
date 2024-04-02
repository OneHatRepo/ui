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
				// opens a new window
				const win = window.open('');
				win.document.write('<html><head><title>Downloading</title></head><body><img style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);" src="' + 
										'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAABkCAIAAAD/pVUqAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDkuMS1jMDAyIDc5LmYzNTRlZmM3MCwgMjAyMy8xMS8wOS0xMjowNTo1MyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI1LjUgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RDc4MDYwODdFNUZGMTFFRUIxOUJGNTc2RTUzMEJGN0MiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RDc4MDYwODhFNUZGMTFFRUIxOUJGNTc2RTUzMEJGN0MiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpENzgwNjA4NUU1RkYxMUVFQjE5QkY1NzZFNTMwQkY3QyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpENzgwNjA4NkU1RkYxMUVFQjE5QkY1NzZFNTMwQkY3QyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Prs4AtcAABFASURBVHja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' +
										'"></body></html>');
				const options = {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(params),
				};
				downloadWithFetch(url, options, win);
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
	return <VStack w="100%" borderWidth={1} borderColor="primary.300" pt={4} mb={3}>
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