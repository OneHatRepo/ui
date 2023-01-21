import React from 'react';
import {
	Column,
	Row,
	Text,
} from 'native-base';
import {
	FaTimes,
	FaMinus,
	FaPlus,
} from 'react-icons/fa';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../Constants/Directions';
import styles from '../../Constants/Styles';
import emptyFn from '../../Functions/emptyFn';
import IconButton from '../Buttons/IconButton';

export default function Header(props) {
	const {
			testID = 'Header',
			title = '',
			isClosable = true,
			onClose = emptyFn,
			isCollapsible = true,
			collapseDirection = VERTICAL,
			isCollapsed = false,
			onToggleCollapse = emptyFn,
		} = props;

	let closeBtn = null,
		collapseBtn = null;
	if (isClosable) {
		closeBtn = <IconButton
						icon={<FaTimes size={styles.PANEL_HEADER_ICON_SIZE} color={styles.HEADER_ICON_COLOR} />}
						onPress={onClose}
						testID="closeBtn"
						alignSelf="center"
						mr={1}
					/>;
	}
	if (isCollapsible) {
		collapseBtn = <IconButton
						icon={isCollapsed ? <FaPlus size={styles.PANEL_HEADER_ICON_SIZE} color={styles.HEADER_ICON_COLOR} /> : <FaMinus size={styles.PANEL_HEADER_ICON_SIZE}  color={styles.HEADER_ICON_COLOR} />}
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
						 <Column alignItems="center" justifyContent="flex-start" h="100%" w="100%" bg={styles.PANEL_HEADER_BG_VERTICAL} style={{ userSelect: 'none', }} testID={testID}>
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
				<Row alignItems="center" justifyContent="flex-start" px={styles.PANEL_HEADER_PX} py={styles.PANEL_HEADER_PY} bg={styles.PANEL_HEADER_BG} style={{ userSelect: 'none', }} testID={testID}>
					{closeBtn}
					<Text flex={1} fontSize={styles.PANEL_HEADER_TEXT_FONTSIZE} color={styles.PANEL_HEADER_TEXT_COLOR} numberOfLines={1} ellipsizeMode="head" testID="text">{title}</Text>
					{collapseBtn}
				</Row>
			</div>;
}
