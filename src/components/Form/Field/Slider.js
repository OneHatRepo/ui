import React from 'react';
import {
	Icon,
	Pressable,
	Row,
	Slider,
	Text,
} from 'native-base';
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
			styles = UiGlobals.styles,
			onSlide = (value, e) => {
				setValue(value);
			},
			onSlideEnd = (value, e) => {
				setValue(value);
			};

		const sizeProps = {};
		if (!props.flex && !props.w) {
			sizeProps.flex = 1;
		}

		return <Row alignItems="center">
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
					>{value}</Text>
					<Slider
						ref={props.outerRef}
						w="100%"
						maxW="300"
						defaultValue={value}
						minValue={minValue}
						maxValue={maxValue}
						step={step}
						colorScheme={styles.SLIDER_COLOR_SCHEME}
						onChange={onSlide}
						onChangeEnd={onSlideEnd}
						{...propsToPass}
					>
						<Slider.Track>
							<Slider.FilledTrack />
						</Slider.Track>
						<Slider.Thumb />
					</Slider>
				</Row>;
	},
	SliderField = withComponent(withValue(SliderElement));

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <SliderField {...props} outerRef={ref} />;
}));