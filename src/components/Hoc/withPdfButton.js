import { useState, } from 'react';
import {
	Column,
	Button,
	Modal,
	Row,
} from 'native-base';
import * as yup from 'yup'; // https://github.com/jquense/yup#string
import Inflector from 'inflector-js';
import qs from 'qs';
import FormPanel from '../Panel/FormPanel.js';
import inArray from '../../Functions/inArray.js';
import useAdjustedWindowSize from '../../Hooks/useAdjustedWindowSize.js';
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
			[width, height] = useAdjustedWindowSize(500, 800);
			buildModalItems = () => {
				const modalItems = _.map(_.cloneDeep(items), (item, ix) => buildNextLayer(item, ix, columnDefaults)); // clone, as we don't want to alter the item by reference

				if (!_.isEmpty(ancillaryItems)) {
					modalItems.push({
						type: 'FieldSet',
						title: 'Ancillary Items',
						defaults: {
							labelWidth: '90%',
						},
						items: _.map(_.cloneDeep(ancillaryItems), (ancillaryItem) => { // clone, as we don't want to alter the item by reference
							let name;
							if (ancillaryItem.model) {
								name = Inflector.underscore(ancillaryItem.model);
							} else {
								name = ancillaryItem.title;
							}
							name = 'ancillary___' + name;
							return {
								title: ancillaryItem.title,
								label: ancillaryItem.title,
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
					if (!item.defaults) {
						item.defaults = {};
					}
					if (type === 'FieldSet') {
						item.showToggleAllCheckbox = true;
					}
					item.defaults.labelWidth = '90%';
					if (!_.isEmpty(items)) {
						const defaults = item.defaults;
						item.children = _.map(items, (item, ix) => {
							return buildNextLayer(item, ix, defaults);
						});
					}
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
			buildValidator = (modalItems) => {

				// TODO: Build a real validator that checks all modalItems as booleans

				return yup.object();
			},
			getStartingValues = (modalItems) => {
				const startingValues = {};
				function walkTree(item) {
					let {
							name,
							items,
						} = item;
					if (!_.isEmpty(items)) {
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
				startingValues = getStartingValues(modalItems),
				validator = buildValidator(modalItems);
			modal = <Modal
						isOpen={true}
						onClose={() => setIsModalShown(false)}
					>
						<Column bg="#fff" w={width} h={height}>
							<FormPanel
								title="PDF Fields to Show"
								instructions="Please select which fields to show in the PDF."
								editorType={EDITOR_TYPE__PLAIN}
								flex={1}
								Repository={Repository}
								items={modalItems}
								startingValues={startingValues}
								validator={validator}
								onCancel={(e) => {
									setIsModalShown(false);
								}}
								onSubmit={(data, e) => {
									getPdf(data);
									setIsModalShown(false);
								}}
								submitBtnLabel="View PDF"
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