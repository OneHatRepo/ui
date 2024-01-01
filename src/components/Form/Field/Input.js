import React, { useState, useEffect, useRef, } from 'react';
import {
	Input,
	Tooltip,
} from '@gluestack-ui/themed';
import {
	AUTO_SUBMIT_DELAY,
} from '../../../Constants/Input.js';
import UiGlobals from '../../../UiGlobals.js';
import withComponent from '../../Hoc/withComponent.js';
import withValue from '../../Hoc/withValue.js';
import _ from 'lodash';

function InputElement(props) {
	let {
			value,
			setValue,
			autoSubmit = true, // automatically setValue after user stops typing for autoSubmitDelay
			autoSubmitDelay = AUTO_SUBMIT_DELAY,
			autoCapitalize = 'none',
			maxLength,
			onKeyPress,
			onChangeText,
			tooltip = null,
			tooltipPlacement = 'bottom',
		} = props,
		styles = UiGlobals.styles,
		debouncedSetValueRef = useRef(),
		[localValue, setLocalValue] = useState(value),
		onKeyPressLocal = (e) => {
			if (e.key === 'Enter') {
				setValue(localValue);
			}
			if (onKeyPress) {
				onKeyPress(e, localValue);
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

	const sizeProps = {};
	if (!props.flex && !props.w) {
		sizeProps.flex = 1;
	}
	
	let component = <Input
						ref={props.outerRef}
						onChangeText={onChangeTextLocal}
						_input={{
							onKeyPress: onKeyPressLocal,
						}}
						fontSize={styles.FORM_INPUT_FONTSIZE}
						bg={styles.FORM_INPUT_BG}
						_focus={{
							bg: styles.FORM_INPUT_FOCUS_BG,
						}}
						autoCapitalize={autoCapitalize}
						{...sizeProps}
						{...props}
						value={localValue}
					/>;
	if (tooltip) {
		component = <Tooltip label={tooltip} placement={tooltipPlacement}>
						{component}
					</Tooltip>;
	}
	return component;
}

const
	InputField = withComponent(withValue(InputElement)),
	InputForwardRef = React.forwardRef((props, ref) => {
		return <InputField {...props} outerRef={ref} component="Input" />;
	});

export default InputForwardRef;