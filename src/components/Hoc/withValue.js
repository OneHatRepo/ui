import { useState, useEffect, } from 'react';
import isJson from '../../Functions/isJson.js';
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
				valueAsArray = false,
				valueAsStringifiedJson = false,

				// withData
				Repository,
				idIx,
			} = props,
			[localValue, setLocalValue] = useState(startingValue || value),
			setValue = (newValue) => {
				if (valueAsArray && !_.isArray(newValue)) {
					newValue = _.isNil(newValue) ? [] : [newValue];
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

		
		let convertedValue = localValue;
		if (_.isString(localValue) && valueAsStringifiedJson && !_.isNil(localValue)) {
			// localValue is stored as stringified JSON, so convert to normal JS primitives for field components
			convertedValue = JSON.parse(localValue);
		}

		return <WrappedComponent
					{...props}
					value={convertedValue}
					setValue={setValue}
					onChangeSelection={onChangeSelection}
				/>;
	};
}