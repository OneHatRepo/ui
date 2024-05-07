import React, { useEffect, useState, useRef, isValidElement, } from 'react';
import { View, } from 'react-native';
import {
	Box,
	Column,
	Icon,
	Row,
	ScrollView,
	Text,
} from 'native-base';
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
import { useForm, Controller } from 'react-hook-form'; // https://react-hook-form.com/api/
import * as yup from 'yup'; // https://github.com/jquense/yup#string
import { yupResolver } from '@hookform/resolvers/yup';
import useForceUpdate from '../../Hooks/useForceUpdate.js';
import UiGlobals from '../../UiGlobals.js';
import withAlert from '../Hoc/withAlert.js';
import withComponent from '../Hoc/withComponent.js';
import withEditor from '../Hoc/withEditor.js';
import withPdfButton from '../Hoc/withPdfButton.js';
import inArray from '../../Functions/inArray.js';
import getComponentFromType from '../../Functions/getComponentFromType.js';
import buildAdditionalButtons from '../../Functions/buildAdditionalButtons.js';
import Button from '../Buttons/Button.js';
import IconButton from '../Buttons/IconButton.js';
import AngleLeft from '../Icons/AngleLeft.js';
import Eye from '../Icons/Eye.js';
import Rotate from '../Icons/Rotate.js';
import Pencil from '../Icons/Pencil.js';
import Footer from '../Layout/Footer.js';
import Label from '../Form/Label.js';
import _ from 'lodash';

