import { useState, } from 'react';
import {
	Column,
	Button,
	Modal,
} from 'native-base';
import * as yup from 'yup'; // https://github.com/jquense/yup#string
import Inflector from 'inflector-js';
import qs from 'qs';
import FormPanel from '../Panel/FormPanel.js';
import inArray from '../../Functions/inArray.js';
import Pdf from '../Icons/Pdf.js';
import useAdjustedWindowSize from '../../Hooks/useAdjustedWindowSize.js';
import { EDITOR_TYPE__PLAIN } from '../../Constants/Editor.js';
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

				// withSelection
				selection,

			} = props,
			[isModalShown, setIsModalShown] = useState(false),
			[width, height] = useAdjustedWindowSize(510, 800), // 510 so it's over the stack threshold
			propertyNames = [],
			buildModalItems = () => {
				const modalItems = _.map(_.cloneDeep(items), (item, ix) => buildNextLayer(item, ix, columnDefaults)); // clone, as we don't want to alter the item by reference

				if (!_.isEmpty(ancillaryItems)) {
					const
						ancillaryItemsClone = _.cloneDeep(ancillaryItems),
						items = [];
					_.each(ancillaryItemsClone, (ancillaryItem) => { // clone, as we don't want to alter the item by reference
						let name;
						if (ancillaryItem.pdfModel) {
							name = ancillaryItem.pdfModel;
						} else if (ancillaryItem.model) {
							name = Inflector.underscore(ancillaryItem.model);
						} else {
							name = ancillaryItem.title;
						}
						name = 'ancillary___' + name;
						propertyNames.push(name); // for validator
						items.push({
							title: ancillaryItem.title,
							label: ancillaryItem.title,
							name,
							type: 'Checkbox',
						});
					});
					modalItems.push({
						type: 'FieldSet',
						title: 'Ancillary Items',
						defaults: {
							labelWidth: '90%',
						},
						items,
						showToggleAllCheckbox: true,
						isCollapsible: false,
						ml: 3, // since it's not in a column, which normally adds pl: 3
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
						item.isCollapsible = false;
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
					if (propertyDef?.title) {
						item.title = propertyDef.title;
					}
				}
				if (name) {
					propertyNames.push(name); // for validator
				}
				item.type = 'Checkbox';
				return item;
			},
			buildValidator = () => {
				const propertyValidatorDefs = {};
				_.each(propertyNames, (name) => {
					propertyValidatorDefs[name] = yup.boolean().required();
				});
				return yup.object(propertyValidatorDefs);
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
				data.id = selection[0].id;

				const
					url = UiGlobals.baseURL + model + '/viewModelPdf?',
					queryString = qs.stringify(data);

				window.open(url + queryString, '_blank');
			};

		const button = {
			key: 'viewPdfBtn',
			text: 'View PDF',
			icon: Pdf,
			isDisabled: selection.length !== 1,
			handler: () => {
				setIsModalShown(true);
			},
		};
		if (!_.find(additionalEditButtons, btn => button.key === btn.key)) { 
			additionalEditButtons.push(button);
		}
		if (!_.find(additionalViewButtons, btn => button.key === btn.key)) { 
			additionalViewButtons.push(button);
		}
	
		let modal = null;
		if (isModalShown) {
			const
				modalItems = buildModalItems(),
				startingValues = getStartingValues(modalItems),
				validator = buildValidator();
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
								checkIsEditingDisabled={false}
								onClose={(e) => {
									setIsModalShown(false);
								}}
								onSubmit={(data, e) => {
									getPdf(data);
									setIsModalShown(false);
								}}
								submitBtnLabel="View PDF"
								useAdditionalEditButtons={false}
							/>
						</Column>
					</Modal>;
		}
		return <>
				<WrappedComponent
					{...props}
					additionalEditButtons={additionalEditButtons}
					additionalViewButtons={additionalViewButtons}
				/>
				{modal}
			</>;
	};
}