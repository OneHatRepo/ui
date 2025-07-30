import React, { useState, useRef, } from 'react';
import {
	HStackNative,
	Popover, PopoverContent, PopoverBody,
	Pressable,
	Tooltip,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import { SketchPicker } from 'react-color';
import {
	UI_MODE_WEB,
} from '../../../Constants/UiModes.js';
import UiGlobals from '../../../UiGlobals.js';
import Input from '../Field/Input.js';
import withComponent from '../../Hoc/withComponent.js';
import withValue from '../../Hoc/withValue.js';
import emptyFn from '../../../Functions/emptyFn.js';
import _ from 'lodash';

export function ColorElement(props) {
	const {
			value = '#000',
			setValue,
			tooltip = 'Choose a color.',
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
	let assembledComponents = null;
	assembledComponents =
		<HStackNative
			onLayout={() => setIsRendered(true)}
			className={clsx(
				'ColorElement-HStackNative',
				'flex-1',
				'h-full',
				'items-center',
			)}
		>
			<Pressable
				ref={triggerRef}
				onPress={onTriggerPress}
				onBlur={onTriggerBlur}
				borderTopLeftRadius={6}
				borderBottomLeftRadius={6}
				borderTopRightRadius={0}
				borderBottomRightRadius={0}
				className={clsx(
					'ColorElement-Pressable',
					`bg-${value}`,
					'h-[10px]',
					'w-[10px]',
					'border',
					'border-grey-300',
				)}
			/>
			<Input
				ref={inputRef}
				value={value}
				setValue={setValue}
				maxLength={7}
				onBlur={onInputBlur}
				onClick={onInputClick}
				className={clsx(
					'ColorElement-Input',
					'flex-1',
					'h-full',
					'p-2',
					'border',
					'border-grey-300',
					'border-left-0',
					'border-top-left-radius-0',
					'border-bottom-left-radius-0',
					'border-top-right-radius-6',
					'border-bottom-right-radius-6',
					styles.FORM_COLOR_INPUT_CLASSNAME,
				)}
				textAlignIsCenter={true}
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
			<Popover
				isOpen={isPickerShown}
				onClose={() => {
					hidePicker();
				}}
				trigger={emptyFn}
				trapFocus={true}
				placement={'auto'}
				className={clsx(
					'ColorElement-Popover'
				)}
			>
				<PopoverContent
					position="absolute"
					className={clsx(
						'ColorElement-PopoverContent',
						'w-[220px]',
						'h-[287px]',
					)}
					style={{
						top,
						left,
					}}
					{...translateProps}
				>
					<PopoverBody
						ref={pickerRef}
						className={clsx(
							'ColorElement-PopoverBody',
							'p-0',
						)}
					>
						<SketchPicker
							disableAlpha={true}
							color={value}
							onChange={(color) => setValue(color.hex)}
							{...props}
						/>
					</PopoverBody>
				</PopoverContent>
			</Popover>
		</HStackNative>;


	// React Native v1
	
	
	// React Native v2
	
	if (tooltip) {
		// assembledComponents = <Tooltip label={tooltip} placement={tooltipPlacement}>
		// 					{assembledComponents}
		// 				</Tooltip>;
	}
	return assembledComponents;
}

export default withComponent(withValue(ColorElement));
