/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */
import { useState, } from 'react';
import {
	Icon,
} from 'native-base';
import Excel from '../Icons/Excel';
import Panel from '../Panel/Panel.js';
import Form from '../Form/Form.js';
import useAdjustedWindowSize from '../../Hooks/useAdjustedWindowSize.js';
import downloadWithFetch from '../../Functions/downloadWithFetch.js';
import withAlert from '../Hoc/withAlert.js';
import Cookies from 'js-cookie';
import _ from 'lodash';

function UploadsDownloadsWindow(props) {
	const
		{
			Repository,
			columnsConfig = [],

			// withAlert
			alert,
		} = props,
		[importFile, setImportFile] = useState(null),
		[width, height] = useAdjustedWindowSize(400, 400),
		onDownload = (isTemplate = false) => {
			const
				baseURL = Repository.api.baseURL,
				filters = Repository.filters.reduce((result, current) => {
					result[current.name] = current.value;
					return result;
				}, {}),
				columns = columnsConfig.map((column) => {
					return column.fieldName;
				}),
				order = Repository.getSortField() + ' ' + Repository.getSortDirection(),
				model = Repository.name,
				url = baseURL + 'Reports/getReport',
				download_token = 'dl' + (new Date()).getTime(),
				options = {
					// method: 'GET',
					method: 'POST',
					body: JSON.stringify({
						download_token,
						report_id: 1,
						filters,
						columns,
						order,
						model,
						isTemplate,
					}),
					headers: _.merge({ 'Content-Type': 'application/json' }, Repository.headers),
				},
				fetchWindow = downloadWithFetch(url, options),
				interval = setInterval(function() {
					const cookie = Cookies.get(download_token);
					if (fetchWindow.window && cookie) {
						clearInterval(interval);
						Cookies.remove(download_token);
						fetchWindow.window.close();
					}
				}, 1000);
		},
		onDownloadTemplate = () => {
			onDownload(true);
		},
		onUpload = async () => {
			const
				url = Repository.api.baseURL + Repository.name + '/uploadBatch',
				result = await Repository._send('POST', url, { importFile })
										.catch(error => {
											if (Repository.debugMode) {
												console.log(url + ' error', error);
												console.log('response:', error.response);
											}
										});
			if (Repository.debugMode) {
				console.log('Result ' + url, result);
			}
			const
				parsed = JSON.parse(result.data),
				{
					data,
					success,
					message,
				} = parsed;
			if (!success && message === 'Errors') {
				// assemble the errors from the upload
				const msgElements = ['Could not upload.'];
				_.each(data, (obj) => {
					// {
					// 	"2": "ID does not exist."
					// }
					const line = Object.entries(obj)
										.map(([key, value]) => `Line ${key}: ${value}`)
										.join("\n");
					msgElements.push(line);
				});
				alert(msgElements.join("\n"));
			}
		};
	
	return <Panel
				{...props}
				reference="UploadsDownloadsWindow"
				isCollapsible={false}
				title="Uploads & Downloads"
				bg="#fff"
				w={width}
				h={height}
				flex={null}
			>
				<Form
					{...props}
					items={[
						{
							"type": "Column",
							"flex": 1,
							"defaults": {},
							"items": [
								{
									type: 'DisplayField',
									text: 'Download an Excel file of the current grid contents.',
								},
								{
									type: 'Button',
									text: 'Download',
									isEditable: false,
									leftIcon: <Icon as={Excel} />,
									onPress: () => onDownload(),
								},
								{
									type: 'DisplayField',
									text: 'Upload an Excel file to the current grid.',
									mt: 10,
								},
								{
									type: 'File',
									name: 'file',
									onChangeValue: setImportFile,
									accept: '.xlsx',
								},
								{
									type: 'Button',
									text: 'Upload',
									isEditable: false,
									leftIcon: <Icon as={Excel} />,
									isDisabled: !importFile,
									onPress: onUpload,
								},
								{
									type: 'Button',
									text: 'Get Template',
									isEditable: false,
									onPress: onDownloadTemplate,
									variant: 'ghost',
								},
							]
						},
					]}
					// record={selection}
					// onCancel={onCancel}
					// onSave={onSave}
					// onClose={onClose}
					// onDelete={onDelete}
					// parent={self}
					reference="form"
				/>
			</Panel>;
}

export default withAlert(UploadsDownloadsWindow);