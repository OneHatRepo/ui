import { cloneElement, useState, useEffect, } from 'react';
import {
	HStack,
	HStackNative,
	ScrollView,
	VStack,
	VStackNative,
} from '@project-components/Gluestack';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../Constants/Directions.js';
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
					buttonProps: {
						className: buttonPropsClassName,
						...buttonPropsToPass
					},
					textProps: {
						className: textPropsClassName,
						...textPropsToPass
					},
					iconProps: {
						className: iconPropsClassName,
						...iconPropsToPass
					},
				} = getButtonProps();

			let buttonClassName = buttonPropsClassName,
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
							{...buttonPropsToPass}
							icon={icon}
							_icon={_icon}
							className={buttonClassName}
							tooltip={isCollapsed ? 'Expand' : 'Collapse'}
						/>;
			} else {
				buttonClassName += `
					w-[200px]
					pr-0
					mr-0
				`;
				_icon.as = Minimize;
				button = <Button
							{...testProps('toggleBtn')}
							key="toggleBtn"
							onPress={onPress}
							{...buttonPropsToPass}
							icon={icon}
							_icon={_icon}
							className={buttonClassName}
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
		getButtonProps = () => {
			const
				buttonProps = {
					className: `
						${styles.TAB_BG}
						${isCollapsed ? 'justify-center' : 'justify-start'}
						${styles.TAB_BG_HOVER}
						${styles.TAB_BG_ACTIVE}
						${styles.TAB_BG_DISABLED}
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
						${styles.TAB_ICON_COLOR_HOVER}
						${styles.TAB_ICON_COLOR_ACTIVE}
						${styles.TAB_ICON_COLOR_DISABLED}
					`,
				};
			switch(direction) {
				case VERTICAL:
					buttonProps.className += `
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
					buttonProps.className += `
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
				buttonProps,
				textProps,
				iconProps,
			};
		},
		renderTabs = () => {
			const {
					buttonProps: {
						className: buttonPropsClassName,
						...buttonPropsToPass
					},
					textProps: {
						className: textPropsClassName,
						...textPropsToPass
					},
					iconProps: {
						className: iconPropsClassName,
						...iconPropsToPass
					},
				} = getButtonProps(),
				buttons = [];
				
			_.each(tabs, (tab, ix) => {
				if (!tab.icon) {
					throw new Error('tab.icon required!');
				}
				const
					isCurrentTab = ix === getCurrentTab(),
					useIconButton = (isCollapsed || !tab.title),
					tabIcon = tab._icon ? _.clone(tab._icon) : {};
				if (tabIcon.as && _.isString(tabIcon.as)) {
					const Type = getComponentFromType(tabIcon.as);
					if (Type) {
						tabIcon.as = Type;
					}
				}

				let buttonClassName = buttonPropsClassName,
					textClassName = textPropsClassName,
					iconClassName = iconPropsClassName;

				if (isCurrentTab) {
					buttonClassName += ' ' + styles.TAB_BG_CURRENT + 
										' ' + styles.TAB_BG_CURRENT_HOVER;
					iconClassName += ' ' + styles.TAB_ICON_COLOR_CURRENT;
					textClassName += ' ' + styles.TAB_COLOR_CURRENT;
				}

				// overrides
				if (tab._button?.className) {
					buttonClassName += ' ' + tab._button.className;
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

				let button;
				if (useIconButton) {
					button = <IconButton
								{...testProps(tab.path)}
								key={'tabIconBtn' + ix}
								onPress={onPress}
								{...buttonPropsToPass}
								icon={tab.icon}
								_icon={_icon}
								className={buttonClassName}
								tooltip={tab.title}
							/>;
				} else {
					if (direction === VERTICAL) {
						buttonClassName += ' w-[200px]';
					}

					let closeBtn = null;
					if (onTabClose && !tab.disableCloseBox) {
						closeBtn = <IconButton
										{...testProps('tabCloseButton-' + ix)}
										key={'tabCloseButton' + ix}
										onPress={() => onTabClose(ix)}
										icon={Xmark}
										_icon={{
											...iconProps,
											className: iconClassName,
										}}
										tooltip="Close Tab"
										className="p-0"
									/>;
					}
					button = <Button
								{...testProps(tab.path)}
								key={'tabBtn' + ix}
								onPress={onPress}
								{...buttonPropsToPass}
								icon={tab.icon}
								_icon={_icon}
								rightIcon={closeBtn}
								className={buttonClassName}
								text={tab.title}
								_text={{
									className: textClassName,
									...textPropsToPass,
								}}
								action="none"
								variant="none"
							/>;
				}
				buttons.push(button);
			});

			if (additionalButtons) {
				_.each(additionalButtons, (additionalButton, ix) => {
					if (!additionalButton._icon) {
						throw new Error('additionalButton._icon required!');
					}

					const
						useIconButton = (isCollapsed || !additionalButton.text),
						additionalButtonIcon = _.clone(additionalButton._icon);

					if (additionalButtonIcon.as && _.isString(additionalButtonIcon.as)) {
						const Type = getComponentFromType(additionalButtonIcon.as);
						if (Type) {
							additionalButtonIcon.as = Type;
						}
					}

					let buttonClassName = buttonPropsClassName,
						textClassName = textPropsClassName,
						iconClassName = iconPropsClassName;

					// overrides
					if (additionalButton._button?.className) {
						buttonClassName += ' ' + additionalButton._button.className;
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
								buttonClassName += ' mt-6';
								break;
							case HORIZONTAL:
								buttonClassName += ' ml-6';
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
					if (useIconButton) {
						button = <IconButton
									{...testProps('additionalBtn' + ix)}
									key={'additionalBtn' + ix}
									onPress={onPress}
									{...buttonPropsToPass}
									_icon={_icon}
									className={buttonClassName}
									tooltip={additionalButton.text}
								/>;
					} else {
						if (direction === VERTICAL) {
							buttonClassName += ' w-[200px]';
						}
						button = <Button
									{...testProps('additionalBtn' + ix)}
									key={'additionalBtn' + ix}
									onPress={onPress}
									{...buttonPropsToPass}
									_icon={_icon}
									className={buttonClassName}
									text={additionalButton.text}
									_text={{
										className: textClassName,
										...textPropsToPass,
									}}
									action="none"
									variant="none"
								/>;
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
						${styles.TAB_BAR_CLASSNAME}
					`}
				>
					{renderedTabs}
					<VStack className="flex-1 w-full justify-end">
						{renderedToggleButton}
					</VStack>
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
						${isCollapsed ? 'h-[38px]' : 'h-[' + tabHeight + 'px]'}
						items-center
						justify-start
						p-1
						pb-0
						${styles.TAB_BAR_CLASSNAME}
					`}
				>
					<ScrollView
						horizontal={true}
						className={` ${isCollapsed ? "h-[30px]" : 'h-[' + tabHeight + 'px]'} `}
					>
						{renderedTabs}
					</ScrollView>
					<HStack className="flex-1 h-full justify-end">
						<HStack className="h-full">
							{renderedToggleButton}
						</HStack>
					</HStack>
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