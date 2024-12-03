import { useEffect, useState, useRef, isValidElement, } from 'react';
import {
	Box,
	HStack,
	Icon,
	ScrollView,
	Text,
	VStack,
	VStackNative,
} from '@project-components/Gluestack';
import {
	VIEW,
} from '../../Constants/Commands.js';
import {
	EDITOR_TYPE__INLINE,
	EDITOR_TYPE__WINDOWED,
	EDITOR_TYPE__SIDE,
	EDITOR_TYPE__SMART,
	EDITOR_TYPE__PLAIN,
	EDITOR_MODE__VIEW,
	EDITOR_MODE__ADD,
	EDITOR_MODE__EDIT,
} from '../../Constants/Editor.js';
import {
	hasWidth,
	hasFlex,
} from '../../Functions/tailwindFunctions.js';
import { useForm, Controller } from 'react-hook-form'; // https://react-hook-form.com/api/
import * as yup from 'yup'; // https://github.com/jquense/yup#string
import { yupResolver } from '@hookform/resolvers/yup';
import useForceUpdate from '../../Hooks/useForceUpdate.js';
import UiGlobals from '../../UiGlobals.js';
import withAlert from '../Hoc/withAlert.js';
import withComponent from '../Hoc/withComponent.js';
import withEditor from '../Hoc/withEditor.js';
import inArray from '../../Functions/inArray.js';
import getComponentFromType from '../../Functions/getComponentFromType.js';
import buildAdditionalButtons from '../../Functions/buildAdditionalButtons.js';
import testProps from '../../Functions/testProps.js';
import Toolbar from '../Toolbar/Toolbar.js';
import Button from '../Buttons/Button.js';
import IconButton from '../Buttons/IconButton.js';
import AngleLeft from '../Icons/AngleLeft.js';
import Eye from '../Icons/Eye.js';
import Rotate from '../Icons/Rotate.js';
import Pencil from '../Icons/Pencil.js';
import Footer from '../Layout/Footer.js';
import Label from '../Form/Label.js';
import _ from 'lodash';

// TODO: memoize field Components

// Modes:
// EDITOR_TYPE__INLINE
// Form is a single scrollable row, based on columnsConfig and Repository
//
// EDITOR_TYPE__WINDOWED
// EDITOR_TYPE__SIDE
// Form is a popup or side window, used for editing items in a grid. Integrated with Repository
//
// EDITOR_TYPE__SMART
// Form is a standalone editor
//
// EDITOR_TYPE__PLAIN
// Form is embedded on screen in some other way. Mainly use startingValues, items, validator

