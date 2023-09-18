import { useState, useEffect, } from 'react';
import natsort from 'natsort';
import _ from 'lodash';

// This HOC gives the component value props, primarily for a Form Field.

export default function withValue(WrappedComponent) {
	return (props) => {

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
				valueIsAlwaysArray = false,
				valueAsIdAndText = false,
				valueAsStringifiedJson = false,

				// withData
				Repository,
				idIx,
			} = props,
			[localValue, setLocalValue] = useState(startingValue || value),
			setValue = (newValue) => {
				if (valueIsAlwaysArray && !_.isArray(newValue)) {
					newValue = _.isNil(newValue) ? [] : [newValue];
				}
				if (_.isArray(newValue)) {
					// TODO: sort by the sortProperty, whatever that is, instead of just value
					newValue.sort(natsort()); // Only sort if we're using id/text arrangement. Otherwise, keep sort order as specified in Repository.
				}
				if (valueAsIdAndText) {
					if (_.isArray(newValue)) {
						newValue = _.map(newValue, (id) => {
							if (_.isNil(id)) {
								return id;
							}
							const record = Repository.getById(id);
							return {
								id: record.getId(),
								text: record.getDisplayValue(),
							};
						})
					} else {
						if (!_.isNil(id)) {
							const record = Repository.getById(newValue);
							newValue = {
								id: record.getId(),
								text: record.getDisplayValue(),
							};
						}
					}
				}
				if (valueAsStringifiedJson) {
					newValue = JSON.stringify(newValue);
				}

				if (newValue === localValue) {
					return;
				}

				setLocalValue(newValue);
				
				if (onChangeValue) {
					onChangeValue(newValue);
				}
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

		useEffect(() => {
			if (!_.isEqual(value, localValue)) {
				setLocalValue(value);
			}
		}, [value]);

		
		// Convert localValue to normal JS primitives for field components
		let convertedValue = localValue;
		if (_.isString(convertedValue) && valueAsStringifiedJson && !_.isNil(convertedValue)) {
			convertedValue = JSON.parse(convertedValue);
		}
		if (valueIsAlwaysArray) {
			if (_.isEmpty(convertedValue) || _.isNil(convertedValue)) {
				convertedValue = null;
			} else if (convertedValue.length === 1) {
				convertedValue = convertedValue[0];
			}
		}
		if (valueAsIdAndText && !_.isNil(convertedValue)) {
			if (_.isArray(convertedValue)) {
				convertedValue = _.map(convertedValue, (value) => {
					return value?.id;
				});
			} else {
				convertedValue = convertedValue?.id;
			}
		}

		return <WrappedComponent
					{...props}
					value={convertedValue}
					setValue={setValue}
					onChangeSelection={onChangeSelection}
				/>;
	};
}