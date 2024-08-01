import {
	Column,
	Icon,
	Row,
	Text,
} from 'native-base';
import * as yup from 'yup'; // https://github.com/jquense/yup#string
import Inflector from 'inflector-js';
import qs from 'qs';
import Form from '../Form/Form.js';
import inArray from '../../Functions/inArray.js';
import Pdf from '../Icons/Pdf.js';
import TriangleExclamation from '../Icons/TriangleExclamation.js';
import withModal from './withModal.js';
import { EDITOR_TYPE__PLAIN } from '../../Constants/Editor.js';
import UiGlobals from '../../UiGlobals.js';
import _ from 'lodash';

export default function withPdfButtons(WrappedComponent) {
	return withModal((props) => {

		if (!props.showPdfBtns) {
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

				// withComponent
				self,

				// withData
				Repository,
				model,

				// withSelection
				selection,

				// withAlert
				alert,
				showInfo,

				// withModal
				showModal,
				hideModal,

			} = props,
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
						item.items = _.map(items, (item, ix) => {
							return buildNextLayer(item, ix, defaults);
						});
					}
					return item;
				}

				if (item.isHiddenInViewMode || type === 'Button') {
					return null;
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
					if (!item) {
						return;
					}

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
			onChooseFields = (userWantsToEmail = false) => {
				const
					modalItems = buildModalItems(),
					startingValues = getStartingValues(modalItems),
					validator = buildValidator();

				showModal({
					title: 'PDF Fields to Show',
					message: 'Please select which fields to show in the PDF. (1)',
					includeCancel: true,
					onOk: () => {
						hideModal();

						const
							form = self.children.ModalForm,
							data = form.formGetValues();

						if (userWantsToEmail) {
							onChooseEmailAddress(data);
						} else {
							getPdf(data);
						}
					},
					okBtnLabel: userWantsToEmail ? 'Choose Email' : 'Get PDF',
					w: 530, // 510 so it's over the stack threshold
					h: 800,
					body: <Column w="100%">
							<Row px={10}>
								<Column w="40px" mr={5} justifyContent="flex-start">
									<Icon as={TriangleExclamation} size={10} color="#000" />
								</Column>
								<Text flex={1}>Please select which fields to show in the PDF. (2)</Text>
							</Row>
							<Form
								parent={self}
								reference="ModalForm"
								editorType={EDITOR_TYPE__PLAIN}
								useAdditionalEditButtons={false}
								flex={1}
								Repository={Repository}
								items={modalItems}
								startingValues={startingValues}
								validator={validator}
								checkIsEditingDisabled={false}
								disableFooter={true}
								columnDefaults={{
									labelWidth: '100%',
								}}
							/>
						</Column>,
				});
			},
			onChooseEmailAddress = (data) => {
				showModal({
					title: 'Email To',
					message: 'Please enter an email address to send the PDF to. (1)',
					includeCancel: true,
					onOk: () => {
						hideModal();

						const
							fv = self.children.ModalForm.formGetValues(),
							email = fv.email;

						sendEmail({
							...data,
							email,
						});
					},
					okBtnLabel: 'Email PDF',
					w: 510, // 510 so it's over the stack threshold
					h: 300,
					body: <Column w="100%">
							<Row>
								<Column w="40px" mr={5} justifyContent="flex-start">
									<Icon as={TriangleExclamation} size={10} color="#000" />
								</Column>
								<Text flex={1}>Please enter an email address to send the PDF to. (2)</Text>
							</Row>
							<Form
								parent={self}
								reference="ModalForm"
								editorType={EDITOR_TYPE__PLAIN}
								disableFooter={true}
								columnDefaults={{
									labelWidth: '100%',
								}}
								items={[
									{
										name: 'email',
										label: 'Email Address',
										type: 'Input',
										required: true,
									},
								]}
								validator={yup.object({
									email: yup.string().email().required(),
								})}
							/>
						</Column>,
				});
			},
			getPdf = (data) => {
				data.id = selection[0].id;

				const
					url = UiGlobals.baseURL + model + '/viewModelPdf?',
					queryString = qs.stringify(data);

				window.open(url + queryString, '_blank');
			},
			sendEmail = async (data) => {

				data.id = selection[0].id;
				
				const result = await Repository._send('POST', model + '/emailModelPdf', data);

				const {
					root,
					success,
					total,
					message
				} = Repository._processServerResponse(result);

				if (!success) {
					alert('Email could not be sent.');
					return;
				}

				showInfo('Email sent successfully.');

			};

		const buttons = [
			{
				key: 'emailPdfBtn',
				text: 'Email PDF',
				icon: Pdf,
				isDisabled: selection.length !== 1,
				handler: () => onChooseFields(true),
			},
			{
				key: 'viewPdfBtn',
				text: 'View PDF',
				icon: Pdf,
				isDisabled: selection.length !== 1,
				handler: () => onChooseFields(),
			},
		];
		_.each(buttons, (button) => {
			if (!_.find(additionalEditButtons, btn => button.key === btn.key)) { 
				additionalEditButtons.push(button);
			}
			if (!_.find(additionalViewButtons, btn => button.key === btn.key)) { 
				additionalViewButtons.push(button);
			}
		});
	
		return <WrappedComponent
					{...props}
					additionalEditButtons={additionalEditButtons}
					additionalViewButtons={additionalViewButtons}
				/>;
	});
}