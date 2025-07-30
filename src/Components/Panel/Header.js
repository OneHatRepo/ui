import { cloneElement } from 'react';
import {
	HStack,
	Pressable,
	TextNative,
	VStack,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../Constants/Directions.js';
import {
	CURRENT_MODE,
	UI_MODE_WEB,
	UI_MODE_NATIVE,
} from '../../Constants/UiModes.js';
import UiGlobals from '../../UiGlobals.js';
import testProps from '../../Functions/testProps.js';
import Minus from '../Icons/Minus.js';
import Plus from '../Icons/Plus.js';
import Xmark from '../Icons/Xmark.js';
import emptyFn from '../../Functions/emptyFn.js';
import IconButton from '../Buttons/IconButton.js';

const DOUBLE_CLICK = 2;

export default function Header(props) {

	const {
			testID = 'Header',
			title = '',
			onClose,
			isCollapsible = true,
			isCollapsed = false,
			isWindow = false,
			collapseDirection = VERTICAL,
			onToggleCollapse = emptyFn,
		} = props,
		styles = UiGlobals.styles;

	let closeBtn = null,
		collapseBtn = null;
	if (onClose) {
		let closeClassName = clsx(
			'Header-closeBtn',
			'self-center',
			'border',
			'border-grey-400',
			'h-[20px]',
			'w-[20px]',
			'px-[2px]',
			'py-[2px]',
			styles.PANEL_HEADER_BG,
		);
		if (collapseDirection === HORIZONTAL && isCollapsed) {
			closeClassName += ' mb-1';
		}
		closeBtn = <IconButton
						{...testProps('closeBtn')}
						onPress={onClose}
						icon={Xmark}
						_icon={{
							// size: styles.PANEL_HEADER_ICON_SIZE,
							className: styles.PANEL_HEADER_ICON_CLASSNAME,
						}}
						className={closeClassName}
					/>;
	}
	if (isCollapsible) {
		let collapseClassName = clsx(
			'Header-collapseBtn',
			'self-center',
			'border',
			'border-grey-400',
			'h-[20px]',
			'w-[20px]',
			'px-[2px]',
			'py-[2px]',
			styles.PANEL_HEADER_BG,
		);
		if (collapseDirection === HORIZONTAL && isCollapsed) {
			collapseClassName += ' mb-1';
		}
		collapseBtn = <IconButton
						onPress={onToggleCollapse}
						icon={isCollapsed ? Plus : Minus}
						_icon={{
							size: styles.PANEL_HEADER_ICON_SIZE,
							className: styles.PANEL_HEADER_ICON_CLASSNAME,
						}}
						className={collapseClassName}
					/>;
	}
	
	const doubleClickStyle = {};
	if (isCollapsible) {
		doubleClickStyle.cursor = 'pointer';
	}

	let panelClassName = clsx(
		'Header',
		'bg-grey-300',
		'items-center',
		'justify-start',
		'py-1',
		'border-b-grey-400',
		'border-b-1',
		isWindow ? 'rounded-t-lg' : '',
		styles.PANEL_HEADER_BG,
	);
	if (CURRENT_MODE === UI_MODE_WEB) {

		if (isCollapsed) {
			if (collapseDirection === HORIZONTAL) {
				// collapseBtn = cloneElement(collapseBtn, { className: 'my-2 mr-1', });
				panelClassName += ' h-full w-full';
				return <div
							className="Header-div"
							style={{
								flex: 1,
								width: '100%',
								userSelect: 'none',
								...doubleClickStyle,
							}}
							onClick={(e) => {
								if (isCollapsible && e.detail === DOUBLE_CLICK) { // double-click
									onToggleCollapse(e);
								}
							}}
						>
							<VStack
								style={{ userSelect: 'none', }}
								className={panelClassName}
							>
								{collapseBtn}
								<div style={{ textOrientation: 'mixed', writingMode: 'vertical-rl', }}>
									<TextNative
										numberOfLines={1}
										ellipsizeMode="head"
										className={clsx(
											'Header-TextNative1',
											'flex-1',
											'font-bold',
											styles.PANEL_HEADER_TEXT_CLASSNAME,
										)}>{title}</TextNative>
								</div>
							</VStack>
						</div>;
			}
		}
		panelClassName += ' gap-2';
		if (closeBtn) {
			panelClassName += ' pl-[4px] pr-3';
		} else {
			panelClassName += ' px-3';
		}
		return <div
					className="Header-div"
					style={{
						width: '100%',
						userSelect: 'none',
						...doubleClickStyle,
					}}
					onClick={(e) => {
						if (isCollapsible && e.detail === DOUBLE_CLICK) {
							onToggleCollapse(e);
						}
					}}
				>
					<HStack
						style={{ userSelect: 'none', }}
						className={panelClassName}
					>
						{closeBtn}
						<TextNative
							numberOfLines={1}
							ellipsizeMode="head"
							className={clsx(
								'Header-TextNative2',
								'flex-1',
								'font-bold',
								styles.PANEL_HEADER_TEXT_CLASSNAME,
							)}
						>{title}</TextNative>
						{collapseBtn}
					</HStack>
				</div>;

	} else if (CURRENT_MODE === UI_MODE_NATIVE) {

		if (isCollapsed) {
			if (collapseDirection === HORIZONTAL) {
				// collapseBtn = cloneElement(collapseBtn, { my: 2, mr: 1, });
				if (closeBtn) {
					panelClassName += ' pl-[4px] pr-3';
				} else {
					panelClassName += ' px-3';
				}
				return <Pressable
							testID={testID}
							style={{ userSelect: 'none', ...doubleClickStyle, }}
							onPress={(e) => {
								if (isCollapsible) {
									onToggleCollapse(e);
								}
							}}
							className="flex-1 w-full"
						>
							<VStack
								className={panelClassName}
							>
								{collapseBtn}
								<VStack className="items-center justify-center flex-1 w-full">
									<TextNative
										numberOfLines={1}
										ellipsizeMode="head"
										style={{ transform: [{ rotate: '-90deg'}] }}
										className={clsx(
											'Header-TextNative3',
											'font-bold',
											'w-[200px]',
											'text-right',
											styles.PANEL_HEADER_TEXT_CLASSNAME,
										)}
									>{title}</TextNative>
								</VStack>
							</VStack>
						</Pressable>;
			}
		}
		panelClassName += ' gap-2';
		if (closeBtn) {
			panelClassName += ' pl-[4px] pr-3';
		} else {
			panelClassName += ' px-3';
		}
		return <Pressable
					testID={testID}
					style={{ userSelect: 'none', ...doubleClickStyle, }}
					onPress={(e) => {
						if (isCollapsible) {
							onToggleCollapse(e);
						}
					}}
					className="w-full"
				>
					<HStack
						className={panelClassName}
					>
						{closeBtn}
						<TextNative
							numberOfLines={1}
							ellipsizeMode="head"
							className={clsx(
								'Header-TextNative4',
								'font-bold',
								'flex-1',
								styles.PANEL_HEADER_TEXT_CLASSNAME,
							)}>{title}</TextNative>
						{collapseBtn}
					</HStack>
				</Pressable>;
	}

}
