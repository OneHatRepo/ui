import React, { useState, } from 'react';
import {
	Box,
	Button,
	Icon,
	Popover,
	Pressable,
	Row,
	Text,
} from 'native-base';
import {
	STYLE_COLOR_READOUT_FONTSIZE,
} from '../../../constants/Style';
import { SketchPicker } from 'react-color'
import withTooltip from '../../Hoc/withTooltip';
import withValue from '../../Hoc/withValue';
import emptyFn from '../../../functions/emptyFn';
import _ from 'lodash';

export function ColorElement(props) {
	const {
			value = '#000',
			setValue,
		} = props,
		[isPickerShown, setIsPickerShown] = useState(false),
		[top, setTop] = useState(0),
		[left, setLeft] = useState(0),
		showPicker = () => {
			setIsPickerShown(true);
		},
		hidePicker = () => {
			setIsPickerShown(false);
		};
	
	// Web version
	return <Row flex={1} h="100%" alignItems="center">
				<Pressable
					onPress={showPicker}
					h={10}
					w={10}
					bg={value}
					borderRadius={4}
					onLayout={(e) => {
						const {
								height,
								width,
								top,
								left,
							} = e.nativeEvent.layout;

						// TODO: Set the popover to display with lots of room to spare.
						// To do this, figure out where the IconButton is on the screen.
						// If it's on the right side of screen, show the popover on the left.
						// If it's on the bottom part of screen, show the popover on the top.
						// Otherwise, use code below.

						setTop(top + height);
						setLeft(left + width);
					}}
				/>
				<Pressable
					flex={1}
					h="100%"
					onPress={showPicker}
				>
					<Text
						flex={1}
						h="100%"
						ml={1}
						p={2}
						fontSize={STYLE_COLOR_READOUT_FONTSIZE}
						borderWidth={1}
						borderColor="trueGray.300"
						borderRadius={4}
					>{value}</Text>
				</Pressable>
				<Popover
					isOpen={isPickerShown}
					onClose={() => {
						hidePicker();
					}}
					trigger={emptyFn}
					trapFocus={true}
					placement={'auto'}
					{...props}
				>
					<Popover.Content
						position="absolute"
						top={top + 'px'}
						left={left + 'px'}
						w={220}
						h={300}
					>
						<Popover.Body
							p={0}
						>
							<SketchPicker
								disableAlpha={true}
								color={value}
								onChange={(color) => setValue(color.hex)}
								{...props}
							/>
						</Popover.Body>
					</Popover.Content>
				</Popover>
			</Row>;

	// React Native v1
	
	
	// React Native v2
	
};

const DateField = withValue(ColorElement);

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <DateField {...props} tooltipRef={ref} />;
}));