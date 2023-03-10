import { useEffect, useState, isValidElement, } from 'react';
import {
	Box,
	Button,
	Column,
	Icon,
	Row,
	ScrollView,
	Text,
} from 'native-base';
import {
	EDITOR_TYPE_INLINE,
	EDITOR_TYPE_WINDOWED,
	EDITOR_TYPE_SMART,
	EDITOR_TYPE_PLAIN,
} from '../../Constants/EditorTypes.js';
import { useForm, Controller } from 'react-hook-form'; // https://react-hook-form.com/api/
import * as yup from 'yup'; // https://github.com/jquense/yup#string
import { yupResolver } from '@hookform/resolvers/yup';
import useForceUpdate from '../../Hooks/useForceUpdate.js';
import withAlert from '../Hoc/withAlert.js';
import withEditor from '../Hoc/withEditor.js';
import inArray from '../../Functions/inArray.js';
import getComponentFromType from '../../Functions/getComponentFromType.js';
import IconButton from '../Buttons/IconButton.js';
import Rotate from '../Icons/Rotate.js';
import Pencil from '../Icons/Pencil.js';
import Footer from '../Panel/Footer.js';
import Label from '../Form/Label.js';
import _ from 'lodash';

// TODO: memoize field Components

// Modes:
// EDITOR_TYPE_INLINE
// Form is a single scrollable row, based on columnsConfig and Repository
//
// EDITOR_TYPE_WINDOWED
// Form is a popup window, used for editing items in a grid. Integrated with Repository
//
// EDITOR_TYPE_SMART
// Form is a standalone editor
//
// EDITOR_TYPE_PLAIN
// Form is embedded on screen in some other way. Mainly use startingValues, items, validator

