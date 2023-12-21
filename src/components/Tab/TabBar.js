import React, { useState, useEffect, useId, } from 'react';
import {
	Button,
	Column,
	Icon,
	Row,
	Text,
} from 'native-base';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../Constants/Directions.js';
import UiGlobals from '../../UiGlobals.js';
import withComponent from '../Hoc/withComponent.js';
import IconButton from '../Buttons/IconButton.js';
import Minimize from '../Icons/Minimize.js';
import Maximize from '../Icons/Maximize.js';
import getSaved from '../../Functions/getSaved.js';
import setSaved from '../../Functions/setSaved.js';
import Xmark from '../Icons/Xmark.js';
import _ from 'lodash';


function TabBar(props) {
	const {
			tabs = [], // { _icon, title, content, path, items, }
			content, // e.g. Expo Router slot
			direction = HORIZONTAL,
			tabWidth = 150, // used on VERTICAL mode only
			tabHeight = '44px', // used on HORIZONTAL mode only
			additionalButtons,
			initialTabIx = 0,
			currentTabIx,
			disableCollapse = false,
			startsCollapsed = true,
			onChangeCurrentTab,
			onChangeIsCollapsed,
			onTabClose,
			...propsToPass
		} = props,
		styles = UiGlobals.styles,
		id = useId(),
		useLocal = _.isNil(currentTabIx),
		[isReady, setIsReady] = useState(false),
		[currentTabIxLocal, setCurrentTabIxLocal] = useState(initialTabIx),
		[isCollapsed, setIsCollapsedRaw] = useState(startsCollapsed),
		setIsCollapsed = (isCollapsed) => {
			setIsCollapsedRaw(isCollapsed);
			if (onChangeIsCollapsed) {
				onChangeIsCollapsed(isCollapsed);
			}
			setSaved(id + '-isCollapsed', isCollapsed);
		},
		getCurrentTab = () => {
			if (useLocal) {
				return currentTabIxLocal;
			}
			return currentTabIx;
		},
		setCurrentTab = (ix) => {
			if ((useLocal && ix === currentTabIxLocal) || ix === currentTabIx) {
				return; // no change
			}
			if (useLocal) {
				setCurrentTabIxLocal(ix);
				setSaved(id + '-currentTabIx', ix);
			}
			if (onChangeCurrentTab) {
				onChangeCurrentTab(ix);
			}
		},
		onToggleCollapse = () => {
			setIsCollapsed(!isCollapsed);
		},
		renderToggleButton = () => {
			const
				{
					buttonProps,
					textProps,
				} = getButtonProps();

			let button;
			if (isCollapsed) {
				button = <IconButton
							key="toggleBtn"
							onPress={onToggleCollapse}
							{...buttonProps}
							_icon={{
								as: Maximize,
								color: styles.TAB_ICON_COLOR,
							}}
							_hover={{
								bg: styles.TAB_HOVER_BG,
							}}
							bg={styles.TAB_BG}
							tooltip={isCollapsed ? 'Expand' : 'Collapse'}
						/>;
			} else {
				button = <Button
							key="toggleBtn"
							onPress={onToggleCollapse}
							leftIcon={<Icon
										as={Minimize}
										color={styles.TAB_ICON_COLOR}
									/>}
							_hover={{
								bg: styles.TAB_HOVER_BG,
							}}
							bg={styles.TAB_BG}
							{...buttonProps}
							// {...thisButtonProps}
						>
							<Text
								color={styles.TAB_COLOR}
								fontSize={styles.TAB_FONTSIZE}
								numberOfLines={1}
								ellipsizeMode="head"
								{...textProps}
							>Collapse</Text>
						</Button>;
			}
			return button;
		},
		getButtonProps = () => {
			const
				iconProps = {
					size: 'md',
				},
				textProps = {},
				buttonProps = {
					bg: styles.TAB_BG,
					color: styles.TAB_COLOR,
					fontSize: styles.TAB_FONTSIZE,
					textAlign: 'left',
					justifyContent: isCollapsed ? 'center' : 'flex-start',
				};
			switch(direction) {
				case VERTICAL:
					buttonProps.borderLeftRadius = 4;
					buttonProps.borderRightRadius = 0;
					buttonProps.w = '100%';
					buttonProps.mb = 1;
					textProps.w = '100%';
					textProps.py = 0;
					textProps.pl = 3;
					textProps.mb = 1;
					break;
				case HORIZONTAL:
					buttonProps.borderTopRadius = 4;
					buttonProps.borderBottomRadius = 0;
					textProps.borderTopRadius = 4;
					buttonProps.mr = 1;
					buttonProps.py = 1;
					textProps.mr = 1;
					textProps.px = 1;
					textProps.py = 1;
					break;
				default:
			}
			return {
				buttonProps,
				textProps,
				iconProps,
			};
		},
		renderTabs = () => {
			const
				{
					buttonProps,
					textProps,
					iconProps,
				} = getButtonProps(),
				buttons = [];
			
			_.each(tabs, (tab, ix) => {
				if (!tab._icon) {
					throw new Error('tab._icon required!');
				}
				let button;
				const
					isCurrentTab = ix === getCurrentTab(),
					thisButtonProps = {};
				let useIconButton = false;
				if (isCollapsed || !tab.title) {
					useIconButton = true;
				}
				if (useIconButton) {
					button = <IconButton
								key={'tab' + ix}
								onPress={() => setCurrentTab(ix)}
								{...buttonProps}
								// {...thisButtonProps}
								_icon={{
									color: isCurrentTab ? styles.TAB_ACTIVE_ICON_COLOR : styles.TAB_ICON_COLOR,
									...iconProps,
									...tab._icon,
								}}
								_hover={{
									bg: isCurrentTab? styles.TAB_ACTIVE_HOVER_BG : styles.TAB_HOVER_BG,
								}}
								bg={isCurrentTab ? styles.TAB_ACTIVE_BG : styles.TAB_BG}
								tooltip={tab.title}
							/>;
				} else {
					button = <Button
								key={'tab' + ix}
								onPress={() => setCurrentTab(ix)}
								leftIcon={<Icon
											color={isCurrentTab ? styles.TAB_ACTIVE_ICON_COLOR : styles.TAB_ICON_COLOR}
											{...iconProps}
											{...tab._icon}
										/>}
								{...buttonProps}
								{...thisButtonProps}
								_hover={{
									bg: isCurrentTab? styles.TAB_ACTIVE_HOVER_BG : styles.TAB_HOVER_BG,
								}}
								bg={isCurrentTab ? styles.TAB_ACTIVE_BG : styles.TAB_BG}
							>
								<Text
									color={isCurrentTab ? styles.TAB_ACTIVE_COLOR : styles.TAB_COLOR}
									fontSize={styles.TAB_FONTSIZE}
									numberOfLines={1}
									ellipsizeMode="head"
									{...textProps}
					 			>{tab.title}</Text>
							</Button>;
				}
				if (onTabClose) {
					button = <Row
								key={'tab' + ix}
							>
								{button}
								<IconButton
									key={'tab' + ix}
									onPress={() => onTabClose(ix)}
									icon={Xmark}
									tooltip="Close Tab"
								/>
							</Row>;
				}
				buttons.push(button);
			});

			if (additionalButtons) {
				_.each(additionalButtons, (additionalButton, ix) => {
					if (!additionalButton._icon) {
						throw new Error('additionalButton._icon required!');
					}
					let button;
					const thisButtonProps = {};
					if (!ix) {
						// First button should have gap before it
						switch(direction) {
							case VERTICAL:
								thisButtonProps.mt = 6;
								break;
							case HORIZONTAL:
								thisButtonProps.ml = 6;
								break;
							default:
						}
					}
					let useIconButton = false;
					if (isCollapsed || !additionalButton.text) {
						useIconButton = true;
					}
					if (useIconButton) {
						button = <IconButton
									key={'additionalBtn' + ix}
									onPress={additionalButton.onPress}
									{...buttonProps}
									{...thisButtonProps}
									_icon={{
										...additionalButton._icon,
										color: styles.TAB_ICON_COLOR,
									}}
									_hover={{
										bg: styles.TAB_HOVER_BG,
									}}
									bg={styles.TAB_BG}
									tooltip={additionalButton.text}
								/>;
					} else {
						button = <Button
									key={'additionalBtn' + ix}
									onPress={additionalButton.onPress}
									leftIcon={<Icon
												color={styles.TAB_ICON_COLOR}
												{...additionalButton._icon}
											/>}
									_hover={{
										bg: styles.TAB_HOVER_BG,
									}}
									bg={styles.TAB_BG}
									{...buttonProps}
									{...thisButtonProps}
								>
									<Text
										color={styles.TAB_COLOR}
										fontSize={styles.TAB_FONTSIZE}
										numberOfLines={1}
										ellipsizeMode="head"
										{...textProps}
									>{additionalButton.text}</Text>
								</Button>;
					}
					buttons.push(button);
				});
			}

			return buttons;
		},
		renderCurrentTabContent = () => {
			if (content) {
				return content;
			}

			const currentTabIx = getCurrentTab();
			if (!tabs[currentTabIx]) {
				return null;
			}
			if (!tabs[currentTabIx].content && !tabs[currentTabIx].items) {
				return null;
			}
			if (tabs[currentTabIx].content) {
				return tabs[currentTabIx].content;
			}
			return _.map(tabs[currentTabIx].items, (item, ix) => {
				return React.cloneElement(item, { key: ix });
			});
		};

	useEffect(() => {
		// Restore saved settings
		(async () => {
			let key, val;
			key = id + '-isCollapsed';
			val = await getSaved(key);
			if (!_.isNil(val)) {
				setIsCollapsed(val);
			}

			if (useLocal) {
				key = id + '-currentTabIx';
				val = await getSaved(key);
				if (!_.isNil(val)) {
					setCurrentTab(val);
				}
			}

			if (!isReady) {
				setIsReady(true);
			}
		})();
	}, []);

	if (!isReady) {
		return null;
	}

	const
		renderedTabs = renderTabs(),
		renderedCurrentTabContent = renderCurrentTabContent(),
		renderedToggleButton = !disableCollapse ? renderToggleButton() : null;


	if (direction === VERTICAL) {
		return <Row flex={1} w="100%" {...propsToPass}>
					<Column
						alignItems="center"
						justifyContent="flex-start"
						py={2}
						pl={isCollapsed ? 1 : 4}
						bg={styles.TAB_BAR_BG}
						w={isCollapsed ? '50px' : tabWidth}
					>
						{renderedTabs}
						<Column flex={1} w="100%" justifyContent="flex-end">
							{renderedToggleButton}
						</Column>
					</Column>
					{renderedCurrentTabContent && 
						<Column
							alignItems="center"
							justifyContent="flex-start"
							flex={1}
						>
							{renderedCurrentTabContent}
						</Column>}
				</Row>;
	}

	// HORIZONTAL
	return <Column flex={1} w="100%" {...propsToPass}>
				<Row
					alignItems="center"
					justifyContent="flex-start"
					p={2}
					pb={0}
					bg={styles.TAB_BAR_BG}
					h={isCollapsed ? '30px' : tabHeight}
				>
					{renderedTabs}
					<Row flex={1} h="100%" justifyContent="flex-end">
						<Row h="100%">
							{renderedToggleButton}
						</Row>
					</Row>
				</Row>
				{renderedCurrentTabContent && 
					<Column
						alignItems="center"
						justifyContent="flex-start"
						flex={1}
					>
						{renderedCurrentTabContent}
					</Column>}
			</Column>;
}

export default withComponent(TabBar);