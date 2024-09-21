import React, { useState, useEffect, useRef, } from 'react';
import {
	TextArea,
} from 'native-base';
import UiGlobals from '../../../UiGlobals.js';
import withComponent from '../../Hoc/withComponent.js';
import withTooltip from '../../Hoc/withTooltip.js';
import withValue from '../../Hoc/withValue.js';
import _ from 'lodash';

const
	TextAreaElement = (props) => {
		let { // so localValue can be changed, if needed
				setValue,
				autoSubmit = true, // automatically setValue after user stops typing for autoSubmitDelay
				autoSubmitDelay = UiGlobals.autoSubmitDelay,
				onChangeText,
			} = props,
			value = _.isNil(props.value) ? '' : props.value, // null value may not actually reset this TextArea, so set it explicitly to empty string
			styles = UiGlobals.styles,
			debouncedSetValueRef = useRef(),
			[localValue, setLocalValue] = useState(value),
			isTypingRef = useRef(),
			isTypingTimeoutRef = useRef(),
			isTyping = () => {
				return isTypingRef.current;
			},
			setIsTyping = (isTyping) => {
				isTypingRef.current = isTyping;
				if (isTyping) {
					startIsTypingTimeout();
				}
			},
			startIsTypingTimeout = () => {
				clearIsTypingTimeout();
				isTypingTimeoutRef.current = setTimeout(() => {
					setIsTyping(false);
				}, autoSubmitDelay + 1000);
			},
			clearIsTypingTimeout = () => {
				if (isTypingTimeoutRef.current) {
					clearTimeout(isTypingTimeoutRef.current);
				}
			},
			onChangeTextLocal = (value) => {
				setIsTyping(true);
				if (value === '') {
					value = null; // empty string makes value null
				}
				setLocalValue(value);
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
			debouncedSetValueRef.current?.cancel(); // Cancel any previous debounced fn
			debouncedSetValueRef.current = _.debounce(setValue, autoSubmitDelay);
		}, [setValue]);

		useEffect(() => {

			if (!isTyping() && value !== localValue) {
				// Make local value conform to externally changed value
				setLocalValue(value);
			}
	
		}, [value]);

		if (localValue === null || typeof localValue === 'undefined') {
			localValue = ''; // If the value is null or undefined, don't let this be an uncontrolled input
		}

		return <TextArea
					ref={props.outerRef}
					onChangeText={onChangeTextLocal}
					flex={1}
					bg={styles.FORM_TEXTAREA_BG}
					_focus={{
						bg: styles.FORM_TEXTAREA_BG,
					}}
					fontSize={styles.FORM_TEXTAREA_FONTSIZE}
					h={styles.FORM_TEXTAREA_HEIGHT}
					{...props}
					value={localValue}
				/>;
	},
	TextAreaField = withComponent(withValue(TextAreaElement));

// withTooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <TextAreaField {...props} outerRef={ref} />;
}));