function Form(props) {
	const
		{
			editorType = EDITOR_TYPE_WINDOWED, // EDITOR_TYPE_INLINE | EDITOR_TYPE_WINDOWED | EDITOR_TYPE_PLAIN
			startingValues = {},
			items = [], // Columns, FieldSets, Fields, etc to define the form
			columnDefaults = {}, // defaults for each Column defined in items (above)
			columnsConfig, // Which columns are shown in Grid, so the inline editor can match. Used only for EDITOR_TYPE_INLINE
			validator, // custom validator, mainly for EDITOR_TYPE_PLAIN
			footerProps = {},
			buttonGroupProps = {}, // buttons in footer
			
			// sizing of outer container
			h,
			maxHeight,
			w,
			maxWidth,
			flex,
			onLayout, // onLayout handler for main view

			// withData
			Repository,
			
			// withEditor
			isViewOnly = false,
			onCancel,
			onEditorSave,
			onSave = onEditorSave,
			onClose,

			// withSelection
			selectorId,
			selectorSelected,

			// withAlert
			alert,
			confirm,
		} = props,
		record = props.record?.length === 1 ? props.record[0] : props.record,
		isMultiple = _.isArray(record),
		isSingle = !isMultiple, // for convenience
		forceUpdate = useForceUpdate(),
		initialValues =  _.merge(startingValues, (record && !record.isDestroyed ? record.submitValues : {})),
		defaultValues = isMultiple ? getNullFieldValues(initialValues, Repository) : initialValues, // when multiple entities, set all default values to null
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
			// setValue,
			// setFocus,
			getValues,
			getFieldState,
			// trigger,
		} = useForm({
			mode: 'onChange', // onChange | onBlur | onSubmit | onTouched | all
			// reValidateMode: 'onChange', // onChange | onBlur | onSubmit
			defaultValues,
			values: defaultValues,
			// resetOptions: {
			// 	keepDirtyValues: false, // user-interacted input will be retained
			// 	keepErrors: false, // input errors will be retained with value update
			// },
			// criteriaMode: 'firstError', // firstError | all
			// shouldFocusError: false,
			// delayError: 0,
			// shouldUnregister: false,
			// shouldUseNativeValidation: false,
			resolver: yupResolver(validator || (isMultiple ? disableRequiredYupFields(Repository?.schema?.model?.validator) : Repository?.schema?.model?.validator) || yup.object()),
		}),
		buildFromColumnsConfig = () => {
			// For InlineEditor
			// Build the fields that match the current columnsConfig in the grid
			const
				model = Repository.getSchema().model,
				elements = [],
				columnProps = {
					justifyContent: 'center',
					alignItems: 'center',
					borderRightWidth: 1,
					borderRightColor: 'trueGray.200',
					px: 1,
				};
			_.each(columnsConfig, (config, ix) => {
				let {
						fieldName,
						isEditable,
						editor,
						renderer,
						w,
						flex,
					} = config;

				if (!isEditable) {
					const renderedValue = renderer ? renderer(record) : record[fieldName];
					elements.push(<Box key={ix} w={w} flex={flex} {...columnProps}>
										<Text numberOfLines={1} ellipsizeMode="head">{renderedValue}</Text>
									</Box>);
				} else {
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
											let editorProps = {};
											if (!editor) {
												editor = model.editorTypes[fieldName];
												if (_.isPlainObject(editor)) {
													const {
															type,
															...p
														} = editor;
													editorProps = p;
													editor = type;
												}
											}
											const Element = getComponentFromType(editor);
											if (!Element) {
												debugger;
												// LEFT OFF HERE
												// Trying inline editor, based on columnsConfig
												// Getting an error that the OrdersEditor is missing users__email.
												// Why is this even on the OrdersEditor? Runner?
											}
											let element = <Element
																name={name}
																value={value}
																setValue={(newValue) => {
																	onChange(newValue);
																}}
																onBlur={onBlur}
																selectorId={selectorId}
																selectorSelected={selectorSelected}
																flex={1}
																{...editorProps}
																// {...defaults}
																// {...propsToPass}
															/>;

											// element = <Tooltip key={ix} label={header} placement="bottom">
											// 				{element}
											// 			</Tooltip>;
											// if (error) {
											// 	element = <Column pt={1} flex={1}>
											// 				{element}
											// 				<Text color="#f00">{error.message}</Text>
											// 			</Column>;
											// }

											const dirtyIcon = isDirty ? <Icon as={Pencil} size="2xs" color="trueGray.300" position="absolute" top="2px" left="2px" /> : null;
											return <Row key={ix} bg={error ? '#fdd' : '#fff'} w={w} flex={flex} {...columnProps}>{dirtyIcon}{element}</Row>;
										}}
									/>);
				}
			});
			return <Row>{elements}</Row>;
		},
		buildFromItems = () => {
			return  _.map(items, (item, ix) => buildNextLayer(item, ix, columnDefaults));
		},
		buildNextLayer = (item, ix, defaults) => {
			let {
					type,
					title,
					name,
					isEditable = true,
					label,
					items,
					...propsToPass
				} = item;
			let editorTypeProps = {};

			const model = Repository?.getSchema().model;
			if (!type && Repository) {
				const 
					editorTypes = model.editorTypes,
					{
						type: t,
						...p
					} =  editorTypes[name];
				type = t;
				editorTypeProps = p;
			}
			if (type?.match && type.match(/Combo$/) && Repository?.isRemote && !Repository?.isLoaded) {
				editorTypeProps.autoLoad = true;
			}
			const Element = getComponentFromType(type);
			let children;

			if (inArray(type, ['Column', 'FieldSet'])) {
				if (_.isEmpty(items)) {
					return null;
				}
				const defaults = item.defaults;
				children = _.map(items, (item, ix) => {
					return buildNextLayer(item, ix, defaults);
				});
				return <Element key={ix} title={title} {...defaults} {...propsToPass} {...editorTypeProps}>{children}</Element>;
			}
			
			if (!name) {
				throw new Error('name is required');
			}

			if (isViewOnly || !isEditable) {
				const Text = getComponentFromType('Text');
				if (!label && Repository) {
					label = model.titles[name];
				}
				const value = (record && record[name]) || (startingValues && startingValues[name]) || null;
				let element = <Text
									value={value}
									{...propsToPass}
								/>;
				if (label) {
					const labelProps = {};
					if (defaults?.labelWidth) {
						labelProps.w = defaults.labelWidth;
					}
					element = <><Label {...labelProps}>{label}</Label>{element}</>;
				}
				return <Row key={ix} px={2} pb={1}>{element}</Row>;
			}

			if (!label && Repository) {
				label = model.titles[name];
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
							let element = <Element
												name={name}
												value={value}
												onChangeValue={onChange}
												onBlur={onBlur}
												selectorId={selectorId}
												selectorSelected={selectorSelected}
												flex={1}
												{...defaults}
												{...propsToPass}
												{...editorTypeProps}
											/>;
							if (error) {
								if (editorType !== EDITOR_TYPE_INLINE) {
									element = <Column pt={1} flex={1}>
												{element}
												<Text color="#f00">{error.message}</Text>
											</Column>;
								} else {
									debugger;


								}
							}
							if (label && editorType !== EDITOR_TYPE_INLINE) {
								const labelProps = {};
								if (defaults?.labelWidth) {
									labelProps.w = defaults.labelWidth;
								}
								element = <Row w="100%">
												<Label {...labelProps}>{label}</Label>
												{element}
											</Row>;
							}

							const dirtyIcon = isDirty ? <Icon as={Pencil} size="2xs" color="trueGray.300" position="absolute" top="2px" left="2px" /> : null;
							return <Row key={ix} px={2} pb={1} bg={error ? '#fdd' : null}>{dirtyIcon}{element}</Row>;
						}}
					/>;
		},
		onSubmitError = (errors, e) => {
			debugger;
			if (editorType === EDITOR_TYPE_INLINE) {
				alert(errors.message);
			}
		};

	useEffect(() => {
		if (!Repository) {
			return () => {};
		}

		Repository.ons(['changeData', 'change'], forceUpdate);

		return () => {
			Repository.offs(['changeData', 'change'], forceUpdate);
		};
	}, [Repository]);

	// if (Repository && (!record || _.isEmpty(record))) {
	// 	return null;
	// }
	
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

	let formComponents,
		editor;
	if (editorType === EDITOR_TYPE_INLINE) {
		// for inline editor
		formComponents = buildFromColumnsConfig();
		editor = <ScrollView
					horizontal={true}
					flex={1}
					bg="#fff"
					py={1}
					borderTopWidth={3}
					borderBottomWidth={5}
					borderTopColor="primary.100"
					borderBottomColor="primary.100"
				>{formComponents}</ScrollView>;
	} else {
		// for Windowed editor
		formComponents = buildFromItems();
		editor = <ScrollView flex={1} width="100%" pb={1}>
					<Row flex={1}>{formComponents}</Row>
				</ScrollView>;
	}
	
	return <Column {...sizeProps} onLayout={onLayout}>
				
				{editor}

				<Footer justifyContent="flex-end" {...footerProps}>
					<Button.Group space={2} {...buttonGroupProps}>
						{!isViewOnly && <IconButton
											key="resetBtn"
											onPress={reset}
											icon={<Rotate color="#fff" />}
										/>}
						{!isViewOnly && onCancel && <Button
														key="cancelBtn"
														variant="ghost"
														onPress={() => {
															if (formState.isDirty) {
																confirm('This record has unsaved changes. Are you sure you want to cancel editing? Changes will be lost.', onCancel);
															} else {
																onCancel();
															}
														}}
														color="#fff"
													>Cancel</Button>}
						{!isViewOnly && onSave && <Button
														key="saveBtn"
														onPress={(e) => handleSubmit(onSave, onSubmitError)(e)}
														isDisabled={!_.isEmpty(formState.errors) || (!isSingle && !record?.isPhantom && !formState.isDirty)}
														color="#fff"
													>Save</Button>}
						{isViewOnly && onClose && <Button
														key="closeBtn"
														onPress={onClose}
														color="#fff"
													>Close</Button>}
					</Button.Group>
				</Footer>
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

export const FormEditor = withAlert(withEditor(Form));

export default withAlert(Form);