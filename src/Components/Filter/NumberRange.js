import React, { useState, useEffect, } from 'react';
import {
	HStack,
	Text,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import Number from '../Form/Field/Number.js';
import withTooltip from '../Hoc/withTooltip.js';
import withValue from '../Hoc/withValue.js';
import testProps from '../../Functions/testProps.js';
import _ from 'lodash';

const
	NumberRange = (props) => {
		const {
				value = {
					low: null,
					high: null,
				},
				setValue,
				tooltip,
				tooltipPlacement,

				minValue = 0,
				maxValue,
			} = props,
			[low, setLow] = useState(''),
			[high, setHigh] = useState(''),
			onChangeLow = (value) => {
				setLow(value);
				const newValue = {
					low: value,
					high,
				};
				setValue(newValue);
			},
			onChangeHigh = (value) => {
				setHigh(value);
				const newValue = {
					low,
					high: value,
				};
				setValue(newValue);
			};
		
		useEffect(() => {

			// Initialize format of value - needs to be JSON object with combination of two values
			if (value === null || typeof value === 'undefined') {
				setValue({
					low: null,
					high: null,
				});
				return () => {};
			}

			// Make local value conform to externally changed value
			if (value.low !== low) {
				setLow(value.low);
			}
			if (value.high !== high) {
				setHigh(value.high);
			}

		}, [value]);

		let className = clsx(
			'flex-1',
			'justify-center',
			'items-center',
			'px-1',
			'py-[2px]',
		);
		if (props.className) {
			className += ' ' + props.className;
		}
		
		return <HStack className={className} style={props.style}>
					<Number
						{...testProps('low')}
						value={low}
						onChangeValue={onChangeLow}
						startingValue={null}
						minValue={minValue}
						maxValue={maxValue}
						tooltip={(tooltip ? tooltip + ' ' : '') + 'Low'}
						tooltipPlacement={tooltipPlacement}
						className="max-w-[150px]"
					/>
					<Text className="px-2 select-none">to</Text>
					<Number
						{...testProps('high')}
						value={high}
						onChangeValue={onChangeHigh}
						startingValue={null}
						minValue={minValue}
						maxValue={maxValue}
						tooltip={(tooltip ? tooltip + ' ' : '') + 'High'}
						tooltipPlacement={tooltipPlacement}
						className="max-w-[150px]"
					/>
				</HStack>;
	},
	NumberRangeField = withValue(NumberRange);

export default NumberRangeField;

// Tooltip needs us to forwardRef
// export default withTooltip(React.forwardRef((props, ref) => {
// 	return <NumberRangeField {...props} outerRef={ref} />;
// }));