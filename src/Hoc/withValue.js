import { useState } from 'react';
import emptyFn from '../Functions/emptyFn';

export default function withValue(WrappedComponent) {
	return (props) => {
		const
			{
				onChangeValue = emptyFn,
			} = props,
			[value, setValueRaw] = useState(),
			setValue = (value) => {
				setValueRaw(value);
				onChangeValue(value);
			};
		return <WrappedComponent
					value={value}
					setValue={setValue}
					{...props}
				/>;
	};
}