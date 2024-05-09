
import React, { useState, useEffect, useRef, } from 'react';
import {
	Icon,
	Input,
	HStack,
} from '@gluestack-ui/themed';
import UiGlobals from '../../../UiGlobals.js';
import IconButton from '../../Buttons/IconButton.js';
import withComponent from '../../Hoc/withComponent.js';
import withTooltip from '../../Hoc/withTooltip.js';
import withValue from '../../Hoc/withValue.js';
import Plus from '../../Icons/Plus.js';
import Minus from '../../Icons/Minus.js';
import _ from 'lodash';

const InputWithTooltip = withTooltip(Input);

function NumberElement(props) {
	let {
		value,
		setValue,
		minValue,
		maxValue,
		autoSubmitDelay = UiGlobals.autoSubmitDelay,
		tooltip = null,
		isDisabled = false,
	} = props,
	styles = UiGlobals.styles,
	debouncedSetValueRef = useRef(),
	[localValue, setLocalValue] = useState(value),
	onInputKeyPress = (e) => {
		const key = e.nativeEvent.key; // e.key works on web, but not mobile; so use e.nativeEvent.key which works on both
		switch(key) {
			case 'ArrowDown':
				onDecrement();
				break;
			case 'ArrowUp':
				onIncrement();
				break;
			case 'Enter':
				setValue(value);
				break;
			case 'ArrowLeft':
			case 'ArrowRight':
			case 'Tab':
			case 'Backspace':
				return;
			default:
		}
		if (!key.match(/^[\-\d\.]*$/)) {
			e.preventDefault(); // kill anything that's not a number
		}
	},
	onChangeText = (value) => {

		if (value === '') {
			value = null; // empty string makes value null
		} else if (value.match(/\.$/)) { // value ends with a decimal point
			// don't parseFloat, otherwise we'll lose the decimal point
		} else if (value.match(/0$/)) { // value ends with a zero
			// don't parseFloat, otherwise we'll lose the ability to do things like 1.03
		} else {
			value = parseFloat(value, 10);
		}
		setLocalValue(value);
		debouncedSetValueRef.current(value);
	},
	onDecrement = () => {
		let localValue = value;
		if (minValue && localValue === minValue) {
			return;
		}
		if (!localValue) {
			localValue = 0;
		}
		localValue = parseFloat(localValue, 10) -1;
		setValue(localValue);
	},
	onIncrement = () => {
		let localValue = value;
		if (maxValue && localValue === maxValue) {
			return;
		}
		if (!localValue) {
			localValue = 0;
		}
		localValue = parseFloat(localValue, 10) +1;
		setValue(localValue);
	};
		
	useEffect(() => {
		// Set up debounce fn
		// Have to do this because otherwise, lodash tries to create a debounced version of the fn from only this render
		debouncedSetValueRef.current = _.debounce(setValue, autoSubmitDelay);
	}, [setValue]);
	
	useEffect(() => {

		// Make local value conform to externally changed value
		if (value !== localValue) {
			setLocalValue(value);
		}

	}, [value]);

	if (localValue === null || typeof localValue === 'undefined') {
		localValue = ''; // If the value is null or undefined, don't let this be an uncontrolled input
	}

	// convert localValue to string if necessary, because numbers work on web but not mobile; while strings work in both places
	let inputValue = localValue;
	if (_.isNumber(inputValue)) {
		inputValue = '' + inputValue;
	}

	const
		isIncrementDisabled = typeof maxValue !== 'undefined' && value === maxValue,
		isDecrementDisabled = typeof minValue !== 'undefined' && (value === minValue || (!value && minValue === 0));

	return <HStack flex={1} h="100%" p={0} borderWidth={1} borderColor="trueGray.400" borderRadius={6} {...props}>
				<IconButton
					icon={<Icon as={Minus} color={(isDecrementDisabled || isDisabled) ? 'disabled' : 'trueGray.500'} />}
					onPress={onDecrement}
					isDisabled={isDecrementDisabled || isDisabled}
					h="100%"
					flex={1}
					maxWidth={10}
					_hover={{
						bg: isDecrementDisabled ? null : 'trueGray.400',
					}}
					borderRightRadius={0}
					zIndex={10}
				/>
				<InputWithTooltip
					value={inputValue}
					onChangeText={onChangeText}
					onKeyPress={onInputKeyPress}
					flex={5}
					h="100%"
					fontSize={styles.FORM_INPUT_FONTSIZE}
					bg={styles.FORM_INPUT_BG}
					_focus={{
						bg: styles.FORM_INPUT_FOCUS_BG,
					}}
					textAlign="center"
					borderRadius={0}
					tooltip={tooltip}
					isDisabled={isDisabled}
					{...props._input}
				/>
				<IconButton
					icon={<Icon as={Plus} color={(isIncrementDisabled || isDisabled) ? 'disabled' : 'trueGray.500'} />}
					onPress={onIncrement}
					isDisabled={isIncrementDisabled || isDisabled}
					h="100%"
					flex={1}
					maxWidth={10}
					_hover={{
						bg: isIncrementDisabled ? null : 'trueGray.400',
					}}
					borderLeftRadius={0}
					zIndex={10}
				/>
			</HStack>;
}

export default withComponent(withValue(NumberElement));
