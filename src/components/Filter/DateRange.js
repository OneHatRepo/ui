import { useState, useEffect } from 'react';
import {
	Row,
	Text,
} from 'native-base';
import Date from '../Form/Field/Date.js';
import testProps from '../../Functions/testProps.js';
import withTooltip from '../Hoc/withTooltip.js';
import withValue from '../Hoc/withValue.js';
import _ from 'lodash';

const
	DateRange = (props) => {
		const {
				value = {
					low: null,
					high: null,
				},
				setValue,
				mode,
				tooltip = '',

				minValue = 0,
				maxValue,
				...propsToPass
			} = props,
			[low, setLow] = useState(''),
			[high, setHigh] = useState(''),
			[isReady, setIsReady] = useState(false),
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
			if (!isReady) {
				setIsReady(true);
			}

		}, [value]);

		if (!isReady) {
			return null;
		}
		
		return <Row
					justifyContent="center"
					alignItems="center"
					flex={1}
					px={1}
					{...propsToPass}
				>
					<Date
						{...testProps('low')}
						value={low}
						onChangeValue={onChangeLow}
						mode={mode}
						// minValue={minValue}
						// maxValue={maxValue}
						tooltip={(tooltip ? tooltip + ' ' : '') + 'Low'}
					/>
					<Text px={2} userSelect="none">to</Text>
					<Date
						{...testProps('high')}
						value={high}
						onChangeValue={onChangeHigh}
						mode={mode}
						// minValue={minValue}
						// maxValue={maxValue}
						tooltip={(tooltip ? tooltip + ' ' : '') + 'High'}
					/>
				</Row>;
	},
	DateRangeField = withValue(DateRange);

export default DateRangeField;

// Tooltip needs us to forwardRef
// export default withTooltip(React.forwardRef((props, ref) => {
// 	return <DateField {...props} outerRef={ref} />;
// }));