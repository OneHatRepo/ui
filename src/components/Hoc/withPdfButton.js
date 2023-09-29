import { useState, } from 'react';
import {
	Column,
	Button,
	Modal,
	Row,
} from 'native-base';
import Inflector from 'inflector-js';
import qs from 'qs';
import FormPanel from '../Panel/FormPanel.js';
import inArray from '../../Functions/inArray.js';
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
			buildModalItems = () => {
				const modalItems = _.map(_.clone(items), (item, ix) => buildNextLayer(item, ix, columnDefaults)); // clone, as we don't want to alter the item by reference

				if (!_.isEmpty(ancillaryItems)) {
					modalItems.push({
						type: 'FieldSet',
						title: 'Ancillary Items',
						items: _.map(_.clone(ancillaryItems), (ancillaryItem) => { // clone, as we don't want to alter the item by reference
							let name;
							if (ancillaryItem.model) {
								name = Inflector.underscore(ancillaryItem.model);
							} else {
								name = ancillaryItem.title;
							}
							name = 'ancillary___' + name;
							return {
								title: ancillaryItem.title,
								name,
								type: 'Checkbox',
							};
						}),
					});
				}
	
				return modalItems;
			},
			buildNextLayer = (item, ix, defaults) => {
				let {
						type,
						name,
						items,
					} = item;
				if (inArray(type, ['Column', 'FieldSet'])) {
					if (_.isEmpty(items)) {
						return null;
					}
					const defaults = item.defaults;
					item.children = _.map(items, (item, ix) => {
						return buildNextLayer(item, ix, defaults);
					});
					return item;
				}

				if (!item.title) {
					const propertyDef = name && Repository?.getSchema().getPropertyDefinition(name);
					if (propertyDef.title) {
						item.title = propertyDef.title;
					}
				}
				item.type = 'Checkbox';
				return item;
			},
			getStartingValues = (modalItems) => {
				const startingValues = {};
				function walkTree(item) {
					let {
							name,
							items,
						} = item;
					if (items) {
						_.each(items, (item) => {
							walkTree(item);
						});
					}
					if (name) {
						startingValues[name] = true;
					}
				}
				_.each(modalItems, walkTree);
				return startingValues;
			},
			getPdf = (data) => {
				const
					url = UiGlobals.baseURL + model + '/viewPdf?',
					queryString = qs.stringify(data);
				window.open(url + queryString, '_blank');
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
		if (additionalEditButtons !== additionalViewButtons) { // Ensure they're NOT the same object, otherwise this would be adding it twice!
			additionalViewButtons.unshift(button);
		}
	
		let modal = null;
		if (isModalShown) {
			const
				modalItems = buildModalItems(),
				startingValues = getStartingValues(modalItems);
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
								startingValues={startingValues}
								onCancel={(e) => {
									setIsModalShown(false);
								}}
								onSave={(data, e) => {
									getPdf(data);
									setIsModalShown(false);
								}}
								saveBtnLabel="View PDF"
							/>
						</Column>
					</Modal>;
		}
		return <>
				<WrappedComponent
					{...props}
					additionalEditButtons={additionalEditButtons}
					additionalViewButtons={additionalViewButtons}
				/>;
				{modal}
			</>;
	};
}