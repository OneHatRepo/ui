import { useState, useEffect, } from 'react';
import {
	Box,
	Button,
	Column,
	FormControl,
	Input,
	Row,
	Text,
} from 'native-base';
import { useForm, Controller } from 'react-hook-form';
import inArray from '../../functions/inArray';
import Label from '../Form/Label';
import FieldSet from '../Form/FieldSet';
import Field from '../Form/Field';
import BooleanCombo from '../Combo/BooleanCombo';
import Combo from '../Combo/Combo';
import MonthsCombo from '../Combo/MonthsCombo';
import _ from 'lodash';


function Form(props) {
	const {
			items = [],
			defaultValues,
			values,
			onCancel,
			onSave,
		} = props,
		{
			control,
			formState: {
				errors,
			},
			handleSubmit,
			register, 
			reset,
			watch,
		} = useForm({
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
		}),
		formatErrors = (errors) => {
			debugger;
		},
		buildNextLayer = (item, ix, defaults) => {
			const {
					type,
					title,
					name,
					label,
					items,
					...propsToPass
				} = item;

			let Element,
				children;
			switch (type) {
				case 'Column':
					Element = Column;
					break;
				case 'FieldSet':
					Element = FieldSet;
					break;
				case 'Input':
					Element = Input;
					break;
				case 'BooleanCombo':
					Element = BooleanCombo;
					break;
				case 'Combo':
					Element = Combo;
					break;
				case 'MonthsCombo':
					Element = MonthsCombo;
					break;
				default:
					throw new Error('type not recognized');
			}
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
		
			const
				rulesToCheck = [
					'required',
					'min',
					'max',
					'minLength',
					'maxLength',
					'pattern',
					'validate',
				],
				rules = {};
			_.each(rulesToCheck, (rule) => {
				if (item.hasOwnProperty(rule)) {
					rules[rule] = item[rule];
				}
			});

			return <Controller
						key={'controller-' + ix}
						name={name}
						rules={rules}
						control={control}
						render={({ onChange, value }) => {
							let element = <Element
												onChangeText={(text) => onChange(text)}
												name={name}
												value={value}
												flex={1}
												// {...register(name, registerOptions)}
												{...defaults}
												{...propsToPass}
											/>;
							if (errors[name]) {
								element = <Column>
												{element}
												<Text color="red">{formatErrors(errors[name])}</Text>
											</Column>;
							}
							if (label) {
								element = <><Label>{label}</Label>{element}</>;
							}
							return <Row key={ix} pb={1}>{element}</Row>;
						}}
					/>;
		},
		formComponents = _.map(items, (item, ix) => buildNextLayer(item, ix));
		
	return <Column w="100%" flex={1}>
				<Row flex={1}>
					{formComponents}
				</Row>

				{(onCancel || onSave) ? <Row h={30}>
					<Button.Group space={2}>
						{onCancel && <Button key="cancelBtn" variant="ghost" onPress={onCancel}>
										Cancel
									</Button> }
						{onSave && <Button key="saveBtn" onPress={handleSubmit(onSave)}>
										Save
									</Button>}
					</Button.Group>
				</Row> : null}
			</Column>;

}

export default Form;