import React, { useState, } from 'react';
import {
	Button,
	Column,
	Icon,
	Pressable,
	Row,
	Text,
} from 'native-base';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../Constants/Directions';
import styles from '../../Constants/Styles';
import Panel from './Panel';
import _ from 'lodash';


export default function TabPanel(props) {
	const {
			tabs = [],
			direction = HORIZONTAL,
			tabWidth = 150, // used on VERTICAL mode only
			additionalButtons,
			...propsToPass
		} = props,
		[currentTab, setCurrentTab] = useState(0),
		renderTabs = () => {
			const
				buttons = [],
				textProps = {},
				buttonProps = {
					bg: styles.TAB_BG,
					color: styles.TAB_COLOR,
					fontSize: styles.TAB_FONTSIZE,
					textAlign: 'left',
				};
			switch(direction) {
				case VERTICAL:
					buttonProps.borderLeftRadius = 4;
					buttonProps.borderRightRadius = 0;
					buttonProps.w = '100%';
					buttonProps.mb = 1;
					textProps.borderLeftRadius = 4;
					textProps.w = '100%';
					textProps.py = 2;
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
			_.each(tabs, (tab, ix) => {
				const
					isCurrentTab = ix === currentTab,
					thisButtonProps = {};
				if (tab._icon) {
					thisButtonProps.leftIcon = <Icon
													color={isCurrentTab ? styles.TAB_ACTIVE_ICON_COLOR : styles.TAB_ICON_COLOR}
													{...tab._icon}
												/>
				}
				buttons.push(<Button
								key={ix}
								onPress={() => setCurrentTab(ix)}
								{...buttonProps}
								{...thisButtonProps}
								bg={isCurrentTab ? styles.TAB_ACTIVE_BG : styles.TAB_BG}
								color={isCurrentTab ? styles.TAB_ACTIVE_COLOR : styles.TAB_COLOR}
							>
								<Text
									fontSize={styles.TAB_FONTSIZE}
									numberOfLines={1}
									ellipsizeMode="head"
									{...textProps}
								>{tab.title}</Text>
							</Button>);
			});
			if (additionalButtons) {
				_.each(additionalButtons, (additionalButton, ix) => {
					const thisButtonProps = {};
					if (!ix) {
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
					
					additionalButton = React.cloneElement(additionalButton, { key: 'btn-' + ix, ...buttonProps, ...thisButtonProps, });
					buttons.push(additionalButton);
				});
			}
			return buttons;
		},
		renderContent = () => {
			if (tabs[currentTab].content) {
				return tabs[currentTab].content;
			}
			return _.map(tabs[currentTab].items, (item, ix) => {
				return React.cloneElement(item, { key: ix });
			});
		};

		if (direction === VERTICAL) {
			return <Panel {...propsToPass}>
						<Row flex={1} w="100%">
							<Column
								alignItems="center"
								justifyContent="flex-start"
								py={2}
								pl={4}
								bg={styles.TAB_BAR_BG}
								w={tabWidth}
							>
								{renderTabs()}
							</Column>
							{renderContent()}
						</Row>
					</Panel>;
		}
		return <Panel {...propsToPass} {...props._panel}>
					<Column flex={1} w="100%">
						<Row
							alignItems="center"
							justifyContent="flex-start"
							p={2}
							pb={0}
							bg={styles.TAB_BAR_BG}
						>
							{renderTabs()}
						</Row>
						{renderContent()}
					</Column>
				</Panel>;
}