import { useState, useEffect, useRef, useContext, useCallback, } from 'react';
import natsort from 'natsort';
import useForceUpdate from '../../Hooks/useForceUpdate.js';
import FieldSetContext from '../../Contexts/FieldSetContext.js';
import _ from 'lodash';

// This HOC gives the component value props, primarily for a Form Field.

export default function withValue(WrappedComponent) {
	return (props) => {

		if (props.disableWithValue) {
			return <WrappedComponent {...props} />;
		}

		if (props.setValue) {
			// bypass everything, since we're already using withValue() in hierarchy.
			// For example, Combo has withValue(), and intenally it uses Input which also has withValue(),
			// but we only need it defined once for the whole thing.
			return <WrappedComponent {...props} />;
		}

		const
			{
				onChangeValue,
				value,
				startingValue = null,
				isValueAlwaysArray = false,
				isValueAsStringifiedJson = false,

				// withComponent
				self,

				// withData
				Repository,
				idIx,
			} = props,
			forceUpdate = useForceUpdate(),
			childRef = useRef({}),
			onChangeValueRef = useRef(),
			localValueRef = useRef(startingValue || value),
			fieldSetOnChangeValueRef = useRef(),
			fieldSetContext = useContext(FieldSetContext),
			fieldSetRegisterChild = fieldSetContext?.registerChild,
			fieldSetOnChangeValue = fieldSetContext?.onChangeValue,
			getLocalValue = () => {
				return localValueRef.current;
			},
			setLocalValue = (value) => {
				localValueRef.current = value;
				forceUpdate();
			},
			setValueRef = useRef((newValue) => {
				// NOTE: We useRef so that this function stays current after renders
				if (isValueAlwaysArray && !_.isArray(newValue)) {
					newValue = _.isNil(newValue) ? [] : [newValue];
				}
				if (_.isArray(newValue)) {
					const sortFn = natsort.default || natsort; // was having trouble with webpack and this solves it

					// TODO: sort by the sortProperty, whatever that is, instead of just value
					newValue.sort(sortFn()); // Only sort if we're using id/text arrangement. Otherwise, keep sort order as specified in Repository.
				}
				if (isValueAsStringifiedJson) {
					newValue = JSON.stringify(newValue);
				}

				if (newValue === getLocalValue()) {
					return;
				}

				setLocalValue(newValue);
				
				if (onChangeValueRef.current) {
					onChangeValueRef.current(newValue, childRef.current);
				}
				if (fieldSetOnChangeValueRef.current) {
					fieldSetOnChangeValueRef.current(newValue, childRef.current);
				}
			}),
			setValue = (args) => {
				setValueRef.current(args);
			},
			onChangeSelection = (selection) => {
				let value = null,
					values;
				if (selection.length) {
					if (Repository) {
						if (selection.length === 1) {
							value = selection[0].id;
						} else {
							values = _.map(selection, (entity) => entity.id);
						}
					} else {
						if (selection.length === 1) {
							value = selection[0][idIx];
						} else {
							values = _.map(selection, (item) => item[idIx]);
						}
					}
				}
				if (values) {
					value = values;
				}
				setValue(value);
			};

		// Ensure these passed functions stay current after render
		onChangeValueRef.current = onChangeValue;
		fieldSetOnChangeValueRef.current = fieldSetOnChangeValue;

		useEffect(() => {
			if (!_.isEqual(value, getLocalValue())) {
				setLocalValue(value);
			}
		}, [value]);
		
		if (fieldSetRegisterChild) {
			useEffect(() => {
				fieldSetRegisterChild({
					childRef: childRef.current,
					value,
					setValue: setValueRef.current,
				});
			}, []);
		}

		if (self) {
			self.setValue = setValue;
			self.value = getLocalValue();
		}

		
		// Convert localValue to normal JS primitives for field components
		let convertedValue = getLocalValue();
		if (_.isString(convertedValue) && isValueAsStringifiedJson && !_.isNil(convertedValue)) {
			convertedValue = JSON.parse(convertedValue);
		}
		if (isValueAlwaysArray) {
			if (_.isEmpty(convertedValue) || _.isNil(convertedValue)) {
				convertedValue = [];
			}
		}

		return <WrappedComponent
					{...props}
					disableWithValue={false}
					value={convertedValue}
					setValue={setValue}
					onChangeSelection={onChangeSelection}
				/>;
	};
}