import {
	VIEW,
} from '../../Constants/Commands.js';
import * as yup from 'yup'; // https://github.com/jquense/yup#string
import Inflector from 'inflector-js';
import qs from 'qs';
import inArray from '../../Functions/inArray.js';
import Pdf from '../Icons/Pdf.js';
import withModal from './withModal.js';
import { EDITOR_TYPE__PLAIN } from '../../Constants/Editor.js';
import UiGlobals from '../../UiGlobals.js';
import _ from 'lodash';

export default function withPdfButtons(WrappedComponent) {
	return withModal((props) => {

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
			return <WrappedComponent {...props} />;
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
						items = [];
					_.each(ancillaryItems, (ancillaryItem) => { // clone, as we don't want to alter the item by reference
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
					onSubmit: () => {
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
					submitBtnLabel: userWantsToEmail ? 'Choose Email' : 'Get PDF',
					w: 530, // 510 so it's over the stack threshold
					h: 800,
					self,
					formProps: {
						editorType: EDITOR_TYPE__PLAIN,
						disableFooter: true,
						columnDefaults: {
							labelWidth: '100%',
						},
						items: [
							{
								name: 'instructions',
								type: 'DisplayField',
								text: 'Please select which fields to show in the PDF.',
								mb: 10,
							},
							...modalItems,
						],
						Repository,
						startingValues,
						validator,
					},
				});
			},
			onChooseEmailAddress = (data) => {
				showModal({
					title: 'Email To',
					includeReset: true,
					includeCancel: true,
					onSubmit: () => {
						hideModal();

						const
							fv = self.children.ModalForm.formGetValues(),
							email = fv.email,
							message = fv.message;

						sendEmail({
							...data,
							email,
							message,
						});
					},
					submitBtnLabel: 'Email PDF',
					w: 510, // 510 so it's over the stack threshold
					h: 500,
					self,
					formProps: {
						editorType: EDITOR_TYPE__PLAIN,
						disableFooter: true,
						columnDefaults: {
							labelWidth: '100%',
						},
						items: [
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
						],
						validator: yup.object({
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
						}),
					},
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