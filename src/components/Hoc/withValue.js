import { useState } from 'react';
import _ from 'lodash';

export default function withValue(WrappedComponent) {
	return (props) => {
		const
			{
				onChangeValue,
				Repository,
				idIx,
			} = props,
			[value, setValue] = useState(null),
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
			},
			setValueDecorator = (newValue) => {
				if (newValue === value) {
					return;
				}
				setValue(newValue);
				if (onChangeValue) {
					onChangeValue(newValue);
				}
			};
		return <WrappedComponent
					value={value}
					setValue={setValueDecorator}
					onChangeSelection={onChangeSelection}
					{...props}
				/>;
	};
}