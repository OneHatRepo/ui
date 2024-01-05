import React, { useState, useEffect, useId, } from 'react';
import {
	Button,
	Column,
	Icon,
	Row,
	ScrollView,
	Text,
} from 'native-base';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../Constants/Directions.js';
import UiGlobals from '../../UiGlobals.js';
import getComponentFromType from '../../Functions/getComponentFromType.js';
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
			tabHeight = '47px', // used on HORIZONTAL mode only
			additionalButtons,
			initialTabIx = 0,
			currentTabIx,
			disableCollapse = false,
			startsCollapsed = true,
			onChangeCurrentTab,
			onChangeIsCollapsed,
			onPressTab,
			onTabClose,
			self,
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
				if (onPressTab) {
					onPressTab(ix); // for when an already shown tab is pressed
				}
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
				const tabIcon = _.clone(tab._icon);
				if (tabIcon.as && _.isString(tabIcon.as)) {
					const Type = getComponentFromType(tabIcon.as);
					if (Type) {
						tabIcon.as = Type;
					}
				}
				let closeBtn;
				if (onTabClose && !tab.disableCloseBox) {
					closeBtn = <IconButton
									key={'tabCloseButton' + ix}
									onPress={() => onTabClose(ix)}
									icon={Xmark}
									_icon={{
										color: isCurrentTab ? styles.TAB_ACTIVE_ICON_COLOR : styles.TAB_ICON_COLOR,
										...iconProps,
									}}
									tooltip="Close Tab"
									p={0}
								/>;
				}
				if (useIconButton) {
					button = <IconButton
								key={'tabIconButton' + ix}
								onPress={() => setCurrentTab(ix)}
								{...buttonProps}
								// {...thisButtonProps}
								_icon={{
									color: isCurrentTab ? styles.TAB_ACTIVE_ICON_COLOR : styles.TAB_ICON_COLOR,
									...iconProps,
									...tabIcon,
								}}
								_hover={{
									bg: isCurrentTab? styles.TAB_ACTIVE_HOVER_BG : styles.TAB_HOVER_BG,
								}}
								bg={isCurrentTab ? styles.TAB_ACTIVE_BG : styles.TAB_BG}
								tooltip={tab.title}
							/>;
					// button = <Row
					// 			key={'tab' + ix}
					// 		>
					// 			{button}
					// 		</Row>;
				} else {
					button = <Button
								key={'tabButton' + ix}
								onPress={() => setCurrentTab(ix)}
								leftIcon={<Icon
											color={isCurrentTab ? styles.TAB_ACTIVE_ICON_COLOR : styles.TAB_ICON_COLOR}
											{...iconProps}
											{...tabIcon}
										/>}
								// endIcon={<Icon
								// 			color={isCurrentTab ? styles.TAB_ACTIVE_ICON_COLOR : styles.TAB_ICON_COLOR}
								// 			{...iconProps}
								// 			{...tabIcon}
								// 		/>}
								endIcon={closeBtn}
								{...buttonProps}
								{...thisButtonProps}
								_hover={{
									bg: isCurrentTab? styles.TAB_ACTIVE_HOVER_BG : styles.TAB_HOVER_BG,
								}}
								bg={isCurrentTab ? styles.TAB_ACTIVE_BG : styles.TAB_BG}
								direction="row"
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

	if (self) {
		self.getCurrentTab = getCurrentTab;
		self.setCurrentTab = setCurrentTab;
		self.setIsCollapsed = setIsCollapsed;
	}

	const
		renderedTabs = renderTabs(),
		renderedCurrentTabContent = renderCurrentTabContent(),
		renderedToggleButton = !disableCollapse ? renderToggleButton() : null;

	let tabBar = null;
	if (direction === VERTICAL) {
		tabBar = <Column
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
					</Column>;
		if (renderedCurrentTabContent) {
			tabBar = <Row flex={1} w="100%" {...propsToPass}>
						{tabBar}
						<Column
							alignItems="center"
							justifyContent="flex-start"
							flex={1}
						>
							{renderedCurrentTabContent}
						</Column>
					</Row>;
		}
	}
	if (direction === HORIZONTAL) {
		tabBar = <Row
					alignItems="center"
					justifyContent="flex-start"
					p={2}
					pb={0}
					bg={styles.TAB_BAR_BG}
					h={isCollapsed ? '38px' : tabHeight}
				>
					<ScrollView
						horizontal={true}
						h={isCollapsed ? '30px' : tabHeight}
					>
						{renderedTabs}
					</ScrollView>
					<Row flex={1} h="100%" justifyContent="flex-end">
						<Row h="100%">
							{renderedToggleButton}
						</Row>
					</Row>
				</Row>;
		if (renderedCurrentTabContent) {
			tabBar = <Column flex={1} w="100%" {...propsToPass}>
						{tabBar}
						<Column
							alignItems="center"
							justifyContent="flex-start"
							flex={1}
						>
							{renderedCurrentTabContent}
						</Column>
					</Column>;
		}
	}
	return tabBar;
}

export default withComponent(TabBar);