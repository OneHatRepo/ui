import React from 'react';
import {
	Column,
	Icon,
	Pressable,
	Row,
	Text,
} from 'native-base';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../constants/Directions.js';
import {
	CURRENT_MODE,
	UI_MODE_WEB,
	UI_MODE_REACT_NATIVE,
} from '../../constants/UiModes.js';
import UiGlobals from '../../UiGlobals.js';
import Minus from '../Icons/Minus.js';
import Plus from '../Icons/Plus.js';
import Xmark from '../Icons/Xmark.js';
import emptyFn from '../../functions/emptyFn.js';
import IconButton from '../Buttons/IconButton.js';

export default function Header(props) {

	const {
			testID = 'Header',
			title = '',
			onClose,
			isCollapsible = true,
			collapseDirection = VERTICAL,
			isCollapsed = false,
			onToggleCollapse = emptyFn,
		} = props,
		styles = UiGlobals.styles;

	let closeBtn = null,
		collapseBtn = null;
	if (onClose) {
		closeBtn = <IconButton
						icon={<Icon as={Xmark} size={styles.PANEL_HEADER_ICON_SIZE} color={styles.PANEL_HEADER_ICON_COLOR} />}
						onPress={onClose}
						testID="closeBtn"
						alignSelf="center"
						mr={3}
						borderWidth={1}
						borderColor="trueGray.400"
					/>;
	}
	if (isCollapsible) {
		collapseBtn = <IconButton
						icon={isCollapsed ? <Icon as={Plus} size={styles.PANEL_HEADER_ICON_SIZE} color={styles.PANEL_HEADER_ICON_COLOR} /> : <Icon as={Minus} size={styles.PANEL_HEADER_ICON_SIZE}  color={styles.PANEL_HEADER_ICON_COLOR} />}
						onPress={onToggleCollapse}
						testID="collapseBtn"
						alignSelf="center"
						ml={1}
						h="20px"
						w="30px"
					/>;
	}
	
	const doubleClickStyle = {};
	if (isCollapsible) {
		doubleClickStyle.cursor = 'pointer';
	}


	if (CURRENT_MODE === UI_MODE_WEB) {

		if (isCollapsed) {
			if (collapseDirection === HORIZONTAL) {
				collapseBtn = React.cloneElement(collapseBtn, { my: 2, mr: 1, });
				return <div
							className="header"
							style={{ flex: 1, width: '100%', userSelect: 'none', ...doubleClickStyle, }}
							onClick={(e) => {
								if (isCollapsible && e.detail === 2) { // double-click
									onToggleCollapse(e);
								}
							}}
						>
							 <Column
							 	alignItems="center"
								justifyContent="flex-start"
								h="100%"
								w="100%"
								bg={styles.PANEL_HEADER_BG_VERTICAL}
								borderBottomWidth={styles.PANEL_HEADER_BORDER_BOTTOM_WIDTH}
								borderBottomColor={styles.PANEL_HEADER_BORDER_BOTTOM_COLOR}
								style={{ userSelect: 'none', }}
								testID={testID}
							>
								{collapseBtn}
								<div style={{ textOrientation: 'mixed', writingMode: 'vertical-rl', }}>
									<Text flex={1} fontSize={styles.PANEL_HEADER_TEXT_FONTSIZE} color={styles.PANEL_HEADER_TEXT_COLOR} numberOfLines={1} ellipsizeMode="head" testID="text">{title}</Text>
								</div>
							</Column>
						</div>;
			}
		}
	
		return <div
					className="header"
					style={{ width: '100%', userSelect: 'none', ...doubleClickStyle, }}
					onClick={(e) => {
						if (isCollapsible && e.detail === 2) { // double-click
							onToggleCollapse(e);
						}
					}}
				>
					<Row
						alignItems="center"
						justifyContent="flex-start"
						px={styles.PANEL_HEADER_PX}
						py={styles.PANEL_HEADER_PY}
						bg={styles.PANEL_HEADER_BG}
						borderBottomWidth={styles.PANEL_HEADER_BORDER_BOTTOM_WIDTH}
						borderBottomColor={styles.PANEL_HEADER_BORDER_BOTTOM_COLOR}
						style={{ userSelect: 'none', }}
						testID={testID}>
						{closeBtn}
						<Text flex={1} fontSize={styles.PANEL_HEADER_TEXT_FONTSIZE} color={styles.PANEL_HEADER_TEXT_COLOR} numberOfLines={1} ellipsizeMode="head" testID="text">{title}</Text>
						{collapseBtn}
					</Row>
				</div>;

	} else if (CURRENT_MODE === UI_MODE_REACT_NATIVE) {

		if (isCollapsed) {
			if (collapseDirection === HORIZONTAL) {
				collapseBtn = React.cloneElement(collapseBtn, { my: 2, mr: 1, });
				return <Pressable
							testID={testID}
							flex={1}
							w="100%"
							style={{ userSelect: 'none', ...doubleClickStyle, }}
							onPress={(e) => {
								if (isCollapsible) {
									onToggleCollapse(e);
								}
							}}
						>
							 <Column
							 	alignItems="center"
								justifyContent="flex-start"
								h="100%" 
								w="100%"
								bg={styles.PANEL_HEADER_BG_VERTICAL}
								borderBottomWidth={styles.PANEL_HEADER_BORDER_BOTTOM_WIDTH}
								borderBottomColor={styles.PANEL_HEADER_BORDER_BOTTOM_COLOR}
							>
								{collapseBtn}
								<Column
									alignItems="center"
									justifyContent="center"
									flex={1} 
									w="100%"
								>
									<Text
										textAlign="right"
										fontSize={styles.PANEL_HEADER_TEXT_FONTSIZE}
										color={styles.PANEL_HEADER_TEXT_COLOR}
										numberOfLines={1}
										ellipsizeMode="head"
										w={200}
										style={{ transform: [{ rotate: '-90deg'}] }}
									>{title}</Text>
								</Column>
							</Column>
						</Pressable>;
			}
		}
	
		return <Pressable
					testID={testID}
					w="100%"
					style={{ userSelect: 'none', ...doubleClickStyle, }}
					onPress={(e) => {
						if (isCollapsible) {
							onToggleCollapse(e);
						}
					}}
				>
					<Row
						alignItems="center"
						justifyContent="flex-start"
						px={styles.PANEL_HEADER_PX}
						py={styles.PANEL_HEADER_PY}
						bg={styles.PANEL_HEADER_BG}
						borderBottomWidth={styles.PANEL_HEADER_BORDER_BOTTOM_WIDTH}
						borderBottomColor={styles.PANEL_HEADER_BORDER_BOTTOM_COLOR}
					>
						{closeBtn}
						<Text
							flex={1}
							fontSize={styles.PANEL_HEADER_TEXT_FONTSIZE}
							color={styles.PANEL_HEADER_TEXT_COLOR}
							numberOfLines={1}
							ellipsizeMode="head"
						>{title}</Text>
						{collapseBtn}
					</Row>
				</Pressable>;

	}

}
