import React, { useState, } from 'react';
import {
	Popover,
	Pressable,
	Row,
	Text,
	Tooltip,
} from 'native-base';
import styles from '../../../Constants/Styles';
import { SketchPicker } from 'react-color'
import withValue from '../../Hoc/withValue';
import emptyFn from '../../../Functions/emptyFn';
import _ from 'lodash';

export function ColorElement(props) {
	const {
			value = '#000',
			setValue,
			tooltip = 'Choose a color.',
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
	return <Tooltip label={tooltip} placement="bottom">
				<Row flex={1} h="100%" alignItems="center">
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
							fontSize={styles.COLOR_READOUT_FONTSIZE}
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
				</Row>
			</Tooltip>;

	// React Native v1
	
	
	// React Native v2
	
}

export default withValue(ColorElement);
