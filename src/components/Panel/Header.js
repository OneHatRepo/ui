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
} from '../../constants/Directions';
import {
	HEADER_PX,
	HEADER_PY,
	HEADER_ICON_SIZE,
	HEADER_ICON_COLOR,
	HEADER_TEXT_FONTSIZE,
	HEADER_TEXT_COLOR,
} from '../../../constants/HeaderFooter';
import emptyFn from '../../functions/emptyFn';
import IconButton from '../Buttons/IconButton';

export default function Header(props) {
	const {
			testID = 'Header',
			title = '',
			isClosable = true,
			onClose = emptyFn,
			isCollapsible = true,
			collapseDirection = HORIZONTAL,
			isCollapsed = false,
			onToggleCollapse = emptyFn,
		} = props;

	let closeBtn = null,
		collapseBtn = null;
	if (isClosable) {
		closeBtn = <IconButton
						icon={<FaTimes size={HEADER_ICON_SIZE} color={HEADER_ICON_COLOR} />}
						onPress={onClose}
						testID="closeBtn"
						alignSelf="center"
						mr={1}
					/>;
	}
	if (isCollapsible) {
		collapseBtn = <IconButton
						icon={isCollapsed ? <FaPlus size={HEADER_ICON_SIZE} color={HEADER_ICON_COLOR} /> : <FaMinus size={HEADER_ICON_SIZE}  color={HEADER_ICON_COLOR} />}
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
		if (collapseDirection === VERTICAL) {
			collapseBtn = React.cloneElement(collapseBtn, { my: 2, mr: 1, });
			return <div
						style={{ flex: 1, width: '100%', userSelect: 'none', ...doubleClickStyle, }}
						onClick={(e) => {
							if (isCollapsible && e.detail === 2) { // double-click
								onToggleCollapse(e);
							}
						}}
					>
						 <Column alignItems="center" justifyContent="flex-start" h="100%" w="100%" bg="primary.100" testID={testID}>
							{collapseBtn}
							<div style={{ textOrientation: 'mixed', writingMode: 'vertical-rl', }}>
								<Text flex={1} fontSize={HEADER_TEXT_FONTSIZE} color={HEADER_TEXT_COLOR} testID="text">{title}</Text>
							</div>
						</Column>
					</div>;
		}
	}

	return <div
				style={{ width: '100%', userSelect: 'none', ...doubleClickStyle, }}
				onClick={(e) => {
					if (isCollapsible && e.detail === 2) { // double-click
						onToggleCollapse(e);
					}
				}}
			>
				<Row alignItems="center" justifyContent="flex-start" px={HEADER_PX} py={HEADER_PY} bg="primary.100" testID={testID}>
					{closeBtn}
					<Text flex={1} fontSize={HEADER_TEXT_FONTSIZE} color={HEADER_TEXT_COLOR} testID="text">{title}</Text>
					{collapseBtn}
				</Row>
			</div>;
}
