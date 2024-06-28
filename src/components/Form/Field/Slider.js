import React, { useState, useEffect, useRef, } from 'react';
import {
	Row,
	Text,
} from 'native-base';
import Input from './Input.js';
import Slider from '@react-native-community/slider'; // https://www.npmjs.com/package/@react-native-community/slider
import UiGlobals from '../../../UiGlobals.js';
import testProps from '../../../Functions/testProps.js';
import withComponent from '../../Hoc/withComponent.js';
import withTooltip from '../../Hoc/withTooltip.js';
import withValue from '../../Hoc/withValue.js';
import _ from 'lodash';

const FAKE_ZERO = 0.0000000001; // Slider doesn't like zero

const InputWithTooltip = withTooltip(Input);

const
	SliderElement = (props) => {
		let {
				value = 0,
				setValue,
				minValue = 0,
				maxValue = 100,
				step = 10,
				autoSubmitDelay = UiGlobals.autoSubmitDelay,
				tooltip = null,
				isDisabled = false,
				testID,
				...propsToPass
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
				if (value === '') {
					value = 0; // empty string makes value null
				} else if (value.match(/\.$/)) { // value ends with a decimal point
					// don't parseFloat, otherwise we'll lose the decimal point
				} else if (value.match(/0$/)) { // value ends with a zero
					// don't parseFloat, otherwise we'll lose the ability to do things like 1.03
				} else {
					value = parseFloat(value, 10);
				}
				if (value < minValue) {
					value = minValue;
				} else if (value > maxValue) {
					value = maxValue;
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
				localValue = parseFloat(localValue, 10) - step;
				if (minValue > localValue) {
					localValue = minValue;
				}
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
				localValue = parseFloat(localValue, 10) + step;
				if (maxValue < localValue) {
					localValue = maxValue;
				}
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

		let sliderValue = value;

		if (localValue === null || typeof localValue === 'undefined') {
			localValue = ''; // If the value is null or undefined, don't let this be an uncontrolled input
		}

		if (sliderValue === null || typeof sliderValue === 'undefined') {
			sliderValue = 0; // If the value is null or undefined, force slider to use zero
		}

		// convert localValue to string if necessary, because numbers work on web but not mobile; while strings work in both places
		let inputValue = localValue;
		if (_.isNumber(inputValue)) {
			inputValue = '' + inputValue;
		}

		const sizeProps = {};
		if (!props.flex && !props.w) {
			sizeProps.flex = 1;
		}

		if (sliderValue === 0) {
			sliderValue = FAKE_ZERO; // Slider doesn't like zero
		}

		return <Row
					w="100%"
					alignItems="center"
					{...propsToPass}
				>
					<InputWithTooltip
						{...testProps('readout')}
						value={inputValue}
						onChangeText={onChangeText}
						onKeyPress={onInputKeyPress}
						h="100%"
						w="50px"
						p={2}
						mr={4}
						bg={styles.FORM_INPUT_BG}
						_focus={{
							bg: styles.FORM_INPUT_FOCUS_BG,
						}}
						fontSize={styles.SLIDER_READOUT_FONTSIZE}
						textAlign="center"
						borderRadius="md"
						borderWidth={1}
						borderColor="#bbb"
						isDisabled={isDisabled}
						{...props._input}
					/>
					<Row flex={1}>
						<Slider
							{...testProps('slider')}
							ref={props.outerRef}

							style={{
								width: '100%', 
								height: 40,
							}}
							minimumTrackTintColor={styles.SLIDER_MIN_TRACK_COLOR}
							maximumTrackTintColor={styles.SLIDER_MAX_TRACK_COLOR}
							thumbTintColor={styles.SLIDER_THUMB_COLOR}
							minimumValue={minValue}
							maximumValue={maxValue}
							step={step}
							value={sliderValue}
							onValueChange={(value) => {
								// This sets the localValue, only for display purposes
								setLocalValue(value);
							}}
							onSlidingComplete={(value) => {
								// This sets the actual value
								if (value === FAKE_ZERO) {
									value = 0;
								}
								setValue(value);
							}}
						/>
					</Row>
				</Row>;
	},
	SliderField = withComponent(withValue(SliderElement));

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <SliderField {...props} outerRef={ref} />;
}));