const
	ONE_COLUMN_THRESHOLD = 900, // only allow one column in form
	STACK_ROW_THRESHOLD = 500; // stack field-row elements

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
			footerProps = {},
			buttonGroupProps = {}, // buttons in footer
			checkIsEditingDisabled = true,
			disableLabels = false,
			disableDirtyIcon = false,
			onBack,
			onReset,
			onInit,
			onViewMode,
			submitBtnLabel,
			onSubmit,
			formSetup, // this fn will be executed after the form setup is complete
			additionalEditButtons,
			useAdditionalEditButtons = true,
			additionalFooterButtons,
			
			// sizing of outer container
			h,
			maxHeight,
			minHeight = 0,
			w,
			maxWidth,
			flex,
			onLayout, // onLayout handler for main view

			// withComponent
			self,

			// withData
			Repository,
			
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
		isSingle = !isMultiple, // for convenience
		isPhantom = !skipAll && !!record?.isPhantom, //
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
				columnProps = { // props applied to every column
					justifyContent: 'center',
					alignItems: 'center',
					borderRightWidth: 1,
					borderRightColor: 'trueGray.200',
					px: 1,
					minWidth: styles.INLINE_EDITOR_MIN_WIDTH,
				};
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
						...propsToPass
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
					if (_.isNil(propsToPass.showXButton)) {
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

					let element = <Element
										value={value}
										parent={self}
										reference={fieldName}
										{...propsToPass}
										{...viewerTypeProps}
									/>;
					elements.push(<Box key={ix} w={w} flex={flex} {...columnProps}>{element}</Box>);
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
										if (propsToPass.selectorId || editorTypeProps.selectorId) { // editorTypeProps.selectorId causes just this one field to use selectorId
											if (_.isNil(propsToPass.selectorSelected)) {
												editorTypeProps.selectorSelected = record;
											}
										}
										let dynamicProps = {};
										if (getDynamicProps) {
											dynamicProps = getDynamicProps({ fieldState, formSetValue, formGetValues, formState });
										}

										if (type.match(/Tag/)) {
											editorTypeProps.overflow = 'auto';
										}
										if (!type.match(/Toggle/)) {
											editorTypeProps.h = '40px';
										}

										let element = <Element
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
															flex={1}
															parent={self}
															reference={name}
															{...propsToPass}
															{...editorTypeProps}
															{...dynamicProps}
														/>;

										const dirtyIcon = isDirty && !disableDirtyIcon ? <Icon as={Pencil} size="2xs" color="trueGray.300" position="absolute" top="2px" left="2px" /> : null;
										return <Row key={ix} bg={error ? '#fdd' : '#fff'} w={w} flex={flex} {...columnProps}>{dirtyIcon}{element}</Row>;
									}}
								/>);
			
			});
			return <Row>{elements}</Row>;
		},
		buildFromItems = () => {
			return _.map(items, (item, ix) => buildFromItem(item, ix, columnDefaults));
		},
		buildFromItem = (item, ix, defaults) => {
			if (!item) {
				return null;
			}
			if (React.isValidElement(item)) {
				return item;
			}
			let {
					type,
					title,
					name,
					isEditable = true,
					label,
					items,
					onChange: onEditorChange,
					useSelectorId = false,
					isHidden = false,
					getDynamicProps,
					getIsRequired,
					...propsToPass
				} = item,
				editorTypeProps = {},
				viewerTypeProps = {};

			if (isHidden) {
				return null;
			}
			if (type === 'DisplayField') {
				isEditable = false;
			}
			const propertyDef = name && Repository?.getSchema().getPropertyDefinition(name);
			if (!useAdditionalEditButtons) {
				item = _.omit(item, 'additionalEditButtons');
			}
			if (propertyDef?.isEditingDisabled && checkIsEditingDisabled) {
				isEditable = false;
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
				if (_.isNil(propsToPass.showXButton)) {
					editorTypeProps.showXButton = true;
				}
			}
			const Element = getComponentFromType(type);
			
			if (inArray(type, ['Column', 'Row', 'FieldSet'])) {
				let children;
				if (_.isEmpty(items)) {
					return null;
				}
				if (type === 'Column') {
					if (containerWidth < ONE_COLUMN_THRESHOLD) {
						// everything is in one column
						if (propsToPass.hasOwnProperty('flex')) {
							delete propsToPass.flex;
						}
						if (propsToPass.hasOwnProperty('width')) {
							delete propsToPass.width;
						}
						if (propsToPass.hasOwnProperty('w')) {
							delete propsToPass.w;
						}
						propsToPass.w = '100%';
						propsToPass.mb = 1;
					}
					propsToPass.pl = 3;
				}
				if (type === 'Row') {
					propsToPass.w = '100%';
				}
				const itemDefaults = item.defaults || {};
				children = _.map(items, (item, ix) => {
					return buildFromItem(item, ix, {...defaults, ...itemDefaults});
				});
				return <Element key={ix} title={title} {...defaults} {...itemDefaults} {...propsToPass} {...editorTypeProps}>{children}</Element>;
			}

			if (!label && Repository && propertyDef?.title) {
				label = propertyDef.title;
			}

			if (isEditorViewOnly || !isEditable) {
				let value = null;
				if (record?.properties && record.properties[name]) {
					value = record.properties[name].displayValue;
				}
				if (_.isNil(value) && record && record[name]) {
					value = record[name];
				}
				if (_.isNil(value) && startingValues && startingValues[name]) {
					value = startingValues[name];
				}
		
				let element = <Element
									value={value}
									parent={self}
									reference={name}
									{...propsToPass}
									{...viewerTypeProps}
								/>;
				if (!disableLabels && label) {
					const labelProps = {};
					if (defaults?.labelWidth) {
						labelProps.w = defaults.labelWidth;
					}
					if (containerWidth > STACK_ROW_THRESHOLD) {
						element = <><Label {...labelProps}>{label}</Label>{element}</>;
					} else {
						element = <Column><Label {...labelProps}>{label}</Label>{element}</Column>;
					}
				}
				return <Row key={ix} px={2} pb={1}>{element}</Row>;
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
							if (propsToPass.selectorId || editorTypeProps.selectorId) { // editorTypeProps.selectorId causes just this one field to use selectorId
								if (_.isNil(propsToPass.selectorSelected)) {
									editorTypeProps.selectorSelected = record;
								}
							}
							let dynamicProps = {};
							if (getDynamicProps) {
								dynamicProps = getDynamicProps({ fieldState, formSetValue, formGetValues, formState });
							}
							let element = <Element
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
												flex={1}
												parent={self}
												reference={name}
												{...defaults}
												{...propsToPass}
												{...editorTypeProps}
												{...dynamicProps}
											/>;
							let message = null;
							if (error) {
								message = error.message;
								if (label && error.ref?.name) {
									message = message.replace(error.ref.name, label);
								}
							}
							if (message) {
								message = <Text color="#f00">{message}</Text>;
							}
							element = <Column pt={1} flex={1}>
										{element}
										{message}
									</Column>;

							if (item.additionalEditButtons) {
								const buttons = buildAdditionalButtons(item.additionalEditButtons, self, { fieldState, formSetValue, formGetValues, formState });
								if (containerWidth > STACK_ROW_THRESHOLD) {
									element = <Row flex={1} flexWrap="wrap">
													{element}
													{buttons}
												</Row>;
								} else {
									element = <Column flex={1} w="100%">
												{element}
												<Row flex={1} w="100%" mt={2} flexWrap="wrap">
													{buttons}
												</Row>
											</Column>;
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
									requiredIndicator = <Text color="#f00" fontSize="30px" pr={1}>*</Text>;
								}
							}
							if (!disableLabels && label && editorType !== EDITOR_TYPE__INLINE) {
								const labelProps = {};
								if (defaults?.labelWidth) {
									labelProps.w = defaults.labelWidth;
								}
								if (containerWidth > STACK_ROW_THRESHOLD) {
									element = <Row w="100%" py={1}>
													<Label {...labelProps}>{requiredIndicator}{label}</Label>
													{element}
												</Row>;
								} else {
									element = <Column w="100%" py={1} mt={3}>
													<Label {...labelProps}>{requiredIndicator}{label}</Label>
													{element}
												</Column>;
								}
							} else if (disableLabels && requiredIndicator) {
								element = <Row w="100%" py={1}>
												{requiredIndicator}
												{element}
											</Row>;
							}

							const dirtyIcon = isDirty && !disableDirtyIcon ? <Icon as={Pencil} size="2xs" color="trueGray.300" position="absolute" top="2px" left="2px" /> : null;
							return <Row key={ix} px={2} pb={1} bg={error ? '#fdd' : null}>{dirtyIcon}{element}</Row>;
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
						...propsToPass
					} = item;
					if (isMultiple && type !== 'Attachments') {
						return;
					}
					if (!propsToPass.h) {
						propsToPass.h = 400;
					}
					const
						Element = getComponentFromType(type),
						element = <Element
										selectorId={selectorId}
										selectorSelected={selectorSelected || record}
										flex={1}
										uniqueRepository={true}
										parent={self}
										{...propsToPass}
									/>;
					if (title) {
						if (record?.displayValue) {
							title += ' for ' + record.displayValue;
						}
						title = <Text
									fontSize={styles.FORM_ANCILLARY_TITLE_FONTSIZE}
									fontWeight="bold"
								>{title}</Text>;
					}
					if (description) {
						description = <Text
									fontSize={styles.FORM_ANCILLARY_DESCRIPTION_FONTSIZE}
									fontStyle="italic"
								>{description}</Text>;
					}
					components.push(<Column key={'ancillary-' + ix} mx={2} my={5}>{title}{description}{element}</Column>);
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
			formSetup(formSetValue, formGetValues, formState)
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

	if (skipAll) {
		return null;
	}

	// if (Repository && (!record || _.isEmpty(record) || record.isDestroyed)) {
	// 	return null;
	// }

	if (!_.isNil(editorStateRef)) {
		editorStateRef.current = formState; // Update state so HOC can know what's going on
	}

	if (self) {
		self.ref = formRef;
		self.formState = formState;
		self.formSetValue = formSetValue;
		self.formGetValues = formGetValues;
	}
	
	const sizeProps = {};
	if (!flex && !h && !w) {
		sizeProps.flex = 1;
	} else {
		if (h) {
			sizeProps.h = h;
		}
		if (w) {
			sizeProps.w = w;
		}
		if (flex) {
			sizeProps.flex = flex;
		}
	}
	if (maxWidth) {
		sizeProps.maxWidth = maxWidth;
	}
	if (maxHeight) {
		sizeProps.maxHeight = maxHeight;
	}

	const formButtons = [];
	let formComponents,
		editor,
		additionalButtons,
		isSaveDisabled = false,
		isSubmitDisabled = false,
		savingProps = {},

		showDeleteBtn = false,
		showResetBtn = false,
		showCloseBtn = false,
		showCancelBtn = false,
		showSaveBtn = false,
		showSubmitBtn = false;

	if (containerWidth) { // we need to render this component twice in order to get the container width. Skip this on first render
		
		if (isSaving) {
			savingProps.borderTopWidth = 2;
			savingProps.borderTopColor = '#f00';
		}

		if (editorType === EDITOR_TYPE__INLINE) {
			editor = buildFromColumnsConfig();
		// } else if (editorType === EDITOR_TYPE__PLAIN) {
		// 	formComponents = buildFromItems();
		// 	const formAncillaryComponents = buildAncillary();
		// 	editor = <>
		// 				<Column p={4}>{formComponents}</Column>
		// 				<Column pt={4}>{formAncillaryComponents}</Column>
		// 			</>;
		} else {
			formComponents = buildFromItems();
			const formAncillaryComponents = buildAncillary();
			editor = <>
						{containerWidth >= ONE_COLUMN_THRESHOLD ? <Row p={4} pl={0}>{formComponents}</Row> : null}
						{containerWidth < ONE_COLUMN_THRESHOLD ? <Column p={4}>{formComponents}</Column> : null}
						<Column m={2} pt={4} px={2}>{formAncillaryComponents}</Column>
					</>;

			additionalButtons = buildAdditionalButtons(additionalEditButtons);

			formButtons.push(<Row key="buttonsRow" px={4} pt={4} alignItems="center" justifyContent="flex-end">
								{isSingle && editorMode === EDITOR_MODE__EDIT && onBack && 
									<Button
										key="backBtn"
										onPress={onBack}
										leftIcon={<Icon as={AngleLeft} color="#fff" size="sm" />}	
										color="#fff"
									>Back</Button>}
								{isSingle && editorMode === EDITOR_MODE__EDIT && onViewMode && !disableView &&
									<Button
										key="viewBtn"
										onPress={onViewMode}
										leftIcon={<Icon as={Eye} color="#fff" size="sm" />}	
										color="#fff"
									>To View</Button>}
							</Row>);
			if (editorMode === EDITOR_MODE__EDIT && !_.isEmpty(additionalButtons)) {
				formButtons.push(<Row key="additionalButtonsRow" p={4} alignItems="center" justifyContent="flex-end" flexWrap="wrap">
									{additionalButtons}
								</Row>)
			}
		}

		if (!formState.isValid) {
			isSaveDisabled = true;
			isSubmitDisabled = true;
		}
		if (_.isEmpty(formState.dirtyFields) && !isPhantom) {
			isSaveDisabled = true;
		}

		if (editorType === EDITOR_TYPE__INLINE) {
			footerProps.position = 'sticky';
			footerProps.alignSelf = 'flex-start';
			footerProps.justifyContent = 'center';
			footerProps.top = '100px';
			footerProps.left = '20px';
			footerProps.width = '200px';
			footerProps.bg = 'primary.100';
			footerProps.p = 0;
			footerProps.px = 4;
			footerProps.py = 2;
			footerProps.borderBottomRadius = 5;
		}

		if (onDelete && editorMode === EDITOR_MODE__EDIT && isSingle) {
			showDeleteBtn = true;
		}
		if (!isEditorViewOnly) {
			showResetBtn = true;
		}
		if (editorType !== EDITOR_TYPE__SIDE) { // side editor won't show either close or cancel buttons!
			// determine whether we should show the close or cancel button
			if (isEditorViewOnly) {
				showCloseBtn = true;
			} else {
				const formIsDirty = formState.isDirty;
				// console.log('formIsDirty', formIsDirty);
				// console.log('isPhantom', isPhantom);
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
	}
	
	return <Column {...sizeProps} onLayout={onLayoutDecorated} ref={formRef} testID="form">
				{!!containerWidth && <>
					{editorType === EDITOR_TYPE__INLINE &&
						<Row
							display="inline-block"
							flex={1}
							bg="#fff"
							py={1}
							borderTopWidth={3}
							borderBottomWidth={5}
							borderTopColor="primary.100"
							borderBottomColor="primary.100"
						>{editor}</Row>}
					{editorType !== EDITOR_TYPE__INLINE &&
						<ScrollView _web={{ minHeight, }} width="100%" pb={1}>
							{formButtons}
							{editor}
						</ScrollView>}
					
					<Footer justifyContent="flex-end" {...footerProps} {...savingProps}>
						{onDelete && editorMode === EDITOR_MODE__EDIT && isSingle &&

							<Row flex={1} justifyContent="flex-start">
								<Button
									key="deleteBtn"
									onPress={onDelete}
									bg="warning"
									_hover={{
										bg: 'warningHover',
									}}
									color="#fff"
								>Delete</Button>
							</Row>}

						{showResetBtn && 
							<IconButton
								key="resetBtn"
								onPress={() => doReset()}
								icon={Rotate}
								_icon={{
									color: !formState.isDirty ? 'trueGray.400' : '#000',
								}}
								isDisabled={!formState.isDirty}
								mr={2}
							/>}

						{showCancelBtn &&
							<Button
								key="cancelBtn"
								variant="ghost"
								onPress={onCancel}
								color="#fff"
							>Cancel</Button>}
							
						{showCloseBtn && 
							<Button
								key="closeBtn"
								variant="ghost"
								onPress={onClose}
								color="#fff"
							>Close</Button>}

						{showSaveBtn && 
							<Button
								key="saveBtn"
								onPress={(e) => handleSubmit(onSaveDecorated, onSubmitError)(e)}
								isDisabled={isSaveDisabled}
								color="#fff"
							>{editorMode === EDITOR_MODE__ADD ? 'Add' : 'Save'}</Button>}
						
						{showSubmitBtn && 
							<Button
								key="submitBtn"
								onPress={(e) => handleSubmit(onSubmitDecorated, onSubmitError)(e)}
								isDisabled={isSubmitDisabled}
								color="#fff"
							>{submitBtnLabel || 'Submit'}</Button>}
					
						{additionalFooterButtons && _.map(additionalFooterButtons, (props) => {
							return <Button
										{...props}
										onPress={(e) => handleSubmit(props.onPress, onSubmitError)(e)}
									>{props.text}</Button>;
						})}
					</Footer>
				</>}
			</Column>;
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

export const FormEditor = withComponent(withAlert(withEditor(withPdfButton(Form))));

export default withComponent(withAlert(withPdfButton(Form)));