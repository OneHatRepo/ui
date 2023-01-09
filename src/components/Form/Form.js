import { useState, useEffect, useRef, } from 'react';
import {
	Button,
	Column,
	Icon,
	Row,
	ScrollView,
	Text,
} from 'native-base';
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
	const {
			entity,
			startingValues = {},
			
			items = [],
			columnDefaults = {},
			onCancel,
			onSave,
			useColumns = true,
			selectorId,
			selectorSelected,

			// withAlert
			confirm,
		} = props,
		emptyValidator = yup.object(),
		cancelRef = useRef(null),
		forceUpdate = useForceUpdate(),
		[isConfirmationOpen, setIsConfirmationOpen] = useState(false),
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
			defaultValues: _.merge(startingValues, (entity ? entity.submitValues : {})),
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
			resolver: yupResolver(entity?.repository?.schema?.model?.validator || emptyValidator),
		}),
		buildNextLayer = (item, ix, defaults) => {
			const {
					fieldType,
					title,
					name,
					label,
					items,
					...propsToPass
				} = item,
				Element = getComponentFromType(fieldType),
				rules = {}

			let children;
			if (inArray(fieldType, ['Column', 'FieldSet'])) {
				if (_.isEmpty(items)) {
					return null;
				}
				children = _.map(items, (item, ix) => buildNextLayer(item, ix, item.defaults));
				return <Element key={ix} title={title} {...defaults} {...propsToPass}>{children}</Element>;
			}

			if (!name) {
				throw new Error('name is required');
			}


			if (fieldType === 'Text') {
				return <Text key={ix} {...defaults} {...propsToPass}>{entity[name]}</Text>;
			}
		
			// // These rules are for fields *outside* the model
			// // but which want validation on the form anyway.
			// // The useForm() resolver disables this
			// const
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
												setValue={(value) => {
													onChange(value);
												}}
												onBlur={onBlur}
												selectorId={selectorId}
												selectorSelected={selectorSelected}
												flex={1}
												{...defaults}
												{...propsToPass}
											/>;
							if (error) {
								element = <Column pt={1} flex={1}>
												{element}
												<Text color="#f00">{error.message}</Text>
											</Column>;
							}
							if (label) {
								element = <><Label>{label}</Label>{element}</>;
							}

							const dirtyIcon = isDirty ? <Icon as={Pencil} size="2xs" color="trueGray.300" position="absolute" top="2px" left="2px" /> : null;
							return <Row key={ix} px={2} pb={1} bg={error ? '#fdd' : '#fff'}>{dirtyIcon}{element}</Row>;
						}}
					/>;
		},
		formComponents = _.map(items, (item, ix) => buildNextLayer(item, ix, columnDefaults)),
		onCloseConfirmation = () => {
			setIsConfirmationOpen(false);
		};
	
	useEffect(() => {
		if (!entity) {
			return () => {};
		}

		const LocalRepository = entity.repository;
		LocalRepository.ons(['changeData', 'change'], forceUpdate);

		return () => {
			LocalRepository.offs(['changeData', 'change'], forceUpdate);
		};
	}, [entity]);
	
	return <Column w="100%" flex={1}>
				<ScrollView flex={1} pb={3} {...props}>
					{useColumns ? <Row flex={1}>{formComponents}</Row> : <Column flex={1}>{formComponents}</Column>}
				</ScrollView>
				<Footer justifyContent="flex-end" >
					<Button.Group space={2}>
						<IconButton
							key="resetBtn"
							onPress={reset}
							icon={<Rotate color="#fff" />}
						/>
						{onCancel && <Button
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
						{onSave && <Button
										key="saveBtn"
										onPress={handleSubmit(onSave)}
										isDisabled={!_.isEmpty(formState.errors) || (!entity.isPhantom && !formState.isDirty)}
										color="#fff"
									>Save</Button>}
					</Button.Group>
				</Footer>
			</Column>;

}

export default withAlert(Form);