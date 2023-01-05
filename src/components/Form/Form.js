import { useState, useEffect, } from 'react';
import {
	Button,
	Column,
	Icon,
	Row,
	ScrollView,
	Text,
} from 'native-base';
import { useForm, Controller } from 'react-hook-form'; // https://react-hook-form.com/api/
import { yupResolver } from '@hookform/resolvers/yup';
import useForceUpdate from '../../hooks/useForceUpdate';
import inArray from '../../functions/inArray';
import getFormElementFromType from './getFormElementFromType';
import IconButton from '../Buttons/IconButton';
import Rotate from '../Icons/Rotate';
import Pencil from '../Icons/Pencil';
import Footer from '../Panel/Footer';
import Label from '../Form/Label';
import _ from 'lodash';

// TODO: memoize field components

function Form(props) {
	const {
			entity,
			values = {},
			
			items = [],
			columnDefaults = {},
			onCancel,
			onSave,
			useColumns = true,
		} = props,
		forceUpdate = useForceUpdate(),
		[isReady, setIsReady] = useState(false),
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
			defaultValues: _.merge(values, (entity ? entity.submitValues : {})),
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
			resolver: yupResolver(entity?.repository?.schema?.model?.validator),
		}),
		buildNextLayer = (item, ix, defaults) => {
			const {
					type,
					title,
					name,
					label,
					items,
					...propsToPass
				} = item,
				Element = getFormElementFromType(type),
				rules = {}

			let children;
			if (inArray(type, ['Column', 'FieldSet'])) {
				if (_.isEmpty(items)) {
					return null;
				}
				children = _.map(items, (item, ix) => buildNextLayer(item, ix, item.defaults));
				return <Element key={ix} title={title} {...defaults} {...propsToPass}>{children}</Element>;
			}

			if (!name) {
				throw new Error('name is required');
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
		formComponents = _.map(items, (item, ix) => buildNextLayer(item, ix, columnDefaults));
	
	useEffect(() => {
		if (!entity) {
			return () => {};
		}

		const LocalRepository = entity.repository;
		LocalRepository.ons(['changeData', 'change'], forceUpdate);

		setIsReady(true);

		return () => {
			LocalRepository.offs(['changeData', 'change'], forceUpdate);
		};
	}, [entity]);

	if (!isReady) {
		return null;
	}

	// console.log('formState', formState);
	// console.log('values', getValues());

	return <Column w="100%" flex={1}>
				<ScrollView flex={1} pb={3}>
					{useColumns ? <Row flex={1}>{formComponents}</Row> : <Column flex={1}>{formComponents}</Column>}
				</ScrollView>
				<Footer justifyContent="flex-end" >
					<Button.Group space={2}>
						<IconButton
							key="resetBtn"
							onPress={reset}
							icon={<Rotate />}
						/>
						{onCancel && <Button
										key="cancelBtn"
										variant="ghost"
										onPress={onCancel}
										color="#fff"
									>Cancel</Button>}
						{onSave && <Button
										key="saveBtn"
										onPress={handleSubmit(onSave)}
										isDisabled={!_.isEmpty(formState.errors)}
										color="#fff"
									>Save</Button>}
					</Button.Group>
				</Footer>
			</Column>;

}

export default Form;