function Form(props) {
	const
		{
			editorType = EDITOR_TYPE__WINDOWED, // EDITOR_TYPE__INLINE | EDITOR_TYPE__WINDOWED | EDITOR_TYPE__SIDE | EDITOR_TYPE__SMART | EDITOR_TYPE__PLAIN
			startingValues = {},
			items = [], // Columns, FieldSets, Fields, etc to define the form
			ancillaryItems = [], // additional items which are not controllable form elements, but should appear in the form
			columnDefaults = {}, // defaults for each Column defined in items (above)
			columnsConfig, // Which columns are shown in Grid, so the inline editor can match. Used only for EDITOR_TYPE__INLINE
			validator, // custom validator, mainly for EDITOR_TYPE__PLAIN
			formHeader = null,
			containerProps = {},
			footerProps = {},
			buttonGroupProps = {}, // buttons in footer
			checkIsEditingDisabled = true,
			disableLabels = false,
			disableDirtyIcon = false,
			onBack,
			onReset,
			onInit,
			onViewMode,
			onValidityChange,
			onDirtyChange,
			submitBtnLabel,
			onSubmit,
			formSetup, // this fn will be executed after the form setup is complete
			additionalEditButtons,
			useAdditionalEditButtons = true,
			additionalFooterButtons,
			disableFooter = false,
			hideResetButton = false,
			
			// sizing of outer container
			maxHeight,
			minHeight = 0,
			maxWidth,
			onLayout, // onLayout handler for main view

			// withComponent
			self,

			// withData
			Repository,

			// withPermissions
			canUser,
			
			// withEditor
			isEditorViewOnly = false,
			isSaving = false,
			editorMode,
			onCancel,
			onSave,
			onClose,
			onDelete,
			editorStateRef,
			disableView,

			// parent container
			selectorId,
			selectorSelected,

			// withAlert
			alert,
			
		} = props,
		formRef = useRef(),
		styles = UiGlobals.styles,
		record = props.record?.length === 1 ? props.record[0] : props.record;

	let skipAll = false;
	if (record?.isDestroyed) {
		skipAll = true; // if record is destroyed, skip render, but allow hooks to still be called
		if (self?.parent?.parent?.setIsEditorShown) {
			self.parent.parent.setIsEditorShown(false); // close the editor
		}
	}
	const
		isMultiple = _.isArray(record),
		isSingle = _.isNil(record) || !_.isArray(record),
		isPhantom = !skipAll && !!record?.isPhantom,
		forceUpdate = useForceUpdate(),
		[previousRecord, setPreviousRecord] = useState(record),
		[containerWidth, setContainerWidth] = useState(),
		initialValues = _.merge(startingValues, (record && !record.isDestroyed ? record.submitValues : {})),
		defaultValues = isMultiple ? getNullFieldValues(initialValues, Repository) : initialValues, // when multiple entities, set all default values to null
		validatorToUse = validator || (isMultiple ? disableRequiredYupFields(Repository?.schema?.model?.validator) : Repository?.schema?.model?.validator) || yup.object(),
		{
			control,
			formState,
			handleSubmit,
			// register, 
			// unregister,
			reset,
			// watch,
			// resetField,
			// setError,
			// clearErrors,
			setValue: formSetValue,
			// setFocus,
			getValues: formGetValues,
			// getFieldState,
			trigger,
		} = useForm({
			mode: 'onChange', // onChange | onBlur | onSubmit | onTouched | all
			// reValidateMode: 'onChange', // onChange | onBlur | onSubmit
			defaultValues,
			// values: defaultValues,
			// resetOptions: {
			// 	keepDirtyValues: false, // user-interacted input will be retained
			// 	keepErrors: false, // input errors will be retained with value update
			// },
			// criteriaMode: 'firstError', // firstError | all
			// shouldFocusError: false,
			// delayError: 0,
			// shouldUnregister: false,
			// shouldUseNativeValidation: false,
			resolver: yupResolver(validatorToUse),
			context: { isPhantom },
		}),
		buildFromColumnsConfig = () => {
			// Only used in InlineEditor
			// Build the fields that match the current columnsConfig in the grid
			const
				elements = [],
				columnClassName = `
					Form-column
					justify-center
					items-center
					h-[60px]
					border-r-1
					border-r-grey-200
					px-1
					${styles.INLINE_EDITOR_MIN_WIDTH}
				`;
			_.each(columnsConfig, (config, ix) => {
				let {
						fieldName,
						isEditable = false,
						editor = null,
						editField,
						renderer,
						w,
						flex,
						onChange: onEditorChange,
						useSelectorId = false,
						getDynamicProps,
						getIsRequired,
						isHidden = false,
						...configPropsToPass
					} = config,
					type,
					editorTypeProps = {},
					viewerTypeProps = {};
				
				if (isHidden) {
					return;
				}
				if (editField) {
					// Sometimes, columns will be configured to display one field
					// and edit a different field
					fieldName = editField;
				}
				const propertyDef = fieldName && Repository?.getSchema().getPropertyDefinition(fieldName);
				if (propertyDef?.isEditingDisabled && checkIsEditingDisabled) {
					isEditable = false;
				}
				if (!_.isNil(editor)) {
					// if editor is defined on column, use it
					if (_.isString(editor)) {
						type = editor;
					} else if (_.isPlainObject(editor)) {
						const {
								type: t,
								...p
							} = editor;
						type = t;
						editorTypeProps = p;
					}
				} else {
					// editor is not defined, fall back to property definition
					if (isEditable) {
						const
							{
								type: t,
								...p
							} = propertyDef?.editorType;
						type = t;
						editorTypeProps = p;
					} else if (propertyDef?.viewerType) {
						const
							{
								type: t,
								...p
							} =  propertyDef?.viewerType;
						type = t;
						viewerTypeProps = p;
					} else {
						type = 'Text';
					}
				}
				const isCombo = type?.match && type.match(/Combo/);
				if (config.hasOwnProperty('autoLoad')) {
					editorTypeProps.autoLoad = config.autoLoad;
				} else {
					if (isCombo && Repository?.isRemote && !Repository?.isLoaded) {
						editorTypeProps.autoLoad = true;
					}
				}
				if (isCombo) {
					// editorTypeProps.showEyeButton = true;
					if (_.isNil(configPropsToPass.showXButton)) {
						editorTypeProps.showXButton = true;
					}
				}
				const Element = getComponentFromType(type);

				if (isEditorViewOnly || !isEditable) {
					let value = null;
					if (renderer) {
						value = renderer(record);
					} else {
						if (record?.properties && record.properties[fieldName]) {
							value = record.properties[fieldName].displayValue;
						}
						if (_.isNil(value) && record && record[fieldName]) {
							value = record[fieldName];
						}
						if (_.isNil(value) && startingValues && startingValues[fieldName]) {
							value = startingValues[fieldName];
						}
					}

					let elementClassName = '';
					const
						boxFlex = configPropsToPass.flex,
						boxW = configPropsToPass.w;
					delete configPropsToPass.w;
					delete configPropsToPass.flex;
					const configPropsToPassClassName = configPropsToPass.className;
					if (configPropsToPassClassName) {
						elementClassName += ' ' + configPropsToPassClassName;
					}
					const viewerTypeClassName = viewerTypeProps.className;
					if (viewerTypeClassName) {
						elementClassName += ' ' + viewerTypeClassName;
					}
					let element = <Element
										{...testProps('field-' + fieldName)}
										value={value}
										parent={self}
										reference={fieldName}
										{...configPropsToPass}
										{...viewerTypeProps}
										className={elementClassName}
									/>;
					const style = {};
					if (boxFlex) {
						style.flex = boxFlex;
					}
					if (boxW) {
						style.width = boxW;
					}
					elements.push(<Box
										key={ix}
										className={columnClassName}
										style={style}
									>{element}</Box>);
					return;
				}

				elements.push(<Controller
									key={'controller-' + ix}
									name={fieldName}
									// rules={rules}
									control={control}
									render={(args) => {
										const {
												field,
												fieldState,
												// formState,
											} = args,
											{
												onChange,
												onBlur,
												name,
												value,
												// ref,
											} = field,
											{
												isTouched,
												isDirty,
												error,
											} = fieldState;

										if (isValidElement(Element)) {
											throw new Error('Should not yet be valid React element. Did you use <Element> instead of () => <Element> when defining it?')
										}

										if (useSelectorId) { // This causes the whole form to use selectorId
											editorTypeProps.selectorId = selectorId;
										}
										if (configPropsToPass.selectorId || editorTypeProps.selectorId) { // editorTypeProps.selectorId causes just this one field to use selectorId
											if (_.isNil(configPropsToPass.selectorSelected)) {
												editorTypeProps.selectorSelected = record;
											}
										}
										let dynamicProps = {};
										if (getDynamicProps) {
											dynamicProps = getDynamicProps({ fieldState, formSetValue, formGetValues, formState });
										}

										let elementClassName = 'flex-1';
										if (type.match(/Tag/)) {
											elementClassName += ' overflow-auto';
										}
										if (!type.match(/Toggle/)) {
											elementClassName += ' h-full';
										}
										const configPropsToPassClassName = configPropsToPass.className;
										if (configPropsToPassClassName) {
											elementClassName += ' ' + configPropsToPassClassName;
										}
										const editorTypeClassName = editorTypeProps.className;
										if (editorTypeClassName) {
											elementClassName += ' ' + editorTypeClassName;
										}
										const dynamicClassName = dynamicProps.className;
										if (dynamicClassName) {
											elementClassName += ' ' + dynamicClassName;
										}

										let element = <Element
														{...testProps('field-' + name)}
														name={name}
														value={value}
														onChangeValue={(newValue) => {
															if (newValue === undefined) {
																newValue = null; // React Hook Form doesn't respond well when setting value to undefined
															}
															onChange(newValue);
															if (onEditorChange) {
																onEditorChange(newValue, formSetValue, formGetValues, formState, trigger);
															}
														}}
														onBlur={onBlur}
														minimizeForRow={true}
														parent={self}
														reference={name}
														{...configPropsToPass}
														{...editorTypeProps}
														{...dynamicProps}
														className={elementClassName}
													/>;

										const dirtyIcon = isDirty && !disableDirtyIcon ? 
															<Icon
																as={Pencil}
																size="2xs"
																className={`
																	absolute
																	top-[2px]
																	left-[2px]
																	text-grey-300
																`}
															/> : null;
										return <HStack
													key={ix}
													className={`
														flex-${flex}
														${error ? "bg-[#fdd]" : "bg-white"}
														${columnClassName}
													`}
													style={{ 
														width: w,
													}}
												>{dirtyIcon}{element}</HStack>;
									}}
								/>);
			
			});
			return <HStack>{elements}</HStack>;
		},
		buildFromItems = () => {
			return _.map(items, (item, ix) => buildFromItem(item, ix, columnDefaults));
		},
		buildFromItem = (item, ix, defaults) => {
			if (!item) {
				return null;
			}
			if (isValidElement(item)) {
				return item;
			}
			let {
					type,
					title,
					name,
					isEditable = true,
					isEditingEnabledInPlainEditor,
					label,
					items,
					onChange: onEditorChange,
					useSelectorId = false,
					isHidden = false,
					getDynamicProps,
					getIsRequired,
					...itemPropsToPass
				} = item,
				editorTypeProps = {},
				viewerTypeProps = {};
			if (isHidden) {
				return null;
			}
			if (type === 'DisplayField') {
				isEditable = false;
			}
			if (!itemPropsToPass.className) {
				itemPropsToPass.className = '';
			}
			const propertyDef = name && Repository?.getSchema().getPropertyDefinition(name);
			if (!useAdditionalEditButtons) {
				item = _.omit(item, 'additionalEditButtons');
			}
			if (propertyDef?.isEditingDisabled && checkIsEditingDisabled) {
				isEditable = false;
			}
			if (isEditingEnabledInPlainEditor && editorType === EDITOR_TYPE__PLAIN) {
				// If this is a plain editor, allow the field to be editable, even if it's not editable in other editor types
				isEditable = true;
			}
			if (!type) {
				if (isEditable) {
					const
						{
							type: t,
							...p
						} = propertyDef?.editorType;
					type = t;
					editorTypeProps = p;
				} else if (propertyDef?.viewerType) {
					const
						{
							type: t,
							...p
						} =  propertyDef?.viewerType;
					type = t;
					viewerTypeProps = p;
				} else {
					type = 'Text';
				}
			}
			const isCombo = type?.match && type.match(/Combo/);
			if (item.hasOwnProperty('autoLoad')) {
				editorTypeProps.autoLoad = item.autoLoad;
			} else {
				if (isCombo && Repository?.isRemote && !Repository?.isLoaded) {
					editorTypeProps.autoLoad = true;
				}
			}
			if (isCombo) {
				// editorTypeProps.showEyeButton = true;
				if (_.isNil(itemPropsToPass.showXButton)) {
					editorTypeProps.showXButton = true;
				}
			}
			const Element = getComponentFromType(type);
			
			if (inArray(type, ['Column', 'Row', 'FieldSet'])) {
				if (_.isEmpty(items)) {
					return null;
				}
				let children;
				const style = {};
				if (type === 'Column') {
					const isEverythingInOneColumn = containerWidth < styles.FORM_ONE_COLUMN_THRESHOLD;
					if (itemPropsToPass.hasOwnProperty('flex')) {
						if (!isEverythingInOneColumn) {
							style.flex = itemPropsToPass.flex;
						}
						delete itemPropsToPass.flex;
					}
					if (itemPropsToPass.hasOwnProperty('w')) {
						if (!isEverythingInOneColumn) {
							style.width = itemPropsToPass.w;
						}
						delete itemPropsToPass.w;
					}
					if (!style.flex && !style.width) {
						style.flex = 1;
					}
					itemPropsToPass.className += ' Column';
				}
				if (type === 'Row') {
					itemPropsToPass.className += ' Row w-full';
				}
				const itemDefaults = item.defaults || {};
				children = _.map(items, (item, ix) => {
					return buildFromItem(item, ix, {...defaults, ...itemDefaults});
				});

				let elementClassName = '';
				const defaultsClassName = defaults.className;
				if (defaultsClassName) {
					elementClassName += ' ' + defaultsClassName;
				}
				const itemDefaultsClassName = itemDefaults.className;
				if (itemDefaultsClassName) {
					elementClassName += ' ' + itemDefaultsClassName;
				}
				const itemPropsToPassClassName = itemPropsToPass.className;
				if (itemPropsToPassClassName) {
					elementClassName += ' ' + itemPropsToPassClassName;
				}
				const editorTypeClassName = editorTypeProps.className;
				if (editorTypeClassName) {
					elementClassName += ' ' + editorTypeClassName;
				}
				let defaultsToPass = {},
					itemDefaultsToPass = {};
				if (type === 'FieldSet') { // don't pass for Row and Column, as they use regular <div>s for web
					defaultsToPass = defaults;
					itemDefaultsToPass = itemDefaults;
				}
				return <Element
							key={ix}
							title={title}
							{...defaultsToPass}
							{...itemDefaultsToPass}
							{...itemPropsToPass}
							{...editorTypeProps}
							className={elementClassName}
							style={style}
						>{children}</Element>;
			}

			if (!label && Repository && propertyDef?.title) {
				label = propertyDef.title;
			}

			if (isEditorViewOnly || !isEditable) {
				let value = record?.properties[name]?.displayValue || null;
				if (_.isNil(value) && record && record[name]) {
					value = record[name];
				}
				if (_.isNil(value) && startingValues && startingValues[name]) {
					value = startingValues[name];
				}

				let elementClassName = 'field-' + name;
				const defaultsClassName = defaults.className;
				if (defaultsClassName) {
					elementClassName += ' ' + defaultsClassName;
				}
				const itemPropsToPassClassName = itemPropsToPass.className;
				if (itemPropsToPassClassName) {
					elementClassName += ' ' + itemPropsToPassClassName;
				}
				const viewerTypeClassName = viewerTypeProps.className;
				if (viewerTypeClassName) {
					elementClassName += ' ' + viewerTypeClassName;
				}
		
				let element = <Element
									{...testProps('field-' + name)}
									value={value}
									parent={self}
									reference={name}
									{...itemPropsToPass}
									{...viewerTypeProps}
									className={elementClassName}
								/>;
				if (!disableLabels && label) {
					const style = {};
					if (defaults?.labelWidth) {
						style.width = defaults.labelWidth;
					}
					if (!style.width) {
						style.width = '50px';
					}
					if (containerWidth > styles.FORM_STACK_ROW_THRESHOLD) {
						element = <HStack className="HStackA py-1">
										<Label style={style}>{label}</Label>
										{element}
									</HStack>;
					} else {
						element = <VStack className="HStackA w-full py-1 mt-3">
										<Label style={style}>{label}</Label>
										{element}
									</VStack>;
					}
				}
				return <HStack key={ix} className="HStackB px-2 pb-1">{element}</HStack>;
			}

		
			// // These rules are for fields *outside* the model
			// // but which want validation on the form anyway.
			// // The useForm() resolver disables this
			// const
			// 	rules = {},
			// 	rulesToCheck = [
			// 		'required',
			// 		'min',
			// 		'max',
			// 		'minLength',
			// 		'maxLength',
			// 		'pattern',
			// 		'validate',
			// 	];
			// _.each(rulesToCheck, (rule) => {
			// 	if (item.hasOwnProperty(rule)) {
			// 		rules[rule] = item[rule];
			// 	}
			// });

			return <Controller
						key={'controller-' + ix}
						name={name}
						// rules={rules}
						control={control}
						render={(args) => {
							const {
									field,
									fieldState,
									// formState,
								} = args,
								{
									onChange,
									onBlur,
									name,
									value,
									// ref,
								} = field,
								{
									isTouched,
									isDirty,
									error,
								} = fieldState;
							
							if (isValidElement(Element)) {
								throw new Error('Should not yet be valid React element. Did you use <Element> instead of () => <Element> when defining it?')
							}

							if (useSelectorId) { // This causes the whole form to use selectorId
								editorTypeProps.selectorId = selectorId;
							}
							if (itemPropsToPass.selectorId || editorTypeProps.selectorId) { // editorTypeProps.selectorId causes just this one field to use selectorId
								if (_.isNil(itemPropsToPass.selectorSelected)) {
									editorTypeProps.selectorSelected = record;
								}
							}
							let dynamicProps = {};
							if (getDynamicProps) {
								dynamicProps = getDynamicProps({ fieldState, formSetValue, formGetValues, formState });
							}

							let elementClassName = 'field-' + name + ' flex-1 Form-Element';
							const defaultsClassName = defaults.className;
							if (defaultsClassName) {
								elementClassName += ' ' + defaultsClassName;
							}
							const itemPropsToPassClassName = itemPropsToPass.className;
							if (itemPropsToPassClassName) {
								elementClassName += ' ' + itemPropsToPassClassName;
							}
							const editorTypeClassName = editorTypeProps.className;
							if (editorTypeClassName) {
								elementClassName += ' ' + editorTypeClassName;
							}
							const dynamicClassName = dynamicProps.className;
							if (dynamicClassName) {
								elementClassName += ' ' + dynamicClassName;
							}

							let element = <Element
												{...testProps('field-' + name)}
												name={name}
												value={value}
												onChangeValue={(newValue) => {
													if (newValue === undefined) {
														newValue = null; // React Hook Form doesn't respond well when setting value to undefined
													}
													onChange(newValue);
													if (onEditorChange) {
														onEditorChange(newValue, formSetValue, formGetValues, formState, trigger);
													}
												}}
												onBlur={onBlur}
												parent={self}
												reference={name}
												{...defaults}
												{...itemPropsToPass}
												{...editorTypeProps}
												{...dynamicProps}
												className={elementClassName}
											/>;
							let message = null;
							if (error) {
								message = error.message;
								if (label && error.ref?.name) {
									message = message.replace(error.ref.name, label);
								}
							}
							if (message) {
								message = <Text className="text-[#f00]">{message}</Text>;
							}
							element = <VStack className="Form-messageContainer pt-1 flex-1">
											{element}
											{message}
										</VStack>;

							if (item.additionalEditButtons) {
								const buttons = buildAdditionalButtons(item.additionalEditButtons, self, { fieldState, formSetValue, formGetValues, formState });
								if (containerWidth > styles.FORM_STACK_ROW_THRESHOLD) {
									element = <HStack className="Form-additionalEditButtons flex-1 flex-wrap">
													{element}
													{buttons}
												</HStack>;
								} else {
									element = <VStack className="Form-additionalEditButtons flex-1 w-full">
												{element}
												<HStack className="Form-additionalEditButtons-VStack flex-1 w-full mt-1 flex-wrap">
													{buttons}
												</HStack>
											</VStack>;
								}
							}
								
							let isRequired = false,
								requiredIndicator = null;
							if (!isMultiple) { // Don't require fields if editing multiple records
								if (getIsRequired) {
									isRequired = getIsRequired(formGetValues, formState);
								} else if (validatorToUse?.fields && validatorToUse.fields[name]?.exclusiveTests?.required) {
									// submitted validator
									isRequired = true;
								} else if ((propertyDef?.validator?.spec && !propertyDef.validator.spec.optional) ||
									(propertyDef?.requiredIfPhantom && isPhantom) ||
									(propertyDef?.requiredIfNotPhantom && !isPhantom)) {
									// property definition
									isRequired = true;
								}
								if (isRequired) {
									requiredIndicator = <Text className="text-[#f00] text-[30px] pr-1">*</Text>;
								}
							}
							if (!disableLabels && label && editorType !== EDITOR_TYPE__INLINE) {
								const style = {};
								if (defaults?.labelWidth) {
									style.width = defaults.labelWidth;
								}
								if (!style.width) {
									style.width = '50px';
								}
								if (containerWidth > styles.FORM_STACK_ROW_THRESHOLD) {
									element = <HStack className="HStack3 flex-1 py-1">
								 					<Label style={style}>{requiredIndicator}{label}</Label>
													{element}
								 				</HStack>;
								} else {
									element = <VStack className="VStack3 flex-1 py-1 mt-3">
													<Label style={style}>{requiredIndicator}{label}</Label>
													{element}
												</VStack>;
								}
							} else if (disableLabels && requiredIndicator) {
								element = <HStack className="HStack3 flex-1 py-1">
												{requiredIndicator}
												{element}
											</HStack>;
							}

							const dirtyIcon = isDirty && !disableDirtyIcon ? 
												<Icon
													as={Pencil}
													size="2xs"
													className={`
														absolute
														top-[2px]
														left-[2px]
														text-grey-300
													`}
												/> : null;
							return <HStack
										key={ix}
										className={`
											HStack4
											flex-none
											px-2
											pb-1
											${error ? 'bg-[#fdd]' : ''}
										`}
									>
										{dirtyIcon}
										{element}
									</HStack>;
						}}
					/>;
		},
		buildAncillary = () => {
			const components = [];
			if (ancillaryItems.length) {
				_.each(ancillaryItems, (item, ix) => {
					let {
						type,
						title = null,
						description = null,
						selectorId,
						...itemPropsToPass
					} = item;
					if (isMultiple && type !== 'Attachments') {
						return;
					}
					if (type.match(/Grid/) && !itemPropsToPass.h) {
						itemPropsToPass.h = 400;
					}

					const
						Element = getComponentFromType(type),
						element = <Element
										{...testProps('ancillary-' + type)}
										selectorId={selectorId}
										selectorSelected={selectorSelected || record}
										uniqueRepository={true}
										parent={self}
										{...itemPropsToPass}
									/>;
					if (title) {
						if (record?.displayValue) {
							title += ' for ' + record.displayValue;
						}
						title = <Text
									className={`
										font-bold
										${styles.FORM_ANCILLARY_TITLE_FONTSIZE}
									`}
								>{title}</Text>;
					}
					if (description) {
						description = <Text
										className={`
											italic
											${styles.FORM_ANCILLARY_DESCRIPTION_FONTSIZE}
										`}
									>{description}</Text>;
					}
					components.push(<VStack
										key={'ancillary-' + ix}
										className={`
											mx-1
											my-3
										`}
									>
										{title}
										{description}
										{element}
									</VStack>);
				});
			}
			return components;
		},
		onSubmitError = (errors, e) => {
			if (editorType === EDITOR_TYPE__INLINE) {
				alert(errors.message);
			}
		},
		doReset = (values) => {
			reset(values);
			if (onReset) {
				onReset(values, formSetValue, formGetValues);
			}
		},
		onSaveDecorated = async (data, e) => {
			// reset the form after a save
			const result = await onSave(data, e);
			if (result) {
				const values = record.submitValues;
				doReset(values);
			}
		},
		onSubmitDecorated = async (data, e) => {
			const result = await onSubmit(data, e);
			if (result) {
				const values = record.submitValues;
				doReset(values);
			}
		},
		onLayoutDecorated = (e) => {
			if (onLayout) {
				onLayout(e);
			}

			setContainerWidth(e.nativeEvent.layout.width);
		};

	useEffect(() => {
		if (skipAll) {
			return;
		}
		if (record === previousRecord) {
			if (onInit) {
				onInit(initialValues, formSetValue, formGetValues);
			}
		} else {
			setPreviousRecord(record);
			doReset(defaultValues);
		}
		if (formSetup) {
			formSetup(formSetValue, formGetValues, formState);
		}
	}, [record]);

	useEffect(() => {
		if (skipAll) {
			return;
		}
		if (!Repository) {
			return () => {
				if (!_.isNil(editorStateRef)) {
					editorStateRef.current = null; // clean up the editorStateRef on unmount
				}
			};
		}

		Repository.ons(['changeData', 'change'], forceUpdate);

		return () => {
			Repository.offs(['changeData', 'change'], forceUpdate);
			if (!_.isNil(editorStateRef)) {
				editorStateRef.current = null; // clean up the editorStateRef on unmount
			}
		};
	}, [Repository]);

	if (onValidityChange) {
		useEffect(() => {
			onValidityChange(formState.isValid);
		}, [formState.isValid]);
	}

	if (onDirtyChange) {
		useEffect(() => {
			onDirtyChange(formState.isDirty);
		}, [formState.isDirty]);
	}

	if (skipAll) {
		return null;
	}

	// if (Repository && (!record || _.isEmpty(record) || record.isDestroyed)) {
	// 	return null;
	// }

	if (!_.isNil(editorStateRef)) {
		editorStateRef.current = formState; // Update state so withEditor can know what's going on
	}

	if (self) {
		self.ref = formRef;
		self.reset = doReset;
		self.submit = handleSubmit;
		self.formState = formState;
		self.formSetValue = formSetValue;
		self.formGetValues = formGetValues;
	}
	
	const style = props.style || {};
	if (!hasWidth(props) && !hasFlex(props)) {
		style.flex = 1;
	}
	if (maxWidth) {
		style.maxWidth = maxWidth;
	}
	if (maxHeight) {
		style.maxHeight = maxHeight;
	}

	const formButtons = [];
	let modeHeader = null,
		footer = null,
		footerButtons = null,
		formComponents,
		editor,
		additionalButtons,
		isSaveDisabled = false,
		isSubmitDisabled = false,
		showDeleteBtn = false,
		showResetBtn = false,
		showCloseBtn = false,
		showCancelBtn = false,
		showSaveBtn = false,
		showSubmitBtn = false;
	if (containerWidth) { // we need to render this component twice in order to get the container width. Skip this on first render

		// create editor
		if (editorType === EDITOR_TYPE__INLINE) {
			editor = buildFromColumnsConfig();
		// } else if (editorType === EDITOR_TYPE__PLAIN) {
		// 	formComponents = buildFromItems();
		// 	const formAncillaryComponents = buildAncillary();
		// 	editor = <>
		// 				<VStack className="p-4">{formComponents}</VStack>
		// 				<VStack className="pt-4">{formAncillaryComponents}</VStack>
		// 			</>;
		} else {
			formComponents = buildFromItems();
			const formAncillaryComponents = buildAncillary();
			editor = <>
						{containerWidth >= styles.FORM_ONE_COLUMN_THRESHOLD ? <HStack className="Form-formComponents-HStack p-4 gap-4 justify-center">{formComponents}</HStack> : null}
						{containerWidth < styles.FORM_ONE_COLUMN_THRESHOLD ? <VStack className="Form-formComponents-VStack p-4">{formComponents}</VStack> : null}
						<VStack className="Form-AncillaryComponents m-2 pt-4 px-2">{formAncillaryComponents}</VStack>
					</>;

			additionalButtons = buildAdditionalButtons(additionalEditButtons);

			if (inArray(editorType, [EDITOR_TYPE__SIDE, EDITOR_TYPE__SMART, EDITOR_TYPE__WINDOWED]) && 
				isSingle && editorMode === EDITOR_MODE__EDIT && 
				(onBack || (onViewMode && !disableView))) {
				modeHeader = <Toolbar>
								<HStack className="flex-1 items-center">
									{onBack &&
										<Button
											{...testProps('backBtn')}
											key="backBtn"
											onPress={onBack}
											icon={AngleLeft}
											_icon={{
												size: 'sm',
												className: 'text-white',
											}}
											className={`
												mr-4
											`}
											text="Back"
										/>}
									<Text className="text-[20px] ml-1 text-grey-500">Edit Mode</Text>
								</HStack>
								{onViewMode && !disableView && (!canUser || canUser(VIEW)) &&
									<Button
										{...testProps('toViewBtn')}
										key="viewBtn"
										onPress={onViewMode}
										icon={Eye}
										_icon={{
											size: 'sm',
											className: 'text-white',
										}}
										text="To View"
										tooltip="Switch to View Mode"
									/>}
							</Toolbar>;
			}
			if (editorMode === EDITOR_MODE__EDIT && !_.isEmpty(additionalButtons)) {
				formButtons.push(<Toolbar key="additionalButtonsToolbar" className="justify-end flex-wrap">
									{additionalButtons}
								</Toolbar>)
			}
		}



		// create footer
		if (!formState.isValid) {
			isSaveDisabled = true;
			isSubmitDisabled = true;
		}
		if (_.isEmpty(formState.dirtyFields) && !isPhantom) {
			isSaveDisabled = true;
		}
		if (onDelete && editorMode === EDITOR_MODE__EDIT && isSingle) {
			showDeleteBtn = true;
		}
		if (!isEditorViewOnly && !hideResetButton) {
			showResetBtn = true;
		}
		if (editorType !== EDITOR_TYPE__SIDE) { // side editor won't show either close or cancel buttons!
			// determine whether we should show the close or cancel button
			if (isEditorViewOnly) {
				showCloseBtn = true;
			} else {
				const formIsDirty = formState.isDirty;
				// if (editorType === EDITOR_TYPE__WINDOWED && onCancel) {
				// 	showCancelBtn = true;
				// }
				if (formIsDirty || isPhantom) {
					if (isSingle && onCancel) {
						showCancelBtn = true;
					}
				} else {
					if (onClose) {
						showCloseBtn = true;
					}
				}
			}
		}
		if (!isEditorViewOnly && onSave) {
			showSaveBtn = true;
		}
		if (!!onSubmit) {
			showSubmitBtn = true;
		}
		footerButtons =
			<>
				{onDelete && editorMode === EDITOR_MODE__EDIT && isSingle &&

					<HStack className="flex-1 justify-start">
						<Button
							{...testProps('deleteBtn')}
							key="deleteBtn"
							onPress={onDelete}
							className={`
								bg-warning-500
								hover:bg-warning-700
								text-white
							`}
							text="Delete"
						/>
					</HStack>}

				{showResetBtn && 
					<IconButton
						{...testProps('resetBtn')}
						key="resetBtn"
						onPress={() => doReset()}
						icon={Rotate}
						className="mr-2"
						isDisabled={!formState.isDirty}
					/>}

				{showCancelBtn &&
					<Button
						{...testProps('cancelBtn')}
						key="cancelBtn"
						variant="outline"
						onPress={onCancel}
						className="text-white mr-2"
						text="Cancel"
					/>}
					
				{showCloseBtn && 
					<Button
						{...testProps('closeBtn')}
						key="closeBtn"
						variant="outline"
						onPress={onClose}
						className="text-white mr-2"
						text="Close"
					/>}

				{showSaveBtn && 
					<Button
						{...testProps('saveBtn')}
						key="saveBtn"
						onPress={(e) => handleSubmit(onSaveDecorated, onSubmitError)(e)}
						isDisabled={isSaveDisabled}
						className="text-white"
						text={editorMode === EDITOR_MODE__ADD ? 'Add' : 'Save'}
					/>}
				
				{showSubmitBtn && 
					<Button
						{...testProps('submitBtn')}
						key="submitBtn"
						onPress={(e) => handleSubmit(onSubmitDecorated, onSubmitError)(e)}
						isDisabled={isSubmitDisabled}
						className="text-white"
						text={submitBtnLabel || 'Submit'}
					/>}
			
				{additionalFooterButtons && _.map(additionalFooterButtons, (props) => {
					return <Button
								{...testProps('additionalFooterBtn-' + props.key)}
								{...props}
								onPress={(e) => handleSubmit(props.onPress, onSubmitError)(e)}
								text={props.text}
							/>;
				})}
			</>;

		if (editorType === EDITOR_TYPE__INLINE) {
			footer =
				<Box
					className={`
						Form-inlineFooter-container
						relative
						w-full
					`}
				>
					<HStack
						className={`
							Form-inlineFooter
							absolute
							top-[9px]
							left-[100px]
							w-[100px]
							min-w-[300px]
							py-2
							justify-center
							items-center
							rounded-b-lg
							bg-red-500
							${styles.GRID_INLINE_EDITOR_BG}
						`}
					>{footerButtons}</HStack>
				</Box>;
		} else {
			if (!disableFooter) {
				let footerClassName = '';
				footerClassName += ' justify-end';
				if (editorType === EDITOR_TYPE__INLINE) {
					footerClassName += `
						sticky
						self-start
						justify-center
						bg-primary-100
						rounded-b-lg
					`;
				}
				if (isSaving) {
					footerClassName += ' border-t-2 border-t-[#f00]'
				}
				footer = <Footer className={footerClassName} {...footerProps}>
							{footerButtons}
						</Footer>;
			}
		}

	} // END if (containerWidth)
	
	let className = props.className || '';
	className += ' Form-VStackNative';
	return <VStackNative
				ref={formRef}
				{...testProps(self)}
				style={style}
				onLayout={onLayoutDecorated}
				className={className}
			>
				{!!containerWidth && <>
					{editorType === EDITOR_TYPE__INLINE &&
						editor}
					{editorType !== EDITOR_TYPE__INLINE &&
						<ScrollView
							className={`
								ScrollView
								w-full
								flex-1
								pb-1
								web:min-h-[${minHeight}px]
							`}
						>
							{modeHeader}
							{formHeader}
							{formButtons}
							{editor}
						</ScrollView>}

					{footer}

				</>}
			</VStackNative>;
}

