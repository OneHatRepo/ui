import React, { useState, useEffect, useRef, } from 'react';
import {
	Input,
	Tooltip,
} from 'native-base';
import {
	DEBOUNCE_MS,
} from '../../../Constants/Input';
import styles from '../../../Constants/Styles';
import withValue from '../../Hoc/withValue';
import _ from 'lodash';

function InputElement(props) {
	let {
			value,
			setValue,
			tooltip = null,
			tooltipPlacement = 'bottom',
		} = props,
		debouncedSetValueRef = useRef(),
		[localValue, setLocalValue] = useState(value),
		onChangeText = (value) => {
			if (value === '') {
				value = null; // empty string makes value null
			}
			setLocalValue(value);
			debouncedSetValueRef.current(value);
		};
		
	useEffect(() => {
		// Set up debounce fn
		// Have to do this because otherwise, lodash tries to create a debounced version of the fn from only this render
		debouncedSetValueRef.current = _.debounce(setValue, DEBOUNCE_MS);
	}, [setValue]);
		
	useEffect(() => {

		// Make local value conform to externally changed value
		setLocalValue(value);

	}, [value]);

	if (localValue === null || typeof localValue === 'undefined') {
		localValue = ''; // If the value is null or undefined, don't let this be an uncontrolled input
	}

	const theInput = <Input
						ref={props.outerRef}
						onChangeText={onChangeText}
						flex={1}
						fontSize={styles.INPUT_FONTSIZE}
						bg={styles.INPUT_BG}
						_focus={{
							bg: styles.INPUT_FOCUS_BG,
						}}
						{...props}
						value={localValue}
					/>;
	if (!tooltip) {
		return theInput;
	}
	return <Tooltip label={tooltip} placement={tooltipPlacement}>
				{theInput}
			</Tooltip>;
}

const
	InputField = withValue(InputElement),
	InputForwardRef = React.forwardRef((props, ref) => {
		return <InputField {...props} outerRef={ref} />;
	});

export default InputForwardRef;