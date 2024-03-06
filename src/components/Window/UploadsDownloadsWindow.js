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
import _ from 'lodash';

export default function UploadsDownloadsWindow(props) {
	const
		{
			Repository,
		} = props,
		[fileValue, setFileValue] = useState(null),
		[width, height] = useAdjustedWindowSize(400, 400),
		onDownload = () => {
			const
				baseURL = Repository.api.baseURL,
				model = Repository.name,
				filterData = Repository.filters.reduce((result, current) => {
					result[current.name] = current.value;
					return result;
				}, {}),
				url = baseURL + model + '/downloadGridContents',
				options = {
					// method: 'GET',
					method: 'POST',
					body: JSON.stringify(filterData),
					headers: _.merge({ 'Content-Type': 'application/json' }, Repository.headers),
				};
			downloadWithFetch(url, options);
		},
		onUpload = () => {
			const r = Repository;
			debugger;
			// upload fileValue

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
									onPress: onDownload,
								},
								{
									type: 'DisplayField',
									text: 'Upload an Excel file to the current grid.',
									mt: 10,
								},
								{
									type: 'File',
									name: 'file',
									onChangeValue: setFileValue,
									accept: '.xlsx',
								},
								{
									type: 'Button',
									text: 'Upload',
									isEditable: false,
									leftIcon: <Icon as={Excel} />,
									isDisabled: !fileValue,
									onPress: onUpload,
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

