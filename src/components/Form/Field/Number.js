
import React, { useState, useEffect, useRef, } from 'react';
import {
	Icon,
	Input,
	Row,
} from 'native-base';
import {
	AUTO_SUBMIT_DELAY,
} from '../../../Constants/Input.js';
import UiGlobals from '../../../UiGlobals.js';
import IconButton from '../../Buttons/IconButton.js';
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
		tooltip = null,
	} = props,
	styles = UiGlobals.styles,
	debouncedSetValueRef = useRef(),
	[localValue, setLocalValue] = useState(value),
	onInputKeyPress = (e) => {
		switch(e.key) {
			case 'ArrowDown':
			case 'ArrowLeft':
				onDecrement();
				break;
			case 'ArrowUp':
			case 'ArrowRight':
				onIncrement();
				break;
			case 'Tab':
			case 'Backspace':
				return;
				break;
			case 'Enter':
				setValue(value);
				break;
				default:
		}
		if (!e.key.match(/^[\-\d\.]*$/)) {
			e.preventDefault(); // kill anything that's not a number
		}
	},
	onChangeText = (value) => {
		if (value === '') {
			value = null; // empty string makes value null
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
		debouncedSetValueRef.current = _.debounce(setValue, AUTO_SUBMIT_DELAY);
	}, [setValue]);
	
	useEffect(() => {

		// Make local value conform to externally changed value
		setLocalValue(value);

	}, [value]);

	if (localValue === null || typeof localValue === 'undefined') {
		localValue = ''; // If the value is null or undefined, don't let this be an uncontrolled input
	}

	const
		isIncrementDisabled = typeof maxValue !== 'undefined' && value === maxValue,
		isDecrementDisabled = typeof minValue !== 'undefined' && (value === minValue || (!value && minValue === 0));

	return <Row flex={1} h="100%" p={0} borderWidth={1} borderColor="trueGray.400" borderRadius={6}>
				<IconButton
					icon={<Icon as={Minus} color={isDecrementDisabled ? 'disabled' : 'trueGray.500'} />}
					onPress={onDecrement}
					isDisabled={isDecrementDisabled}
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
					value={localValue}
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
					{...props._input}
				/>
				<IconButton
					icon={<Icon as={Plus} color={isIncrementDisabled ? 'disabled' : 'trueGray.500'} />}
					onPress={onIncrement}
					isDisabled={isIncrementDisabled}
					h="100%"
					flex={1}
					maxWidth={10}
					_hover={{
						bg: isIncrementDisabled ? null : 'trueGray.400',
					}}
					borderLeftRadius={0}
					zIndex={10}
				/>
			</Row>;
}

export default withValue(NumberElement);
