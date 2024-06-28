import React, { useState, useEffect, useRef, } from 'react';
import {
	Row,
	Text,
} from 'native-base';
import Slider from '@react-native-community/slider'; // https://www.npmjs.com/package/@react-native-community/slider
import UiGlobals from '../../../UiGlobals.js';
import testProps from '../../../Functions/testProps.js';
import withComponent from '../../Hoc/withComponent.js';
import withTooltip from '../../Hoc/withTooltip.js';
import withValue from '../../Hoc/withValue.js';
import _ from 'lodash';

const
	SliderElement = (props) => {
		const {
				value = 0,
				setValue,
				minValue = 0,
				maxValue = 100,
				step = 10,
				...propsToPass
			} = props,
			[localValue, setLocalValue] = useState(value),
			styles = UiGlobals.styles;

		useEffect(() => {

			// When value changes from outside, adjust text value
			if (value !== localValue) {
				setLocalValue(value);
			}
	
		}, [value]);

		const sizeProps = {};
		if (!props.flex && !props.w) {
			sizeProps.flex = 1;
		}

		return <Row alignItems="center" w="100%" {...propsToPass}>
					<Text
						{...testProps('readout')}
						h={10}
						w="50px"
						p={2}
						mr={4}
						bg="#fff"
						fontSize={styles.SLIDER_READOUT_FONTSIZE}
						textAlign="center"
						borderWidth={1}
						borderColor="#bbb"
						borderRadius="md"
					>{localValue}</Text>
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
							value={value}
							onValueChange={(value) => setLocalValue(value)}
							onSlidingComplete={(value) => {
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