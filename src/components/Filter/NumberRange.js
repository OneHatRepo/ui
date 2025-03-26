import React, { useState, useEffect, } from 'react';
import {
	Row,
	Text,
} from 'native-base';
import Number from '../Form/Field/Number.js';
import withTooltip from '../Hoc/withTooltip.js';
import withValue from '../Hoc/withValue.js';
import testProps from '../../functions/testProps.js';
import _ from 'lodash';

	const
		NumberRange = (props) => {
			const {
					value = {
						low: null,
						high: null,
					},
					setValue,
					tooltip = '',

					minValue = 0,
					maxValue,
					...propsToPass
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

			return <Row
						justifyContent="center"
						alignItems="center"
						flex={1}
						px={1}
						{...propsToPass}
					>
						<Number
							{...testProps('low')}
							value={low}
							onChangeValue={onChangeLow}
							startingValue={null}
							minValue={minValue}
							maxValue={maxValue}
							tooltip={(tooltip ? tooltip + ' ' : '') + 'Low'}
							maxWidth={120}
						/>
						<Text px={2} userSelect="none">to</Text>
						<Number
							{...testProps('high')}
							value={high}
							onChangeValue={onChangeHigh}
							startingValue={null}
							minValue={minValue}
							maxValue={maxValue}
							tooltip={(tooltip ? tooltip + ' ' : '') + 'High'}
							maxWidth={120}
						/>
					</Row>;
		},
		NumberRangeField = withValue(NumberRange);

export default NumberRangeField;

// Tooltip needs us to forwardRef
// export default withTooltip(React.forwardRef((props, ref) => {
// 	return <NumberRangeField {...props} outerRef={ref} />;
// }));