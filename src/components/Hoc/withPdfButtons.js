import { forwardRef } from 'react';
import {
	VIEW,
} from '../../Constants/Commands.js';
import { EDITOR_TYPE__PLAIN } from '../../Constants/Editor.js';
import * as yup from 'yup'; // https://github.com/jquense/yup#string
import Inflector from 'inflector-js';
import qs from 'qs';
import withModal from './withModal.js';
import Form from '../Form/Form.js';
import Pdf from '../Icons/Pdf.js';
import UiGlobals from '../../UiGlobals.js';
import inArray from '../../Functions/inArray.js';
import testProps from '../../Functions/testProps.js';
import _ from 'lodash';

export default function withPdfButtons(WrappedComponent) {
	return withModal(forwardRef((props, ref) => {
		let showButtons = true;
		if (!props.showPdfBtns) {
			showButtons = false;
		}
		if (props.canUser && !props.canUser(VIEW)) { // permissions
			showButtons = false;
		}
		if (!showButtons) {
			// bypass everything.
			// If we don't do this, we get an infinite recursion with Form
			// because this HOC wraps Form and uses Form itself.
			return <WrappedComponent {...props} ref={ref} />;
		}

		const {
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
			styles = UiGlobals.styles,
			propertyNames = [],
			buildModalItems = () => {
				const modalItems = _.map(_.cloneDeep(items), (item, ix) => buildNextLayer(item, ix, columnDefaults)); // clone, as we don't want to alter the item by reference

				// remove additionalEditButtons from the modal
				function walkTreeToDeleteAdditionalEditButtons(item) {
					if (!item) {
						return;
					}

					let {
							additionalEditButtons,
							items,
						} = item;
					if (!_.isEmpty(items)) {
						_.each(items, (item) => {
							walkTreeToDeleteAdditionalEditButtons(item);
						});
					}
					if (additionalEditButtons) {
						delete item.additionalEditButtons;
					}
				}
				_.each(modalItems, walkTreeToDeleteAdditionalEditButtons);

				if (!_.isEmpty(ancillaryItems)) {
					const
						ancillaryItemsClone = _.cloneDeepWith(ancillaryItems, (value) => {
							// Exclude the 'parent' property from being cloned, as it would introduce an infinitely recursive loop
							if (value && value.parent) {
								const { parent, ...rest } = value;
								return rest;
							}
						}),
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
				function walkTreeToSetStartingValues(item) {
					if (!item) {
						return;
					}

					let {
							name,
							items,
						} = item;
					if (!_.isEmpty(items)) {
						_.each(items, (item) => {
							walkTreeToSetStartingValues(item);
						});
					}
					if (name) {
						startingValues[name] = true;
					}
				}
				_.each(modalItems, walkTreeToSetStartingValues);
				return startingValues;
			},
			onChooseFields = (userWantsToEmail = false) => {
				const
					modalItems = buildModalItems(),
					startingValues = getStartingValues(modalItems),
					validator = buildValidator();

				showModal({
					title: 'PDF Fields to Show',
					includeReset: true,
					includeCancel: true,
					h: 800,
					w: styles.FORM_STACK_ROW_THRESHOLD + 10,
					body: <Form
								parent={self}
								reference="chooseFieldsForm"
								editorType={EDITOR_TYPE__PLAIN}
								alert={alert}
								columnDefaults={{
									labelWidth: '100px',
								}}
								items={[
									{
										name: 'instructions',
										type: 'DisplayField',
										text: 'Please select which fields to show in the PDF.',
										className: 'mb-3',
									},
									...modalItems,
								]}
								Repository={Repository}
								startingValues={startingValues}
								validator={validator}
								submitBtnLabel={userWantsToEmail ? 'Choose Email' : 'Get PDF'}
								onSubmit={(values)=> {
									hideModal();

									if (userWantsToEmail) {
										onChooseEmailAddress(values);
									} else {
										getPdf(values);
									}
								}}
							/>,
				});
			},
			onChooseEmailAddress = (data) => {

				showModal({
					title: 'Email To',
					includeCancel: true,
					w: 510, // 510 so it's over the stack threshold
					h: 500,
					body: <Form
								parent={self}
								reference="chooseEmailAddressForm"
								submitBtnLabel='Email PDF'
								onSubmit={(values)=> {
									hideModal();
			
									const
										email = values.email,
										message = values.message;
			
									sendEmail({
										...data,
										email,
										message,
									});
								}}
								editorType={EDITOR_TYPE__PLAIN}
								alert={alert}
								columnDefaults={{
									labelWidth: '100px',
								}}
								items={[
									{
										name: 'instructions',
										type: 'DisplayField',
										text: 'Please enter one or more email addresses, separated by a comma.',
									},
									{
										name: 'email',
										label: 'Email Address',
										type: 'Input',
										tooltip: 'Separate multiple email addresses with a comma.',
									},
									{
										name: 'message',
										label: 'Message',
										placeholder: 'Please see attached PDF.',
										type: 'TextArea',
										totalLines: 6,
									},
								]}
								validator={yup.object({
									email: yup.string().required('Email is required').test({
										name: 'csvEmails',
										test: function(value) {
											if (!value) {
												return this.createError({
													message: 'Email is required',
												});
											}
											const firstInvalidEmail = value.split(",")
																			.map(email => email.trim())
																			.filter(v => !_.isEmpty(v))
																			.find(v => !yup.string().email().isValidSync(v));
											if (firstInvalidEmail) {
												return this.createError({
													message: `The email address '${firstInvalidEmail}' is invalid.`
												});
											}
											return true;
										},
									}),
									message: yup.string().notRequired(),
								})}
							/>,
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

				const
					dispatch = UiGlobals.redux.dispatch,
					setIsWaitModalShownAction = UiGlobals.debugReducer.setIsWaitModalShownAction;

				dispatch(setIsWaitModalShownAction(true));

				data.id = selection[0].id;
				const result = await Repository._send('POST', model + '/emailModelPdf', data);

				const {
					root,
					success,
					total,
					message
				} = Repository._processServerResponse(result);

				dispatch(setIsWaitModalShownAction(false));

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
				tooltip: 'Email the selected item as a PDF.',
			},
			{
				key: 'viewPdfBtn',
				text: 'View PDF',
				icon: Pdf,
				isDisabled: selection.length !== 1,
				handler: () => onChooseFields(),
				tooltip: 'View the selected item as a PDF.',
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
					ref={ref}
				/>;
	}));
}