import React, { useState, } from 'react';
import {
	Column,
	Pressable,
	Row,
	Text,
} from 'native-base';
import {
	HEADER_PX,
	HEADER_PY,
	HEADER_TEXT_FONTSIZE,
	HEADER_TEXT_COLOR,
} from '../../../constants/HeaderFooter';
import Panel from './Panel';
import _ from 'lodash';


export default function TabPanel(props) {
	const {
			tabs = [],
			...propsToPass
		} = props,
		[currentTab, setCurrentTab] = useState(0),
		renderTabs = () => {
			return _.map(tabs, (tab, ix) => {
				const isCurrentTab = ix === currentTab;
				return <Pressable
							onPress={() => setCurrentTab(ix)}
						>
							<Text
								mx={1}
								px={3}
								py={1}
								bg={isCurrentTab ? 'trueGray.200' : 'primary.300'}
								fontSize={HEADER_TEXT_FONTSIZE}
								color={isCurrentTab ? 'primary.800' : HEADER_TEXT_COLOR}
							>{tab.title}</Text>
						</Pressable>
			});
		},
		renderItems = () => {
			return _.map(tabs[currentTab].items, (item, ix) => {
				return React.cloneElement(item, { key: ix });
			});
		};

		return <Panel {...propsToPass}>
					<Column flex={1} w="100%">
						<Row
							alignItems="center"
							justifyContent="flex-start"
							p={2}
							pb={0}
							bg="primary.700"
						>
							{renderTabs()}
						</Row>
						{renderItems()}
					</Column>
				</Panel>;
}