import React, { useState, useEffect, useRef, } from 'react';
import {
	Icon,
	Popover,
	Pressable,
	Row,
	Text,
	Tooltip,
} from 'native-base';
import {
	DATE,
	TIME,
	DATETIME,
} from '../../../Constants/Date.js';
// import DateTimePickerModal from 'react-native-modal-datetime-picker'; // https://github.com/mmazzarolo/react-native-modal-datetime-picker
// import DateTimePicker from '@react-native-community/datetimepicker'; // https://github.com/react-native-datetimepicker/datetimepicker
import Datetime from 'react-datetime'; // https://www.npmjs.com/package/react-datetime
import 'react-datetime/css/react-datetime.css';
import './datetime.css';
import {
	UI_MODE_WEB,
} from '../../../Constants/UiModes.js';
import UiGlobals from '../../../UiGlobals.js';
import Formatters from '@onehat/data/src/Util/Formatters.js';
import Parsers from '@onehat/data/src/Util/Parsers.js';
import Input from '../Field/Input.js';
import IconButton from '../../Buttons/IconButton.js';
import withValue from '../../Hoc/withValue.js';
import emptyFn from '../../../Functions/emptyFn.js';
import Calendar from '../../Icons/Calendar.js';
import _ from 'lodash';

export function DateElement(props) {
	const {
			placeholderText,
			value,
			setValue,
			format,
			mode = DATE,
			tooltip = 'Choose a date.',
			tooltipPlacement = 'bottom',
		} = props,
		styles = UiGlobals.styles,
		inputRef = useRef(),
		triggerRef = useRef(),
		pickerRef = useRef(),
		[isPickerShown, setIsPickerShown] = useState(false),
		[isRendered, setIsRendered] = useState(false),
		[isTranslateX, setIsTranslateX] = useState(false),
		[isTranslateY, setIsTranslateY] = useState(false),
		[top, setTop] = useState(0),
		[left, setLeft] = useState(0),
		showPicker = () => {
			if (isPickerShown) {
				return;
			}
			if (UiGlobals.mode === UI_MODE_WEB && triggerRef.current?.getBoundingClientRect) {
				// For web, ensure it's in the proper place
				const 
					triggerRect = triggerRef.current.getBoundingClientRect(),
					inputRect = inputRef.current.getBoundingClientRect(),
					bodyRect = document.body.getBoundingClientRect(),
					isLower = triggerRect.top > (bodyRect.height / 2),
					isRight = triggerRect.left > (bodyRect.width / 2);
	
				setLeft(inputRect.left);
				if (isLower) {
					setTop(inputRect.top);
					setIsTranslateY(true);
				} else {
					setTop(inputRect.top + inputRect.height);
				}
				if (isRight) {
					// setIsTranslateX(true);
				}
			}

			setIsPickerShown(true);
		},
		hidePicker = () => {
			if (!isPickerShown) {
				return;
			}
			setIsPickerShown(false);
		},
		onInputKeyPress = (e) => {
			switch(e.key) {
				case 'Escape':
				case 'Enter':
					hidePicker();
					break;
				default:
			}
		},
		onInputBlur = (e) => {
			const {
					relatedTarget
				} = e;
			if (!relatedTarget ||
					(!inputRef.current.contains(relatedTarget) && triggerRef.current !== relatedTarget && (!pickerRef.current || !pickerRef.current.contains(relatedTarget)))) {
				// hidePicker();
			}
		},
		onInputClick = (e) => {
			if (!isRendered) {
				return;
			}
			showPicker();
		},
		onInputSetValue = (value) => {
			if (value === '') {
				setValue(null);
				return;
			}
			switch(mode) {
				case DATE:
					if (!_.isNil(value)) {
						value = Parsers.ParseDate(value);
						value = Formatters.FormatDate(value, 'YYYY-MM-DD');
					}
					break;
				case TIME:
					if (!_.isNil(value)) {
						value = Parsers.ParseTime(value);
						value = Formatters.FormatTime(value);
					}
					break;
				case DATETIME:
					if (!_.isNil(value)) {
						value = Parsers.ParseDate(value);
						value = Formatters.FormatDate(value, 'YYYY-MM-DD HH:mm:ss');
					}
					break;
				default:
			}
			setValue(value);
		},
		onTriggerPress = (e) => {
			if (!isRendered) {
				return;
			}
			if (isPickerShown) {
				hidePicker();
			} else {
				showPicker();
			}
			inputRef.current.focus();
		},
		onTriggerBlur = (e) => {
			if (!isPickerShown) {
				return;
			}
			const {
					relatedTarget
				} = e;
			if (!relatedTarget || 
					(!inputRef.current.contains(relatedTarget) && triggerRef.current !== relatedTarget && !pickerRef.current.contains(relatedTarget))) {
				hidePicker();
			}
		},
		onPickerChange = (moment) => {
			let value = null;
			switch(mode) {
				case DATE:
					value = Formatters.FormatDate(moment, 'YYYY-MM-DD');
					break;
				case TIME:
					value = Formatters.FormatTime(moment);
					break;
				case DATETIME:
					value = Formatters.FormatDateTime(moment, 'YYYY-MM-DD HH:mm:ss');
					break;
				default:
			}
			setValue(value);
		};


	// place the picker in a convenient spot
	const
		translateParts = [],
		translateProps = {};
	if (isTranslateX) {
		translateParts.push('translateX(-100%)');
	}
	if (isTranslateY) {
		translateParts.push('translateY(-100%)');
	}
	if (!_.isEmpty(translateParts)) {
		translateProps.style = {
			transform: translateParts.join(' '),
		};
	}

	// Format the display date/time/datetime
	let title = placeholderText,
		pickerValue = null,
		height = 300,
		width = 300;
	switch(mode) {
		case DATE:
			height = 272;
			if (!_.isNil(value)) {
				title = format ? Formatters.FormatDate(value, format) : Formatters.FormatDate(value);
				pickerValue = Parsers.ParseDate(value, 'YYYY-MM-DD');
			}
			break;
		case TIME:
			height = 120;
			width = 150;
			if (!_.isNil(value)) {
				title = format ? Formatters.FormatTime(value, format) : Formatters.FormatTime(value);
				pickerValue = Parsers.ParseDate(value, 'HH:mm:ss');
			}
			break;
		case DATETIME:
			if (!_.isNil(value)) {
				title = format ? Formatters.FormatDateTime(value, format) : Formatters.FormatDateTime(value);
				pickerValue = Parsers.ParseDate(value, 'YYYY-MM-DD HH:mm:ss');
			}
			break;
		default:
	}

	if (pickerValue?.toDate) {
		pickerValue = pickerValue.toDate();
	}

	const DT = Datetime.default || Datetime; // this shouldn't be necessary, but I couldn't get it to work unless doing this! Something is screwey with the ES6 import of Datetime.

	// Web version
	return <Tooltip label={tooltip} placement={tooltipPlacement}>
				<Row flex={1} h="100%" alignItems="center" onLayout={() => setIsRendered(true)}>
					<IconButton
						ref={triggerRef}
						icon={<Icon as={Calendar} color={styles.FORM_DATE_ICON_COLOR} />}
						onPress={onTriggerPress}
						onBlur={onTriggerBlur}
						h={10}
						w={10}
						borderTopLeftRadius={6}
						borderBottomLeftRadius={6}
						borderTopRightRadius={0}
						borderBottomRightRadius={0}
						bg={styles.FORM_DATE_ICON_BG}
						_hover={{
							bg: styles.FORM_DATE_ICON_BG_HOVER,
						}}
					/>
					<Input
						ref={inputRef}
						value={title}
						setValue={onInputSetValue}
						onKeyPress={onInputKeyPress}
						onBlur={onInputBlur}
						onClick={onInputClick}
						flex={1}
						h="100%"
						p={2}
						borderWidth={1}
						borderColor="trueGray.300"
						borderLeftWidth={0}
						borderTopLeftRadius={0}
						borderBottomLeftRadius={0}
						borderTopRightRadius={6}
						borderBottomRightRadius={6}
						fontSize={styles.FORM_DATE_READOUT_FONTSIZE}
						bg={styles.FORM_DATE_INPUT_BG}
						_focus={{
							bg: styles.FORM_DATE_INPUT_FOCUS_BG,
						}}
						numberOfLines={1}
						ellipsizeMode="head"
						onLayout={(e) => {
							// On web, this is not needed, but on RN it might be, so leave it in for now
							const {
									height,
									top,
									left,
								} = e.nativeEvent.layout;
							setTop(top + height);
							setLeft(left);
						}}
					/>
					{/* <Pressable
						flex={1}
						h="100%"
						onPress={showPicker}
					>
						<Text
							flex={1}
							h="100%"
							ml={1}
							p={2}
							fontSize={styles.FORM_DATE_READOUT_FONTSIZE}
							borderWidth={1}
							borderColor="trueGray.300"
							borderRadius={4}
							numberOfLines={1}
							ellipsizeMode="head"
						>{title}</Text>
					</Pressable> */}
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
							w={width}
							h={height}
							{...translateProps}
						>
							<Popover.Body
								ref={pickerRef}
								p={0}
							>
								<DT
									open={true}
									input={false}
									closeOnClickOutside={false}
									value={pickerValue}
									dateFormat={mode === DATE || mode === DATETIME ? 'YYYY-MM-DD' : false}
									timeFormat={mode === TIME || mode === DATETIME ? 'HH:mm:ss' : false}
									onChange={onPickerChange}
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
