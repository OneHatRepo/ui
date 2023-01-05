import React, { useState, } from 'react';
import {
	Box,
	Button,
	Icon,
	Popover,
	Pressable,
	Row,
	Text,
	Tooltip,
} from 'native-base';
import {
	STYLE_DATE_READOUT_FONTSIZE,
} from '../../../constants/Style';
import Datetime from 'react-datetime'; // https://www.npmjs.com/package/react-datetime
import "react-datetime/css/react-datetime.css";
// import DateTimePickerModal from 'react-native-modal-datetime-picker'; // https://github.com/mmazzarolo/react-native-modal-datetime-picker
// import DateTimePicker from '@react-native-community/datetimepicker'; // https://github.com/react-native-datetimepicker/datetimepicker
import IconButton from '../../Buttons/IconButton';
import withValue from '../../Hoc/withValue';
import emptyFn from '../../../functions/emptyFn';
import Formatters from '@onehat/data/src/Util/Formatters';
import Calendar from '../../Icons/Calendar';
import moment from 'moment';
import _ from 'lodash';

export function DateElement(props) {
	const {
			placeholderText,
			value = new Date(),
			setValue,
			format,
			mode = 'date',
			tooltip = 'Choose a date.',
		} = props,
		[isPickerShown, setIsPickerShown] = useState(false),
		[top, setTop] = useState(0),
		[left, setLeft] = useState(0),
		showPicker = () => {
			setIsPickerShown(true);
		},
		hidePicker = () => {
			setIsPickerShown(false);
		},
		handleConfirm = (date) => {
			hidePicker();
			setValue(date);
		},
		propsToPass = _.omit(props, ['setValue', 'textStyle', 'placeholderText']);

	let title = placeholderText;
	if (!_.isNil(value)) {
		switch(mode) {
			case 'date':
				title = format ? Formatters.FormatDate(value, format) : Formatters.FormatDate(value);;
				break;
			case 'time':
				title = format ? Formatters.FormatTime(value, format) : Formatters.FormatTime(value);
				break;
			case 'datetime':
				title = format ? Formatters.FormatDateTime(value, format) : Formatters.FormatDateTime(value);
				break;
			default:
		}
	}
	
	// Web version
	return <Tooltip label={tooltip} placement="bottom">
				<Row flex={1} h="100%" alignItems="center">
					<IconButton
						icon={<Icon as={Calendar} />}
						onPress={showPicker}
						h={10}
						w={10}
						bg="primary.200"
						_hover={{
							bg: 'primary.400',
						}}
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
							fontSize={STYLE_DATE_READOUT_FONTSIZE}
							borderWidth={1}
							borderColor="trueGray.300"
							borderRadius={4}
						>{title}</Text>
					</Pressable>
					<Popover
						isOpen={isPickerShown}
						onClose={() => {
							hidePicker();
						}}
						trigger={emptyFn}
						trapFocus={false}
						placement={'auto'}
						{...props}
					>
						<Popover.Content
							position="absolute"
							top={top + 'px'}
							left={left + 'px'}
							w={300}
							h={300}
						>
							<Popover.Body
								p={0}
							>
								<Datetime
									open={true}
									input={false}
									onChange={(value) => setValue(value)}
									closeOnClickOutside={false}
									{...propsToPass}
								/>
							</Popover.Body>
						</Popover.Content>
					</Popover>
				</Row>
			</Tooltip>;

	// React Native v1
	// return <Row>
	// 			<Icon as={Calendar} />
	// 			<Text>{title}</Text>
	// 			{isPickerShown && <DateTimePicker
	// 								value={value}
	// 								mode={mode}
	// 								display="default"
	// 								onChange={(e, value) => {
	// 									setValue(value);
	// 								}}
	// 								{...propsToPass}
	// 							/>}
	// 		</Row>;
	
	// React Native v2
	// return <Box>
	// 			<Button
	// 				leftIcon={<Icon as={Calendar} />}
	// 				onPress={showPicker}
	// 			>{title}</Button>
	// 			<DateTimePickerModal
	// 				isPickerShown={isPickerShown}
	// 				mode="date"
	// 				onConfirm={handleConfirm}
	// 				onCancel={hidePicker}
	// 				{...propsToPass}
	// 			/>
	// 		</Box>;
};

export default withValue(DateElement);
