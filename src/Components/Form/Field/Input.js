import { cloneElement, forwardRef, isValidElement, useState, useEffect, useRef, } from 'react';
import {
	Input, InputField, InputIcon, InputSlot,
} from '@project-components/Gluestack';
import clsx from 'clsx';
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
	let {
			value,
			setValue,
			maxLength,
			autoSubmit = true, // automatically setValue after user stops typing for autoSubmitDelay
			autoSubmitDelay = UiGlobals.autoSubmitDelay,
			disableAutoFlex = false,
			onKeyPress,
			onChangeText,
			leftElement = null,
			leftIcon = null,
			_leftIcon,
			leftIconHandler,
			rightElement = null,
			rightIcon = null,
			_rightIcon,
			rightIconHandler,
			placeholder,
			textAlignIsCenter = false,
			className,
			...propsToPass
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
	let inputClassName = clsx(
			'Input',
			styles.FORM_INPUT_CLASSNAME,
		),
		inputFieldClassName = clsx(
			'InputField',
			'self-stretch',
			'h-auto',
			'w-full',
			'p-2',
			textAlignIsCenter ? 'text-center' : 'text-left',
			styles.FORM_INPUT_CLASSNAME,
			styles.FORM_INPUT_FIELD_CLASSNAME,
		);
	if (className) {
		inputClassName += className;
	}


	if (leftElement) {
		leftElement = <InputSlot className="leftElementInputSlot">{leftElement}</InputSlot>;
	}
	if (leftIcon) {
		if (!_leftIcon) {
			_leftIcon = {};
		}
		if (!_leftIcon.className) {
			_leftIcon.className = '';
		}
		_leftIcon.className = 'leftInputIcon mr-2 ' + _leftIcon.className; // prepend the margin, so it can potentially be overridden
		if (isValidElement(leftIcon)) {
			if (_leftIcon) {
				leftIcon = cloneElement(leftIcon, {..._leftIcon});
			}
		} else {
			leftIcon = <InputIcon as={leftIcon} {..._leftIcon} />;
		}
		if (leftIconHandler) {
			leftIcon = <InputSlot onPress={leftIconHandler} className="LeftInputSlot">
							{leftIcon}
						</InputSlot>;
		}
	}
	if (rightElement) {
		rightElement = <InputSlot className="rightElementInputSlot">{rightElement}</InputSlot>;
	}
	if (rightIcon) {
		if (!_rightIcon) {
			_rightIcon = {};
		}
		if (!_rightIcon.className) {
			_rightIcon.className = '';
		}
		_rightIcon.className = 'rightInputIcon ml-2 ' + _rightIcon.className; // prepend the margin, so it can potentially be overridden
		if (isValidElement(rightIcon)) {
			if (_rightIcon) {
				rightIcon = cloneElement(rightIcon, {..._rightIcon});
			}
		} else {
			rightIcon = <InputIcon as={rightIcon} {..._rightIcon} />;
		}
		if (rightIconHandler) {
			rightIcon = <InputSlot onPress={rightIconHandler} className="RightInputSlot">
							{rightIcon}
						</InputSlot>;
		}
	}
	
	return <Input
				className={inputClassName}
				style={style}
			>
				{leftElement}
				{leftIcon}

				<InputField
					ref={ref}
					onChangeText={onChangeTextLocal}
					onKeyPress={onKeyPressLocal}
					value={localValue}
					className={inputFieldClassName}
					dataFocusVisible={true}
					variant="outline"
					placeholder={placeholder}
					{...propsToPass}
				/>

				{rightElement}
				{rightIcon}
			</Input>;
});

export default withComponent(withValue(withTooltip(InputElement)));