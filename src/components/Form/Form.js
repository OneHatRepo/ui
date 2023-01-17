import { useEffect, } from 'react';
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
} from '../../Constants/EditorTypes';
import { useForm, Controller } from 'react-hook-form'; // https://react-hook-form.com/api/
import * as yup from 'yup'; // https://github.com/jquense/yup#string
import { yupResolver } from '@hookform/resolvers/yup';
import useForceUpdate from '../../Hooks/useForceUpdate';
import withAlert from '../Hoc/withAlert';
import inArray from '../../Functions/inArray';
import getComponentFromType from '../../Functions/getComponentFromType';
import IconButton from '../Buttons/IconButton';
import Rotate from '../Icons/Rotate';
import Pencil from '../Icons/Pencil';
import Footer from '../Panel/Footer';
import Label from '../Form/Label';
import _ from 'lodash';

// TODO: memoize field Components

function Form(props) {
	const
		{
			editorType,
			startingValues = {},
			items = [],
			columnDefaults = {},
			useColumns = true, // these are layout columns for the form
			columnsConfig, // this is the columnsConfig from the grid
			footerProps = {},
			buttonGroupProps = {},
			onLayout,

			h,
			maxHeight,
			w,
			maxWidth,
			flex,

			// withData
			Repository,

			// withEditor
			isViewOnly = false,
			onCancel,
			onSave,
			onClose,

			// withSelection
			selectorId,
			selectorSelected,

			// withAlert
			confirm,
		} = props,
		entity = props.entity.length === 1 ? props.entity[0] : props.entity,
		isMultiple = _.isArray(entity),
		emptyValidator = yup.object(),
		forceUpdate = useForceUpdate(),
		initialValues =  _.merge(startingValues, (entity ? entity.submitValues : {})),
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
			// values,
			// resetOptions: {
			// 	keepDirtyValues: false, // user-interacted input will be retained
			// 	keepErrors: false, // input errors will be retained with value update
			// },
			// criteriaMode: 'firstError', // firstError | all
			// shouldFocusError: false,
			// delayError: 0,
			// shouldUnregister: false,
			// shouldUseNativeValidation: false,
			resolver: yupResolver((isMultiple ? disableRequiredYupFields(entity?.repository?.schema?.model?.validator) : entity?.repository?.schema?.model?.validator) || emptyValidator),
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
					const renderedValue = renderer ? renderer(entity) : entity[fieldName];
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
					isEditable,
					label,
					items,
					...propsToPass
				} = item;
			let editorTypeProps = {};

			const model = Repository.getSchema().model;
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
			const Element = getComponentFromType(type);
			let children;
			if (inArray(type, ['Column', 'FieldSet'])) {
				if (_.isEmpty(items)) {
					return null;
				}
				children = _.map(items, (item, ix) => buildNextLayer(item, ix, item.defaults));
				return <Element key={ix} title={title} {...defaults} {...propsToPass} {...editorTypeProps}>{children}</Element>;
			}
			
			if (!name) {
				throw new Error('name is required');
			}

			if (isViewOnly || !isEditable) {
				if (!label && Repository) {
					label = model.titles[name];
				}
				const value = (entity && entity[name]) || (startingValues && startingValues[name]) || null;
				let element = <Text numberOfLines={1} ellipsizeMode="head" {...propsToPass}>{value}</Text>;
				if (label) {
					element = <><Label>{label}</Label>{element}</>;
				}
				return <Row key={ix} px={2} pb={1} bg="#fff">{element}</Row>;
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
								element = <><Label>{label}</Label>{element}</>;
							}

							const dirtyIcon = isDirty ? <Icon as={Pencil} size="2xs" color="trueGray.300" position="absolute" top="2px" left="2px" /> : null;
							return <Row key={ix} px={2} pb={1} bg={error ? '#fdd' : null}>{dirtyIcon}{element}</Row>;
						}}
					/>;
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

	if (props.Repository && !props.entity) {
		return null;
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

	const formComponents = columnsConfig && !_.isEmpty(columnsConfig) && Repository ? buildFromColumnsConfig() : buildFromItems();
	
	return <Column {...sizeProps} onLayout={onLayout}>
				<ScrollView flex={1} width="100%" pb={1}>
					{useColumns ? <Row flex={1}>{formComponents}</Row> : <Column flex={1}>{formComponents}</Column>}
				</ScrollView>
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
														onPress={handleSubmit(onSave)}
														isDisabled={!_.isEmpty(formState.errors) || (!entity.isPhantom && !formState.isDirty)}
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
					nestedFieldNext = nestedFieldNext.when('whatever', (_: unknown, schema: yup.AnySchema) =>
						schema.notRequired(),
					);
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


export default withAlert(Form);