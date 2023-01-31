import { useState, useEffect, } from 'react';
import isJson from '../../Functions/isJson';
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

				// withData
				Repository,
				idIx,
			} = props,
			[localValue, setLocalValue] = useState(startingValue),
			setValue = (newValue) => {
				if (newValue === localValue) {
					return;
				}

				setLocalValue(newValue);
				
				if (onChangeValue) {
					if (_.isArray(newValue)) {
						// convert from inner value to outer value
						newValue = JSON.stringify(newValue);
					}
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
		if (_.isString(localValue) && isJson(localValue) && !_.isNull(localValue)) {
			// convert from outer value to inner value
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