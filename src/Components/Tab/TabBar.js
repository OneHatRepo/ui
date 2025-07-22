import { cloneElement, useState, useEffect, } from 'react';
import {
	Box,
	HStack,
	HStackNative,
	Icon,
	ScrollView,
	VStack,
	VStackNative,
} from '@project-components/Gluestack';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../Constants/Directions.js';
import Tab from './Tab.js';
import TabButton from './TabButton.js';
import Button from '../Buttons/Button.js';
import UiGlobals from '../../UiGlobals.js';
import getComponentFromType from '../../Functions/getComponentFromType.js';
import testProps from '../../Functions/testProps.js';
import withComponent from '../Hoc/withComponent.js';
import IconButton from '../Buttons/IconButton.js';
import Minimize from '../Icons/Minimize.js';
import Maximize from '../Icons/Maximize.js';
import getSaved from '../../Functions/getSaved.js';
import setSaved from '../../Functions/setSaved.js';
import _ from 'lodash';


function TabBar(props) {
	const {
			tabs = [], // { _icon, title, content, path, items, }
			content, // e.g. Expo Router slot
			direction = HORIZONTAL,
			tabWidth = 150, // used on VERTICAL mode only
			tabHeight = 47, // used on HORIZONTAL mode only
			additionalButtons,
			initialTabIx = 0,
			currentTabIx,
			disableCollapse = false,
			startsCollapsed = true,
			canToggleCollapse = true,
			tabsAreButtons = true,
			onChangeCurrentTab,
			onChangeIsCollapsed,
			onPressTab,
			onTabClose,
			self,
			...propsToPass
		} = props,
		styles = UiGlobals.styles,
		id = props.id || props.self?.path,
		useLocal = _.isNil(currentTabIx),
		[isReady, setIsReady] = useState(false),
		[currentTabIxLocal, setCurrentTabIxLocal] = useState(initialTabIx),
		[isCollapsed, setIsCollapsedRaw] = useState(startsCollapsed),
		setIsCollapsed = (isCollapsed) => {
			setIsCollapsedRaw(isCollapsed);
			if (onChangeIsCollapsed) {
				onChangeIsCollapsed(isCollapsed);
			}
			if (id) {
				setSaved(id + '-isCollapsed', isCollapsed);
			}
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
			if (tabs[currentTabIx]?.content) {
				tabs[currentTabIx].content = null; // free up memory by clearing rendered content
			}
			if (useLocal) {
				setCurrentTabIxLocal(ix);

				if (id) {
					setSaved(id + '-currentTabIx', ix);
				}
			}
			if (onChangeCurrentTab) {
				onChangeCurrentTab(ix);
			}
		},
		renderToggleButton = () => {
			const {
					tabProps: {
						className: tabPropsClassName,
						...tabPropsToPass
					},
					textProps: {
						className: textPropsClassName,
						...textPropsToPass
					},
					iconProps: {
						className: iconPropsClassName,
						...iconPropsToPass
					},
				} = getTabProps();

			let tabClassName = tabPropsClassName,
				textClassName = textPropsClassName,
				iconClassName = iconPropsClassName;
			
			const
				icon = Maximize,
				_icon = {
					...iconPropsToPass,
					className: iconClassName,
				},
				onPress = () => setIsCollapsed(!isCollapsed);
			let button;
			if (isCollapsed) {
				button = <IconButton
							{...testProps('toggleBtn')}
							key="toggleBtn"
							onPress={onPress}
							{...tabPropsToPass}
							icon={icon}
							_icon={_icon}
							className={tabClassName}
							tooltip={isCollapsed ? 'Expand' : 'Collapse'}
						/>;
			} else {
				tabClassName += `
					${direction === VERTICAL ? 'w-[200px]' : ''}
					pr-0
					mr-0
				`;
				_icon.as = Minimize;
				button = <Button
							{...testProps('toggleBtn')}
							key="toggleBtn"
							onPress={onPress}
							{...tabPropsToPass}
							icon={icon}
							_icon={_icon}
							className={tabClassName}
							text="Collapse"
							_text={{
								className: textClassName,
								...textPropsToPass,
							}}
							action="none"
							variant="none"
						/>;
			}
			return button;
		},
		getTabProps = () => {
			const
				tabProps = {
					className: `
						${styles.TAB_BG}
						${isCollapsed ? 'justify-center' : 'justify-start'}
					`,
				},
				textProps = {
					// numberOfLines: 1,
					// ellipsizeMode: 'head',
					className: `
						${styles.TAB_FONTSIZE}
						${styles.TAB_COLOR}
					`,
				},
				iconProps = {
					// size: 'md',
					className: `
						${styles.TAB_ICON_COLOR}
					`,
				};
			switch(direction) {
				case VERTICAL:
					tabProps.className += `
						rounded-l-lg
						rounded-r-none
						w-full
						ml-2
						mr-0
						mb-1
						px-4
					`;
					textProps.className += `
						w-full
						mr-0
						mb-1
						py-0
						pl-3
						pr-0
						flex-1
						text-left
					`;
					break;
				case HORIZONTAL:
					tabProps.className += `
						rounded-t
						rounded-b-none
						mr-1
						py-1
					`;
					textProps.className += `
						px-1
						py-0
						mr-1
					`;
					break;
				default:
			}
			return {
				tabProps,
				textProps,
				iconProps,
			};
		},
		renderTabs = () => {
			const {
					tabProps: {
						className: tabPropsClassName,
						...tabPropsToPass
					},
					textProps: {
						className: textPropsClassName,
						...textPropsToPass
					},
					iconProps: {
						className: iconPropsClassName,
						...iconPropsToPass
					},
				} = getTabProps(),
				tabComponents = [];
				
			_.each(tabs, (tab, ix) => {
				if (!tab.icon) {
					throw new Error('tab.icon required!');
				}
				const
					isCurrentTab = ix === getCurrentTab(),
					useIconTab = (isCollapsed || !tab.title),
					tabIcon = tab._icon ? [...tab._icon] : {};
				if (tabIcon.as && _.isString(tabIcon.as)) {
					const Type = getComponentFromType(tabIcon.as);
					if (Type) {
						tabIcon.as = Type;
					}
				}

				let tabClassName = tabPropsClassName,
					textClassName = textPropsClassName,
					iconClassName = iconPropsClassName;

				// overrides
				if (tab._button?.className) {
					tabClassName += ' ' + tab._button.className;
				}
				if (tab._text?.className) {
					textClassName += ' ' + tab._text.className;
				}
				if (tab._icon?.className) {
					iconClassName += ' ' + tab._icon.className;
				}

				const
					_icon = {
						...iconPropsToPass,
						...tabIcon,
						className: iconClassName,
					},
					onPress = () => setCurrentTab(ix);

				const WhichTabType = tabsAreButtons ? TabButton : Tab
				tabComponents.push(<WhichTabType
										{...testProps(tab.path)}
										key={'tab' + ix}
										onPress={onPress}
										{...tabPropsToPass}
										icon={tab.icon}
										_icon={_icon}
										className={tabClassName}
										tooltip={tab.title}
										text={tab.title}
										_text={{
											className: textClassName,
											...textPropsToPass,
										}}
										isDisabled={tab.isDisabled}
										isCurrentTab={isCurrentTab}
										useIconOnly={useIconTab}
										direction={direction}
										useCloseBtn={onTabClose && !tab.disableCloseBox}
										onClose={() => onTabClose(ix)}
									/>);
			});

			if (additionalButtons) {
				_.each(additionalButtons, (additionalButton, ix) => {
					if (!additionalButton._icon) {
						throw new Error('additionalButton._icon required!');
					}

					const
						useIconTab = (isCollapsed || !additionalButton.text),
						additionalButtonIcon = [...additionalButton._icon];

					if (additionalButtonIcon.as && _.isString(additionalButtonIcon.as)) {
						const Type = getComponentFromType(additionalButtonIcon.as);
						if (Type) {
							additionalButtonIcon.as = Type;
						}
					}

					let tabClassName = tabPropsClassName,
						textClassName = textPropsClassName,
						iconClassName = iconPropsClassName;

					// overrides
					if (additionalButton._button?.className) {
						tabClassName += ' ' + additionalButton._button.className;
					}
					if (additionalButton._text?.className) {
						textClassName += ' ' + additionalButton._text.className;
					}
					if (additionalButton._icon?.className) {
						iconClassName += ' ' + additionalButton._icon.className;
					}

					if (!ix) {
						// First button should have a gap before it
						switch(direction) {
							case VERTICAL:
								tabClassName += ' mt-6';
								break;
							case HORIZONTAL:
								tabClassName += ' ml-6';
								break;
							default:
						}
					}

					const
						_icon = {
							...iconPropsToPass,
							...additionalButton._icon,
							className: iconClassName,
						},
						onPress = additionalButton.onPress;

					let button;
					if (useIconTab) {
						button = <IconButton
									{...testProps('additionalBtn' + ix)}
									key={'additionalBtn' + ix}
									onPress={onPress}
									{...tabPropsToPass}
									_icon={_icon}
									className={tabClassName}
									tooltip={additionalButton.text}
								/>;
					} else {
						if (direction === VERTICAL) {
							tabClassName += ' w-[200px]';
						}
						button = <Button
									{...testProps('additionalBtn' + ix)}
									key={'additionalBtn' + ix}
									onPress={onPress}
									{...tabPropsToPass}
									_icon={_icon}
									className={tabClassName}
									text={additionalButton.text}
									_text={{
										className: textClassName,
										...textPropsToPass,
									}}
									action="none"
									variant="none"
								/>;
					}
					tabComponents.push(button);
				});
			}

			return tabComponents;
		},
		renderCurrentTabContent = () => {
			if (content) {
				return content;
			}

			const currentTabIx = getCurrentTab();
			if (!tabs[currentTabIx]) {
				return null;
			}

			const currentTab = tabs[currentTabIx];
			if (!currentTab.content && !currentTab.items) {
				return null;
			}
			
			if (currentTab.content) {
				return currentTab.content;
			}
			return _.map(currentTab.items, (item, ix) => {
				return cloneElement(item, { key: ix });
			});
		};

	useEffect(() => {
		// Restore saved settings
		(async () => {

			if (id) {
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
		tabBar = <VStackNative
					{...testProps('TabBar')}
					{...propsToPass}
					className={`
						${isCollapsed ? 'w-[50px]' : 'w-[' + tabWidth + 'px]'}
						${isCollapsed ? 'pl-1' : 'pl-4'}
						items-center
						justify-start
						py-2
						overflow-x-hidden
						overflow-y-auto
						${styles.TAB_BAR_CLASSNAME}
					`}
				>
					{renderedTabs}
					{canToggleCollapse ? 
						<VStack className="flex-1 w-full justify-end">
							{renderedToggleButton}
						</VStack> : null}
				</VStackNative>;
		if (renderedCurrentTabContent) {
			tabBar = <HStackNative {...propsToPass} className="flex-1 w-full">
						{tabBar}
						<VStack className="items-center justify-start flex-1">
							{renderedCurrentTabContent}
						</VStack>
					</HStackNative>;
		}
	}
	if (direction === HORIZONTAL) {
		tabBar = <HStackNative
					{...testProps('TabBar')}
					className={`
						${'h-[' + tabHeight + 'px]'}
						items-center
						justify-start
						overflow-x-auto
						overflow-y-hidden
						p-1
						pb-0
						${styles.TAB_BAR_CLASSNAME}
					`}
				>
					<ScrollView
						horizontal={true}
						className={'h-[' + tabHeight + 'px]'}
					>
						{renderedTabs}
					</ScrollView>
					{canToggleCollapse ? 
						<HStack className="flex-1 h-full justify-end">
							<HStack className="h-full">
								{renderedToggleButton}
							</HStack>
						</HStack> : null}
				</HStackNative>;
		if (renderedCurrentTabContent) {
			tabBar = <VStackNative {...propsToPass} className="flex-1 w-full">
						{tabBar}
						<VStack className="items-center justify-start flex-1">
							{renderedCurrentTabContent}
						</VStack>
					</VStackNative>;
		}
	}
	return tabBar;
}

export default withComponent(TabBar);