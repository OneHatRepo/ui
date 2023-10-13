import {
	Column,
	Icon,
	Row,
	Text,
} from 'native-base';
import Button from '../Buttons/Button';
import Footer from '../Layout/Footer.js';
import Pdf from '../Icons/Pdf.js';
import { EDITOR_TYPE__PLAIN } from '../../Constants/Editor';
import {
	UI_MODE_WEB,
	CURRENT_MODE,
} from '../../Constants/UiModes.js';
// import Excel from '../Icons/Excel.js'; // TODO: make this icon
import UiGlobals from '../../UiGlobals.js';
import _ from 'lodash';

const
	PDF = 'PDF',
	EXCEL = 'PhpOffice';

export default function Report(props) {
	if (CURRENT_MODE !== UI_MODE_WEB) {
		return <Text>Reports are web only!</Text>;
	}
	const {
			title,
			description,
			icon,
			items = [],
			reportId,
			disablePdf = false,
			disableExcel = false,
			includePresets = false,
			showReportHeaders = true,
			h = '300px',
		} = props,
		styles = UiGlobals.styles,
		url = UiGlobals.baseURL + 'Reports/getReport',
		buttons = [],
		openWindowWithPostRequest = (params) => {
			const
				winName = 'ReportWindow',
				opts = 'resizable=yes,height=600,width=800,location=0,menubar=0,scrollbars=1',
				params = { 'param1' : '1','param2' :'2'},
				form = document.createElement("form");
			form.setAttribute('method', 'post');
			form.setAttribute('action', url);
			form.setAttribute('target', winName);
			_.each(params, (value, key) => {
				const input = document.createElement('input');
				input.type = 'hidden';
				input.name = key;
				input.value = value;
				form.appendChild(input);
			});
			document.body.appendChild(form);
			window.open('', winName, opts);
			form.target = winName;
			form.submit();
			document.body.removeChild(form);
		},
		getReport = (reportType) => {
			const params = {
				report_id: reportId,
				outputFileType: reportType,
				showReportHeaders,
				// download_token, // not sure this is needed
			};


			// TODO: add in the values from the form 
			// (how do I get those without using the Form's buttons?)


			openWindowWithPostRequest(params);
		};
	if (!disableExcel) {
		buttons.push(<Button
						key="ExcelBtn"
						onPress={() => getReport(EXCEL)}
					>Excel</Button>);
	}
	if (!disablePdf) {
		buttons.push(<Button
						key="pdfBtn"
						leftIcon={<Icon as={Pdf} />}
						onPress={() => getReport(PDF)}
					>PDF</Button>);
	}
	return <Column w="100%">
				<Row>
					{icon && <Column>{icon}</Column>}
					<Column>
						<Text fontSize="xl">{title}</Text>
						<Text fontSize="sm">{description}</Text>
						<Form
							items={items}
							type={EDITOR_TYPE__PLAIN}
							
						/>
					</Column>
				</Row>

				<Footer justifyContent="flex-end" alignItems="flex-end">
					{buttons}
				</Footer>
			</Column>;
}