// helper fns
function disableRequiredYupFields(validator) {
	// based on https://github.com/jquense/yup/issues/1466#issuecomment-944386480
	if (!validator) {
		return null;
	}

	const nextSchema = validator.clone();
	return nextSchema.withMutation((next) => {
		if (typeof next.fields === 'object' && next.fields != null) {
			for (const key in next.fields) {
				const nestedField = next.fields[key];
		
				let nestedFieldNext = nestedField.notRequired();
		
				if (Array.isArray(nestedField.conditions) && nestedField.conditions.length > 0) {
					// Next is done to disable required() inside a condition
					// https://github.com/jquense/yup/issues/1002
					nestedFieldNext = nestedFieldNext.when('whatever', (unused, schema) => {
						return schema.notRequired();
					});
				}
		
				next.fields[key] = nestedFieldNext;
			}
		}
	});
}
function getNullFieldValues(initialValues, Repository) {
	const ret = {};
	if (Repository) {
		const properties = Repository.getSchema().model.properties;
		_.each(properties, (propertyDef) => {
			ret[propertyDef.name] = null;
		});
	} else {
		// takes a JSON object of fieldValues and sets them all to null
		_.each(initialValues, (value, field) => {
			ret[field] = null;
		});
	}
	return ret;
}

export const FormEditor = withComponent(withAlert(withEditor(Form)));

export default withComponent(withAlert(Form));