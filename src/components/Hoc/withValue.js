import { useState } from 'react';
import _ from 'lodash';

export default function withValue(WrappedComponent) {
	return (props) => {
		const
			{
				onChangeValue,
				value = null,
				setValue,
				startingValue = null,
				Repository,
				idIx,
			} = props,
			bypass = !!setValue,
			[localValue, setLocalValue] = useState(startingValue),
			setValueDecorator = (newValue) => {
				if (bypass) {
					if (newValue === value) {
						return;
					}
					setValue(newValue);
				} else {
					if (newValue === localValue) {
						return;
					}
					setLocalValue(newValue);
				}
				if (onChangeValue) {
					onChangeValue(newValue);
				}
			},
			onChangeSelection = (selection) => {
				let value = null;
				if (selection.length) {
					if (Repository) {
						if (selection.length === 1) {
							value = selection[0].submitValue;
						} else {
							value = _.map(selection, (entity) => entity.submitValue);
						}
					} else {
						if (selection.length === 1) {
							value = selection[0][idIx];
						} else {
							value = _.map(selection, (item) => item[idIx]);
						}
					}
				}
				setValueDecorator(value);
			};
			
		return <WrappedComponent
					value={bypass ? value : localValue}
					setValue={setValueDecorator}
					onChangeSelection={onChangeSelection}
					{...props}
				/>;
	};
}