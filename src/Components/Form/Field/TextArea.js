import { forwardRef, useState, useEffect, useRef, } from 'react';
import {
	Textarea, TextareaInput,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import UiGlobals from '../../../UiGlobals.js';
import withComponent from '../../Hoc/withComponent.js';
import withTooltip from '../../Hoc/withTooltip.js';
import withValue from '../../Hoc/withValue.js';
import _ from 'lodash';

const TextAreaElement = forwardRef((props, ref) => {
	let { // so localValue can be changed, if needed
			setValue,
			autoSubmit = true, // automatically setValue after user stops typing for autoSubmitDelay
			autoSubmitDelay = UiGlobals.autoSubmitDelay,
			onChangeText,
			placeholder,
			minimizeForRow = false,
			testID,
			className,
			...propsToPass
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
	let textareaClassName = clsx(
			'Textarea',
		),
		inputClassName = clsx(
			'TextAreaInput',
			'flex-1',
			styles.FORM_TEXTAREA_CLASSNAME,
		);
	if (className) {
		textareaClassName += ' ' + className;
	}
	if (minimizeForRow) {
		textareaClassName += ' h-auto min-h-0 max-h-[40px] overflow-auto';
		inputClassName += ' py-0';
	}

	return <Textarea className={textareaClassName}>
				<TextareaInput
					{...propsToPass}
					testID={testID}
					ref={ref}
					onChangeText={onChangeTextLocal}
					value={localValue}
					className={inputClassName}
					placeholder={placeholder}
				/>
			</Textarea>;
});

export default withComponent(withValue(withTooltip(TextAreaElement)));
