import { forwardRef, useState, useEffect, useRef, } from 'react';
import {
	Input, InputField, InputIcon, InputSlot,
	Pressable,
} from '@project-components/Gluestack';
import {
	hasWidth,
	hasFlex,
} from '../../../Functions/tailwindFunctions.js';
import UiGlobals from '../../../UiGlobals.js';
import withComponent from '../../Hoc/withComponent.js';
import withTooltip from '../../Hoc/withTooltip.js';
import withValue from '../../Hoc/withValue.js';
import _ from 'lodash';

const InputElement = forwardRef((props, ref) => {
	let { // so localValue can be changed, if needed
			testID,
			value,
			setValue,
			autoSubmit = true, // automatically setValue after user stops typing for autoSubmitDelay
			autoSubmitDelay = UiGlobals.autoSubmitDelay,
			disableAutoFlex = false,
			maxLength,
			onKeyPress,
			onChangeText,
			leftElement,
			leftIcon,
			leftIconHandler,
			rightElement,
			rightIcon,
			rightIconHandler,
			placeholder,
		} = props,
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
		onKeyPressLocal = (e) => {
			if (e.key === 'Enter') {
				debouncedSetValueRef.current?.cancel();
				setValue(localValue);
			}
			if (onKeyPress) {
				onKeyPress(e, localValue);
			}
		},
		onChangeTextLocal = (value) => {
			setIsTyping(true);
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

	const style = props.style || {};
	// auto-set width to flex if it's not already set another way
	if (!disableAutoFlex && !hasWidth(props) && !hasFlex(props)) {
		style.flex = 1;
	}
	let inputClassName = `
			Input
			flex-1
			block
			h-auto
			${styles.FORM_INPUT_BG}
			${styles.FORM_INPUT_BG_FOCUS}
			${styles.FORM_INPUT_BG_HOVER}
		`,
		inputFieldClassName = `
			InputField
			min-h-[40px]
			w-full
			p-2
			text-left
			${styles.FORM_INPUT_FONTSIZE}
			${styles.FORM_INPUT_BG}
			${styles.FORM_INPUT_BG_FOCUS}
			${styles.FORM_INPUT_BG_HOVER}
		`;
	if (props.className) {
		inputClassName += props.className;
		inputFieldClassName += props.className;
	}
	
	return <Input
				className={inputClassName}
				style={style}
			>
				{leftElement &&
					<InputSlot>{leftElement}</InputSlot>}
				
				{leftIcon && leftIconHandler && 
					<Pressable onPress={leftIconHandler}>
						<InputIcon className="ml-2">
							{leftIcon}
						</InputIcon>
					</Pressable>}
				{leftIcon && !leftIconHandler && 
					<InputIcon className="ml-2">
						{leftIcon}
					</InputIcon>}

				<InputField
					ref={ref}
					onChangeText={onChangeTextLocal}
					onKeyPress={onKeyPressLocal}
					value={localValue}
					className={inputFieldClassName}
					dataFocusVisible={true}
					variant="outline"
					placeholder={placeholder}
				/>

				{rightElement &&
					<InputSlot>{rightElement}</InputSlot>}

				{rightIcon && rightIconHandler && 
					<Pressable onPress={rightIconHandler}>
						<InputIcon className="mr-2">
							{rightIcon}
						</InputIcon>
					</Pressable>}
				{rightIcon && !rightIconHandler && 
					<InputIcon className="mr-2">
						{rightIcon}
					</InputIcon>}
			</Input>;
});

export default withComponent(withValue(withTooltip(InputElement)));