import { forwardRef, useState, useRef, useEffect, } from 'react';
import {
	Box,
	HStack,
	HStackNative,
	Modal, ModalBackdrop, ModalHeader, ModalContent, ModalCloseButton, ModalBody, ModalFooter,
	Popover, PopoverBackdrop, PopoverContent, PopoverBody,
	Pressable,
	TextNative,
} from '../../Gluestack';
import {
	DATE,
	TIME,
	DATETIME,
} from '../../../Constants/Date.js';
import {
	UI_MODE_NATIVE,
	UI_MODE_WEB,
} from '../../../Constants/UiModes.js';
import UiGlobals from '../../../UiGlobals.js';
import Formatters from '@onehat/data/src/Util/Formatters.js';
import Parsers from '@onehat/data/src/Util/Parsers.js';
import Input from '../Field/Input.js';
import IconButton from '../../Buttons/IconButton.js';
import Xmark from '../../Icons/Xmark.js';
import withComponent from '../../Hoc/withComponent.js';
import withTooltip from '../../Hoc/withTooltip.js';
import withValue from '../../Hoc/withValue.js';
import emptyFn from '../../../Functions/emptyFn.js';
import testProps from '../../../Functions/testProps.js';
import getComponentFromType from '../../../Functions/getComponentFromType.js';
import Calendar from '../../Icons/Calendar.js';
import moment from 'moment';
import _ from 'lodash';


