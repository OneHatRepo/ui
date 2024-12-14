
import React, { useState, useEffect, useRef, } from 'react';
import {
	HStack,
} from '@project-components/Gluestack';
import Decimal from 'decimal.js';
import UiGlobals from '../../../UiGlobals.js';
import IconButton from '../../Buttons/IconButton.js';
import Input from './Input.js';
import testProps from '../../../Functions/testProps.js';
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
			testID,
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
					debouncedSetValueRef.current?.cancel();
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
			if (!_.isNil(value)) {
				if (value === '') {
					value = null; // empty string makes value null
				} else if (value.match(/\.$/)) { // value ends with a decimal point
					// don't parseFloat, otherwise we'll lose the decimal point
				} else if (value.match(/0$/)) { // value ends with a zero
					// don't parseFloat, otherwise we'll lose the ability to do things like 1.03
				} else {
					value = parseFloat(value, 10);
				}
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
			localValue = new Decimal(localValue).minus(1).toNumber();
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
			localValue = new Decimal(localValue).plus(1).toNumber();
			setValue(localValue);
		};
	
	useEffect(() => {
		// Set up debounce fn
		// Have to do this because otherwise, lodash tries to create a debounced version of the fn from only this render
		debouncedSetValueRef.current?.cancel(); // Cancel any previous debounced fn
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

	let className = `
		Number
		flex
		h-full
		items-center
		max-h-[40px]
		p-0
		border
		border-grey-400
		rounded-[6px]
	`;
	if (props.className) {
		className += ' ' + props.className;
	}

	return <HStack
				className={className}
			>
				<IconButton
					{...testProps('decrementBtn')}
					icon={Minus}
					_icon={{
						className: 'text-grey-500',
					}}
					onPress={onDecrement}
					isDisabled={isDecrementDisabled || isDisabled}
					className={`
						decrementBtn
						h-full
						rounded-r-none
					`}
					style={{
						width: 40,
					}}
				/>
				<InputWithTooltip
					testID={testID}
					value={inputValue}
					onChangeText={onChangeText}
					onKeyPress={onInputKeyPress}
					isDisabled={isDisabled}
					tooltip={tooltip}
					className={`
						InputWithTooltip
						h-full
						text-center
						rounded-none
					`}
					style={{
						flex: 3
					}}
					{...props._input}
				/>
				<IconButton
					{...testProps('incrementBtn')}
					icon={Plus}
					_icon={{
						className: 'text-grey-500',
					}}
					onPress={onIncrement}
					isDisabled={isIncrementDisabled || isDisabled}
					className={`
						incrementBtn
						h-full
						rounded-l-none
					`}
					style={{
						width: 40,
					}}
				/>
			</HStack>;
}

export default withComponent(withValue(NumberElement));
