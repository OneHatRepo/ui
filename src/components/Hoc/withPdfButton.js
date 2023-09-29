import { useState, } from 'react';
import {
	Column,
	Button,
	Modal,
	Row,
} from 'native-base';
import qs from 'qs';
import FormPanel from '@onehat/ui/src/Components/Panel/FormPanel.js';
import { EDITOR_TYPE__PLAIN } from '@onehat/ui/src/Constants/Editor.js';
import UiGlobals from '../../UiGlobals.js';
import _ from 'lodash';

export default function withPdfButton(WrappedComponent) {
	return (props) => {

		if (!props.showViewPdfBtn) {
			// bypass everything.
			// If we don't do this, we get an infinite recursion with Form
			// because this HOC wraps Form and uses Form itself.
			return <WrappedComponent {...props} />;
		}

		const
			{
				additionalEditButtons = [],
				additionalViewButtons = [],
				items = [],
				ancillaryItems = [],
				columnDefaults = {},

				// withData
				Repository,
				model,
			} = props,
			[isModalShown, setIsModalShown] = useState(false),
			getPdf = (data) => {
				const
					url = UiGlobals.baseURL + model + '/viewPdf?',
					queryString = qs.stringify(data);
				window.open(url + queryString, '_blank');
			},
			getModalItems = () => {
				const modalItems = {};
	
				// first to items based on items
	
				// then do items based on ancillaryItems
	
				return modalItems;
			};

		const button = <Button
							key="viewPdfBtn"
							borderRadius="md"
							colorScheme="primary"
							flexDirection="row"
							justifyContent="center"
							alignItems="center"
							px={4}
							onPress={(e) => setIsModalShown(true)}
						>View PDF</Button>;
		additionalEditButtons.unshift(button);
		additionalViewButtons.unshift(button);
	
		let modal = null;
		if (isModalShown) {
			const modalItems = getModalItems();
			modal = <Modal
						isOpen={true}
						onClose={() => setIsModalShown(false)}
					>
						<Column bg="#fff" w={500}>
							<FormPanel
								title="PDF Fields to Show"
								instructions="Please select which fields to show in the PDF."
								editorType={EDITOR_TYPE__PLAIN}
								flex={1}
								Repository={Repository}
								items={modalItems}
								onCancel={(e) => {
									setIsModalShown(false);
								}}
								onSave={(data, e) => {
									getPdf(data);
									setIsModalShown(false);
								}}
							/>
						</Column>
					</Modal>;
		}
		return <>
				<WrappedComponent
					{...props}
				/>;
				{modal}
			</>;
	};
}