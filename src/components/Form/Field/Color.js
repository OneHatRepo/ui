import React, { useState, useEffect, useRef, } from 'react';
import {
	Popover,
	Pressable,
	Row,
	Text,
	Tooltip,
} from 'native-base';
import { SketchPicker } from 'react-color'
import Input from '../Field/Input';
import styles from '../../../Constants/Styles';
import withValue from '../../Hoc/withValue';
import emptyFn from '../../../Functions/emptyFn';
import _ from 'lodash';

export function ColorElement(props) {
	const {
			value = '#000',
			setValue,
			tooltip = 'Choose a color.',
			tooltipPlacement = 'bottom',
		} = props,
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

			if (triggerRef.current?.getBoundingClientRect) {
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
		onInputBlur = (e) => {
			const {
					relatedTarget
				} = e;
			if (!relatedTarget ||
					(!inputRef.current.contains(relatedTarget) && triggerRef.current !== relatedTarget && (!pickerRef.current || !pickerRef.current.contains(relatedTarget)))) {
				hidePicker();
			}
		},
		onInputClick = (e) => {
			if (!isRendered) {
				return;
			}
			showPicker();
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
		};


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


	// Web version
	return <Tooltip label={tooltip} placement={tooltipPlacement}>
				<Row flex={1} h="100%" alignItems="center" onLayout={() => setIsRendered(true)}>
					<Pressable
						ref={triggerRef}
						onPress={onTriggerPress}
						onBlur={onTriggerBlur}
						h={10}
						w={10}
						bg={value}
						borderTopLeftRadius={6}
						borderBottomLeftRadius={6}
						borderTopRightRadius={0}
						borderBottomRightRadius={0}
					/>
					<Text
						ref={inputRef}
						value={value}
						setValue={setValue}
						maxLength={7}
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
						fontSize={styles.FORM_COLOR_READOUT_FONTSIZE}
						bg={styles.FORM_COLOR_INPUT_BG}
						_focus={{
							bg: styles.FORM_COLOR_INPUT_FOCUS_BG,
						}}
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
					>{value}</Text>
					{/* <Input
						ref={inputRef}
						value={value}
						setValue={setValue}
						maxLength={7}
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
						fontSize={styles.FORM_COLOR_READOUT_FONTSIZE}
						bg={styles.FORM_COLOR_INPUT_BG}
						_focus={{
							bg: styles.FORM_COLOR_INPUT_FOCUS_BG,
						}}
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
					/> */}
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
							h={287}
							{...translateProps}
						>
							<Popover.Body
								ref={pickerRef}
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
