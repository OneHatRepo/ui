import React, { useState, useEffect, useRef, } from 'react';
import {
	Box,
	Icon,
	Modal,
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
import {
	UI_MODE_REACT_NATIVE,
	UI_MODE_WEB,
} from '../../../Constants/UiModes.js';
import UiGlobals from '../../../UiGlobals.js';
import Formatters from '@onehat/data/src/Util/Formatters.js';
import Parsers from '@onehat/data/src/Util/Parsers.js';
import Input from '../Field/Input.js';
import IconButton from '../../Buttons/IconButton.js';
import Xmark from '../../Icons/Xmark.js';
import withComponent from '../../Hoc/withComponent.js';
import withValue from '../../Hoc/withValue.js';
import emptyFn from '../../../Functions/emptyFn.js';
import testProps from '../../../Functions/testProps.js';
import getComponentFromType from '../../../Functions/getComponentFromType.js';
import Calendar from '../../Icons/Calendar.js';
import moment from 'moment';
import _ from 'lodash';


export function DateElement(props) {
	const {
			format,
			mode = DATE,

			additionalButtons,
			tooltipRef = null,
			tooltip = null,
			menuMinWidth = 150,
			disableDirectEntry = false,
			hideMenuOnSelection = true,
			showXButton = false,
			_input = {},
			isDisabled = false,
			tooltipPlacement = 'bottom',
			placeholder = 'Choose a date.',
			testID,

			// withComponent
			self,

			// withValue
			value,
			setValue,
			...propsToPass
		} = props,
		styles = UiGlobals.styles,
		Datetime = getComponentFromType('Datetime'),
		inputRef = useRef(),
		triggerRef = useRef(),
		pickerRef = useRef(),
		[isPickerShown, setIsPickerShown] = useState(false),
		[isRendered, setIsRendered] = useState(false),
		[localValue, setLocalValue] = useState(value),
		[textInputValue, setTextInputValue] = useState(value),
		[isTranslateX, setIsTranslateX] = useState(false),
		[isTranslateY, setIsTranslateY] = useState(false),
		[top, setTop] = useState(0),
		[left, setLeft] = useState(0),
		setBothValues = (value) => {
			setLocalValue(value);
			setValue(value);
		},
		formatByMode = (value) => {
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
			return value;
		},
		showPicker = () => {
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
			setIsPickerShown(false);
		},
		togglePicker = () => {
			setIsPickerShown(!isPickerShown);
		},
		onInputKeyPress = (e, inputValue) => {
			if (disableDirectEntry) {
				return;
			}
			if (UiGlobals.mode !== UI_MODE_WEB) {
				return;
			}
			switch(e.key) {
				case 'Escape':
				case 'Enter':
					hidePicker();
					break;
				default:
			}
		},
		onInputBlur = (e) => {
			// if (UiGlobals.mode !== UI_MODE_WEB) {
			// 	return;
			// }
			// const {
			// 		relatedTarget
			// 	} = e;
			// if (!relatedTarget ||
			// 		(!inputRef.current.contains(relatedTarget) && triggerRef.current !== relatedTarget && (!pickerRef.current || !pickerRef.current.contains(relatedTarget)))) {
			// 	// hidePicker();
			// }
		},
		onInputClick = (e) => {
			if (!isRendered) {
				return;
			}
			showPicker();
		},
		onInputChangeValue = (value) => {
			if (disableDirectEntry) {
				return;
			}
			if (_.isEmpty(value)) {
				setBothValues(null);
				setTextInputValue('');
				return;
			}

			value = formatByMode(value);
			
			if (value !== 'Invalid date') {
				setBothValues(value);
			}

			setTextInputValue(value);
			if (!isPickerShown) {
				showPicker();
			}
		},
		onInputFocus = (e) => {
			if (inputRef.current?.select) {
				inputRef.current?.select();
			}
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
			inputRef.current?.focus();
		},
		onTriggerBlur = (e) => {
			if (!isPickerShown || UiGlobals.mode !== UI_MODE_WEB) {
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

			if (moment && moment?.isValid()) {
				setBothValues(value);
				setTextInputValue(value);
			}
		};


	useEffect(() => {

		// When value changes from outside, adjust text value
		if (value !== localValue) {
			setLocalValue(value);

			const textValue = formatByMode(value);
			setTextInputValue(textValue);
		}

	}, [value]);
	
	// Format the display date/time/datetime
	let title = placeholder,
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

	let xButton = null,
		inputAndTrigger = null,
		grid = null,
		dropdownMenu = null,
		assembledComponents = null;

	if (showXButton && !_.isNil(value)) {
		xButton = <IconButton
						{...testProps('xBtn')}
						_icon={{
							as: Xmark,
							color: 'trueGray.600',
							size: 'sm',
						}}
						isDisabled={isDisabled}
						onPress={onClearBtn}
						h="100%"
						bg={styles.FORM_COMBO_TRIGGER_BG}
						_hover={{
							bg: styles.FORM_COMBO_TRIGGER_HOVER_BG,
						}}
					/>;
	}

	if (UiGlobals.mode === UI_MODE_WEB) {
		inputAndTrigger = <>
							<IconButton
								{...testProps('trigger')}
								ref={triggerRef}
								_icon={{
									as: Calendar,
									color: styles.FORM_DATE_ICON_COLOR,
									size: 'sm',
								}}
								onPress={onTriggerPress}
								onBlur={onTriggerBlur}
								h={10}
								w={10}
								isDisabled={isDisabled}
								borderWidth={1}
								borderColor="#bbb"
								borderLeftRadius="md"
								borderRighttRadius={0}
								bg={styles.FORM_DATE_ICON_BG}
								_hover={{
									bg: styles.FORM_DATE_ICON_BG_HOVER,
								}}
							/>
							{disableDirectEntry ?
								<Pressable
									{...testProps('togglePickerBtn')}
									onPress={togglePicker}
									flex={1}
									h="100%"
								>
									<Text
										ref={inputRef}
										flex={1}
										h="100%"
										numberOfLines={1}
										ellipsizeMode="head"
										m={0}
										p={2}
										borderWidth={1}
										borderColor="trueGray.400"
										borderLeftWidth={0}
										borderLeftRadius={0}
										borderRightRadius="md"
										fontSize={styles.FORM_DATE_READOUT_FONTSIZE}
										color={_.isEmpty(textInputValue) ? 'trueGray.400' : '#000'}
										bg={styles.FORM_DATE_INPUT_BG}
										_focus={{
											bg: styles.FORM_DATE_INPUT_FOCUS_BG,
										}}
									>{_.isEmpty(textInputValue) ? placeholder : textInputValue}</Text>
								</Pressable> :
								<Input
									testID={testID}
									ref={inputRef}
									value={textInputValue}
									// setValue={onInputSetValue}
									onChangeValue={onInputChangeValue}
									onKeyPress={onInputKeyPress}
									onBlur={onInputBlur}
									onFocus={onInputFocus}
									autoSubmit={true}
									isDisabled={isDisabled}
									// onLayout={(e) => {
									// 	const {
									// 			height,
									// 			width,
									// 		} = e.nativeEvent.layout;
									// 	setWidth(Math.round(width));
									// 	setTop(Math.round(height));
									// }}
									flex={1}
									h="100%"
									m={0}
									autoSubmitDelay={1000}
									borderTopRightRadius={0}
									borderBottomRightRadius={0}
									fontSize={styles.FORM_DATE_READOUT_FONTSIZE}
									color={_.isEmpty(textInputValue) ? 'trueGray.400' : '#000'}
									bg={styles.FORM_DATE_INPUT_BG}
									_focus={{
										bg: styles.FORM_DATE_INPUT_FOCUS_BG,
									}}
									placeholder={placeholder}
									{..._input}
								/>}
						</>;
	}

	if (UiGlobals.mode === UI_MODE_REACT_NATIVE) {
		// This input and trigger are for show
		// The just show the current value and open the menu
		inputAndTrigger = <>
							<IconButton
								{...testProps('trigger')}
								ref={triggerRef}
								_icon={{
									as: Calendar,
									color: styles.FORM_DATE_ICON_COLOR,
									size: 'sm',
								}}
								isDisabled={isDisabled}
								onPress={onTriggerPress}
								onBlur={onTriggerBlur}
								h="100%"
								w={10}
								borderWidth={1}
								borderColor="#bbb"
								borderLeftRadius="md"
								borderRightWidth={0}
								borderRighttRadius={0}
								bg={styles.FORM_DATE_ICON_BG}
								_hover={{
									bg: styles.FORM_DATE_ICON_BG_HOVER,
								}}
							/>
							<Pressable
								{...testProps('togglePickerBtn')}
								onPress={togglePicker}
								flex={1}
							>
								<Text
									flex={1}
									h="100%"
									numberOfLines={1}
									ellipsizeMode="head"
									m={0}
									p={2}
									borderWidth={1}
									borderColor="trueGray.400"
									borderLeftWidth={0}
									borderLeftRadius={0}
									borderRightRadius="md"
									fontSize={styles.FORM_DATE_READOUT_FONTSIZE}
									color={_.isEmpty(textInputValue) ? 'trueGray.400' : '#000'}
									bg={styles.FORM_DATE_INPUT_BG}
									_focus={{
										bg: styles.FORM_DATE_INPUT_FOCUS_BG,
									}}
								>{_.isEmpty(textInputValue) ? placeholder : textInputValue}</Text>
							</Pressable>
						</>;
	}

	if (isPickerShown) {
		if (UiGlobals.mode === UI_MODE_WEB) {

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
			dropdownMenu = <Popover
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
									w={width + 'px'}
									minWidth={menuMinWidth}
									overflow="auto"
									bg="#fff"
									{...translateProps}
								>
									<Popover.Body
										ref={pickerRef}
										borderWidth={1}
										borderColor='trueGray.400'
										borderTopWidth={0}
										p={0}
									>
										<Datetime
											{...testProps('picker')}
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
							</Popover>;
		}
		if (UiGlobals.mode === UI_MODE_REACT_NATIVE) {
			const inputAndTriggerClone = // for RN, this is the actual input and trigger, as we need them to appear up above in the modal
				<Row h={10}>
					<IconButton
						{...testProps('hidePickerBtn')}
						_icon={{
							as: Calendar,
							color: styles.FORM_DATE_ICON_COLOR,
							size: 'sm',
						}}
						isDisabled={isDisabled}
						onPress={() => hidePicker()}
						h="100%"
						w={10}
						borderWidth={1}
						borderColor="#bbb"
						borderLeftRadius="md"
						borderRightWidth={0}
						borderRighttRadius={0}
						bg={styles.FORM_DATE_ICON_BG}
						_hover={{
							bg: styles.FORM_DATE_ICON_BG_HOVER,
						}}
					/>
					{disableDirectEntry ?
						<Text
							ref={inputRef}
							flex={1}
							h="100%"
							numberOfLines={1}
							ellipsizeMode="head"
							m={0}
							p={2}
							borderWidth={1}
							borderColor="trueGray.400"
							borderLeftWidth={0}
							borderLeftRadius={0}
							borderRightRadius="md"
							fontSize={styles.FORM_DATE_READOUT_FONTSIZE}
							color={_.isEmpty(textInputValue) ? 'trueGray.400' : '#000'}
							bg={styles.FORM_DATE_INPUT_BG}
							_focus={{
								bg: styles.FORM_DATE_INPUT_FOCUS_BG,
							}}
						>{textInputValue}</Text> :
						<Input
							{...testProps('input')}
							ref={inputRef}
							value={textInputValue}
							autoSubmit={true}
							isDisabled={isDisabled}
							onChangeValue={onInputChangeValue}
							onKeyPress={onInputKeyPress}
							onFocus={onInputFocus}
							onBlur={onInputBlur}
							flex={1}
							h="100%"
							m={0}
							autoSubmitDelay={1000}
							borderTopRightRadius={0}
							borderBottomRightRadius={0}
							fontSize={styles.FORM_DATE_READOUT_FONTSIZE}
							color={_.isEmpty(textInputValue) ? 'trueGray.400' : '#000'}
							bg={styles.FORM_DATE_INPUT_BG}
							_focus={{
								bg: styles.FORM_DATE_INPUT_FOCUS_BG,
							}}
							placeholder={placeholder}
							{..._input}
						/>}
				</Row>;
			dropdownMenu = <Modal
								isOpen={true}
								safeAreaTop={true}
								onClose={() => setIsPickerShown(false)}
								mt="auto"
								mb="auto"
								w="100%"
								h={400}
								p={5}
							>
								{inputAndTriggerClone}
								{/* <Datetime
									open={true}
									input={false}
									mode={mode === DATE ? 'date' : mode === TIME ? 'time' : mode === DATETIME ? 'datetime' : null}
									closeOnClickOutside={false}
									value={pickerValue}
									dateFormat={mode === DATE || mode === DATETIME ? 'YYYY-MM-DD' : false}
									timeFormat={mode === TIME || mode === DATETIME ? 'HH:mm:ss' : false}
									onChange={onPickerChange}
								/> */}
								<Box bg="#fff">
									<Datetime
										{...testProps('picker')}
										initialDate={moment(value).toDate()}
										selectedStartDate={moment(value).toDate()}
										onDateChange={onPickerChange}
										todayBackgroundColor="#eee"
										selectedDayColor="#f00"
										selectedDayTextColor="#fff"
									/>
								</Box>
							</Modal>;
		}
	}

	const refProps = {};
	if (tooltipRef) {
		refProps.ref = tooltipRef;
	}
	assembledComponents = <Row {...refProps} {...propsToPass} justifyContent="center" alignItems="center" h={styles.FORM_COMBO_HEIGHT} flex={1} onLayout={() => setIsRendered(true)}>
							{xButton}
							{inputAndTrigger}
							{additionalButtons}
							{dropdownMenu}
						</Row>;
	
	if (tooltip) {
		assembledComponents = <Tooltip label={tooltip} placement={tooltipPlacement}>
							{assembledComponents}
						</Tooltip>;
	}
	
	return assembledComponents;

};

export default withComponent(withValue(DateElement));
