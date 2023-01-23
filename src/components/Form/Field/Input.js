import React, { useState, useEffect, useRef, } from 'react';
import {
	Input,
	Tooltip,
} from 'native-base';
import {
	AUTO_SUBMIT_DELAY,
} from '../../../Constants/Input';
import styles from '../../../Constants/Styles';
import withValue from '../../Hoc/withValue';
import _ from 'lodash';

function InputElement(props) {
	let {
			value,
			setValue,
			autoSubmit = false, // automatically setValue after user stops typing for autoSubmitDelay
			autoSubmitDelay = AUTO_SUBMIT_DELAY,
			maxLength,
			onKeyPress,
			onChangeText,
			tooltip = null,
			tooltipPlacement = 'bottom',
		} = props,
		debouncedSetValueRef = useRef(),
		[localValue, setLocalValue] = useState(value),
		onKeyPressLocal = (e) => {
			if (e.key === 'Enter') {
				setValue(localValue);
			}
			if (onKeyPress) {
				onKeyPress(e);
			}
		},
		onChangeTextLocal = (value) => {
			if (value === '') {
				value = null; // empty string makes value null
				setLocalValue(value);
			} else if (!maxLength || maxLength >= value?.length ) {
				setLocalValue(value);
			}
			if (autoSubmit) {
				debouncedSetValueRef.current(value);
			}
			if (onChangeText) {
				onChangeText(value);
			}
		};
		
	useEffect(() => {
		// Set up debounce fn
		// Have to do this because otherwise, lodash tries to create a debounced version of the fn from only this render
		debouncedSetValueRef.current = _.debounce(setValue, autoSubmitDelay);
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
						onChangeText={onChangeTextLocal}
						_input={{
							onKeyPress: onKeyPressLocal,
						}}
						flex={1}
						fontSize={styles.FORM_INPUT_FONTSIZE}
						bg={styles.FORM_INPUT_BG}
						_focus={{
							bg: styles.FORM_INPUT_FOCUS_BG,
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