export const DateElement = forwardRef((props, ref) => {
	
	const {
			format,
			mode = DATE,

			additionalButtons,
			menuMinWidth = 200,
			disableDirectEntry = false,
			hideMenuOnSelection = true,
			showXButton = false,
			_input = {},
			isDisabled = false,
			limitWidth = false,
			minValue,
			maxValue,
			testID,

			// withComponent
			self,

			// withValue
			value,
			setValue,
		} = props,
		styles = UiGlobals.styles,
		Datetime = getComponentFromType('Datetime'),
		inputRef = ref || useRef(),
		triggerRef = useRef(),
		pickerRef = useRef(),
		[isPickerShown, setIsPickerShown] = useState(false),
		[isRendered, setIsRendered] = useState(false),
		[localValue, setLocalValue] = useState(value),
		[textInputValue, setTextInputValue] = useState(value),
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
					// triggerRect = triggerRef.current.getBoundingClientRect(),
					inputRect = inputRef.current.getBoundingClientRect();
			
				setLeft(inputRect.left);
				setTop(inputRect.top + inputRect.height);
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
	let placeholder = 'Select';
		pickerValue = null,
		height = null,
		width = null;
	switch(mode) {
		case DATETIME:
			placeholder = 'Select Date/Time';
			if (!_.isNil(value)) {
				title = format ? Formatters.FormatDateTime(value, format) : Formatters.FormatDateTime(value);
				pickerValue = Parsers.ParseDate(value, 'YYYY-MM-DD HH:mm:ss');
			}
			if (limitWidth) {
				width = 200;
			}
			break;
		case DATE:
			placeholder = 'Select Date';
			if (!_.isNil(value)) {
				title = format ? Formatters.FormatDate(value, format) : Formatters.FormatDate(value);
				pickerValue = Parsers.ParseDate(value, 'YYYY-MM-DD');
			}
			if (limitWidth) {
				width = 150;
			}
			break;
		case TIME:
			placeholder = 'Select Time';
			if (!_.isNil(value)) {
				title = format ? Formatters.FormatTime(value, format) : Formatters.FormatTime(value);
				pickerValue = Parsers.ParseDate(value, 'HH:mm:ss');
			}
			if (limitWidth) {
				width = 150;
			}
			break;
		default:
	}

	if (pickerValue?.toDate) {
		pickerValue = pickerValue.toDate();
	}

	let xButton = null,
		trigger = null,
		input = null,
		dropdownMenu = null,
		assembledComponents = null;

	if (showXButton && !_.isNil(value)) {
		xButton = <IconButton
						{...testProps('xBtn')}
						icon={Xmark}
						_icon={{
							size: 'sm',
							className: 'text-grey-600',
						}}
						isDisabled={isDisabled}
						onPress={onClearBtn}
						className={`
							h-full
							${styles.FORM_COMBO_TRIGGER_BG}
							${styles.FORM_COMBO_TRIGGER_BG_HOVER}
						`}
					/>;
	}
	trigger = <IconButton
				{...testProps('trigger')}
				ref={triggerRef}
				icon={Calendar}
				_icon={{
					size: 'sm',
					className: styles.FORM_DATE_ICON_COLOR,
				}}
				onPress={onTriggerPress}
				onBlur={onTriggerBlur}
				isDisabled={isDisabled}
				className={`
					h-10
					w-10
					border
					border-grey-400
					rounded-l-md
					rounded-r-none
					${styles.FORM_DATE_ICON_BG}
					${styles.FORM_DATE_ICON_BG_HOVER}
				`}
			/>;

	if (UiGlobals.mode === UI_MODE_WEB) {
		input = disableDirectEntry ?
			<Pressable
				{...testProps('togglePickerBtn')}
				onPress={togglePicker}
				className="flex-1 h-full"
			>
				<TextNative
					ref={inputRef}
					numberOfLines={1}
					ellipsizeMode="head"
					className={`
						flex-1
						h-full
						m-0
						p-2
						border
						border-grey-400
						border-l-[0px]
						rounded-l-none
						rounded-r-md
						${_.isEmpty(textInputValue) ? "text-grey-400" : "text-black"}
						${styles.FORM_DATE_INPUT_BG}
						${styles.FORM_DATE_INPUT_BG_FOCUS}
						${styles.FORM_DATE_READOUT_FONTSIZE}
					`}
				>{_.isEmpty(textInputValue) ? placeholder : textInputValue}</TextNative>
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
				className={`
					flex-1
					h-full
					m-0
					rounded-tr-none
					rounded-br-none
					${styles.FORM_DATE_INPUT_BG}
					${styles.FORM_DATE_INPUT_BG_FOCUS}
					${styles.FORM_DATE_READOUT_FONTSIZE}
					${_.isEmpty(textInputValue) ? 'text-grey-400' : 'text-black'}
				`}
				autoSubmitDelay={1000}
				placeholder={placeholder}
				{..._input}
			/>;
	}
	if (UiGlobals.mode === UI_MODE_NATIVE) {
		throw new Error('Migration to Gluestack not yet implemented for Native mode');
		// This input and trigger are for show
		// The just show the current value and open the menu
		input = <Pressable
					{...testProps('togglePickerBtn')}
					onPress={togglePicker}
					className="flex-1"
				>
					<TextNative
						numberOfLines={1}
						ellipsizeMode="head"
						className={`
							flex-1
							h-full
							m-0
							p-2
							border
							border-grey-400
							border-l-[0px]
							rounded-l-none
							rounded-r-md
							${_.isEmpty(textInputValue) ? "text-grey-400" : "text-black"} 
							${styles.FORM_DATE_READOUT_FONTSIZE} 
							${styles.FORM_DATE_INPUT_BG}
							${styles.FORM_DATE_INPUT_BG_FOCUS}
						`}
					>{_.isEmpty(textInputValue) ? placeholder : textInputValue}</TextNative>
				</Pressable>;
	}

	if (isPickerShown) {
		if (UiGlobals.mode === UI_MODE_WEB) {
			dropdownMenu = <Popover
								isOpen={isPickerShown}
								onClose={() => {
									hidePicker();
								}}
								trigger={emptyFn}
								className="block"
							>
								<PopoverBackdrop className="PopoverBackdrop bg-[#000]" />
								<PopoverContent
									ref={pickerRef}
									className={`
										PopoverContent
									`}
									style={{
										top,
										left,
										width,
										height,
										minWidth: menuMinWidth,
									}}
								>
									<PopoverBody
										className={`
											PopoverBody
											overflow-hidden
										`}
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
									</PopoverBody>
								</PopoverContent>
							</Popover>;
		}
		if (UiGlobals.mode === UI_MODE_NATIVE) {
			const inputAndTriggerClone = // for RN, this is the actual input and trigger, as we need them to appear up above in the modal
				<HStack className="h-[10px]">
					<IconButton
						{...testProps('hidePickerBtn')}
						_icon={{
							as: Calendar,
							color: styles.FORM_DATE_ICON_COLOR,
							size: 'sm',
						}}
						isDisabled={isDisabled}
						onPress={() => hidePicker()}
						className={`
							h-full
							w-10
							border
							border-grey-400
							rounded-l-md
							rounded-r-none
							${styles.FORM_DATE_ICON_BG}
							${styles.FORM_DATE_ICON_BG_HOVER}
						`}
					/>
					{disableDirectEntry ?
						<TextNative
							ref={inputRef}
							numberOfLines={1}
							ellipsizeMode="head"
							className={`
								flex-1
								h-full
								m-0
								p-2
								border
								border-grey-400
								border-l-0
								rounded-l-none
								rounded-r-md
								${_.isEmpty(textInputValue) ? "text-grey-400" : "text-black"}
								${styles.FORM_DATE_INPUT_BG}
								${styles.FORM_DATE_INPUT_BG_FOCUS}
								${styles.FORM_DATE_READOUT_FONTSIZE}
							`}
						>{textInputValue}</TextNative> :
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
							autoSubmitDelay={1000}
							placeholder={placeholder}
							className={`
								flex-1
								h-full
								m-0
								rounded-tr-none
								rounded-br-none
								${_.isEmpty(textInputValue) ? 'text-grey-400' : 'text-black'}
								${styles.FORM_DATE_READOUT_FONTSIZE}
								${styles.FORM_DATE_INPUT_BG}
								${styles.FORM_DATE_INPUT_BG_FOCUS}
							`}
							{..._input}
						/>}
				</HStack>;
			dropdownMenu = <Modal
								isOpen={true}
								safeAreaTop={true}
								onClose={() => setIsPickerShown(false)}
								className="mt-auto mb-auto w-full h-[400px] p-[5px]"
							>
								<ModalBackdrop />
								<ModalContent>
									<ModalBody>
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
										<Box className="bg-white">
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
									</ModalBody>
								</ModalContent>
							</Modal>;
		}
	}

	let className = `
		Date-HStackNative
		flex-1
		justify-center
		items-center
		${styles.FORM_COMBO_HEIGHT}
	`;
	if (props.className) {
		className += props.className;
	}
	const style = props.style || {};
	if (!_.isNil(height)) {
		style.height = height;
	}
	if (!_.isNil(width)) {
		style.width = width;
	}

	assembledComponents = <HStackNative
							onLayout={() => setIsRendered(true)}
							className={className}
							style={style}
						>
							{xButton}
							{trigger}
							{input}
							{additionalButtons}
							{dropdownMenu}
						</HStackNative>;
	
	return assembledComponents;

});

export default withComponent(withValue(withTooltip(DateElement)));
