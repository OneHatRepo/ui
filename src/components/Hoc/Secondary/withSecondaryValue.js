import { useState, useEffect, useRef, useContext, useCallback, } from 'react';
import natsort from 'natsort';
import useForceUpdate from '../../../hooks/useForceUpdate.js';
import FieldSetContext from '../../../Contexts/FieldSetContext.js';
import _ from 'lodash';

// NOTE: This is a modified version of @onehat/ui/src/Hoc/withValue
// This HOC will eventually get out of sync with that one, and may need to be updated.

export default function withSecondaryValue(WrappedComponent) {
	return (props) => {

		if (props.secondaryDisableWithValue) {
			return <WrappedComponent {...props} />;
		}

		if (props.secondarySetValue) {
			// bypass everything, since we're already using withSecondaryValue() in hierarchy.
			// For example, Combo has withSecondaryValue(), and intenally it uses Input which also has withSecondaryValue(),
			// but we only need it defined once for the whole thing.
			return <WrappedComponent {...props} />;
		}

		const
			{
				secondaryOnChangeValue,
				secondaryValue,
				secondaryStartingValue = null,
				secondaryIsValueAlwaysArray = false,
				secondaryIsValueAsStringifiedJson = false,

				// withComponent
				self,

				// withData
				SecondaryRepository,
				secondaryIdIx,
			} = props,
			forceUpdate = useForceUpdate(),
			childRef = useRef({}),
			secondaryOnChangeValueRef = useRef(),
			localValueRef = useRef(secondaryStartingValue || secondaryValue),
			fieldSetOnChangeValueRef = useRef(),
			fieldSetContext = useContext(FieldSetContext),
			fieldSetRegisterChild = fieldSetContext?.registerChild,
			fieldSetOnChangeValue = fieldSetContext?.secondaryOnChangeValue,
			getLocalValue = () => {
				return localValueRef.current;
			},
			secondarySetLocalValue = (secondaryValue) => {
				localValueRef.current = secondaryValue;
				forceUpdate();
			},
			secondarySetValueRef = useRef((newValue) => {
				// NOTE: We useRef so that this function stays current after renders
				if (secondaryIsValueAlwaysArray && !_.isArray(newValue)) {
					newValue = _.isNil(newValue) ? [] : [newValue];
				}
				if (_.isArray(newValue)) {
					const sortFn = natsort.default || natsort; // was having trouble with webpack and this solves it

					// TODO: sort by the sortProperty, whatever that is, instead of just value
					newValue.sort(sortFn()); // Only sort if we're using id/text arrangement. Otherwise, keep sort order as specified in SecondaryRepository.
				}
				if (secondaryIsValueAsStringifiedJson) {
					newValue = JSON.stringify(newValue);
				}

				if (newValue === getLocalValue()) {
					return;
				}

				secondarySetLocalValue(newValue);
				
				if (secondaryOnChangeValueRef.current) {
					secondaryOnChangeValueRef.current(newValue, childRef.current);
				}
				if (fieldSetOnChangeValueRef.current) {
					fieldSetOnChangeValueRef.current(newValue, childRef.current);
				}
			}),
			secondarySetValue = (args) => {
				secondarySetValueRef.current(args);
			},
			secondaryOnChangeSelection = (selection) => {
				let secondaryValue = null,
					secondaryValues;
				if (selection.length) {
					if (SecondaryRepository) {
						if (selection.length === 1) {
							secondaryValue = selection[0].id;
						} else {
							secondaryValues = _.map(selection, (entity) => entity.id);
						}
					} else {
						if (selection.length === 1) {
							secondaryValue = selection[0][secondaryIdIx];
						} else {
							secondaryValues = _.map(selection, (item) => item[secondaryIdIx]);
						}
					}
				}
				if (secondaryValues) {
					secondaryValue = secondaryValues;
				}
				secondarySetValue(secondaryValue);
			};

		// Ensure these passed functions stay current after render
		secondaryOnChangeValueRef.current = secondaryOnChangeValue;
		fieldSetOnChangeValueRef.current = fieldSetOnChangeValue;

		useEffect(() => {
			if (!_.isEqual(secondaryValue, getLocalValue())) {
				secondarySetLocalValue(secondaryValue);
			}
		}, [secondaryValue]);
		
		if (fieldSetRegisterChild) {
			useEffect(() => {
				fieldSetRegisterChild({
					childRef: childRef.current,
					value: secondaryValue,
					setValue: secondarySetValueRef.current,
				});
			}, []);
		}

		if (self) {
			self.secondarySetValue = secondarySetValue;
			self.secondaryValue = getLocalValue();
		}

		
		// Convert localValue to normal JS primitives for field components
		let convertedValue = getLocalValue();
		if (_.isString(convertedValue) && secondaryIsValueAsStringifiedJson && !_.isNil(convertedValue)) {
			convertedValue = JSON.parse(convertedValue);
		}
		if (secondaryIsValueAlwaysArray) {
			if (_.isEmpty(convertedValue) || _.isNil(convertedValue)) {
				convertedValue = [];
			}
		}

		return <WrappedComponent
					{...props}
					secondaryDisableWithValue={false}
					secondaryValue={convertedValue}
					secondarySetValue={secondarySetValue}
					secondaryOnChangeSelection={secondaryOnChangeSelection}
				/>;
	};
}