/**
 * This file is categorized as "Proprietary Framework Code"
 * and is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { useState, useEffect, } from 'react';
import {
	Icon,
	Input,
	Menu,
	Pressable,
	Row,
} from 'native-base';
import {
	FontAwesome5,
} from '@expo/vector-icons';
import testProps from '../functions/testProps';
import _ from 'lodash';

export default function ComboBox(props) {

	const {
			name = 'comboBox',
			value,
			onChangeValue = () => {},
			onChangeId = () => {},
			Repository = {},
		} = props,
		entities = Repository.entities,
		[menuItems, setMenuItems] = useState([]),
		[menuWidth, setMenuWidth] = useState(100),
		[triggerSize, setTriggerSize] = useState({ height: 50, width: 50, }),
		onChangeText = (value) => {
			onChangeValue(value);

			const selectedEntity = _.find(entities, (entity) => {
				return entity.value === value
			});
			onChangeId(selectedEntity && selectedEntity.id);
		},
		onSelect = (value) => {
			const selectedEntity = _.find(entities, (entity) => entity.id === value);
			onChangeId(selectedEntity && selectedEntity.id);
			onChangeValue(selectedEntity && selectedEntity.value);
		},
		prepareMenuItems = () => {
			const menuItems = _.map(entities, (entity) => {
				return <Menu.Item key={entity.id} onPress={() => onSelect(entity.id)}>{entity.value}</Menu.Item>;
			});
			setMenuItems(menuItems);
		};
	
	useEffect(() => {
		prepareMenuItems();
	}, [Repository.entities]);

	return <Row justifyContent="center" alignItems="center" onLayout={e => setMenuWidth(e.nativeEvent.layout.width - triggerSize.width)}>
				<Input
					{...testProps(name)}
					flex={1}
					fontSize={20}
					value={value}
					onChangeText={onChangeText}
					borderTopRightRadius={0}
					borderBottomRightRadius={0}
					{...props._text}
					m={0}
				/>
				<Menu
					placement="left top"
					w={menuWidth + 'px'}
					top={triggerSize.height}
					trigger={triggerProps => {
						return <Pressable
									{...testProps(name + 'Trigger')}
									borderWidth={1}
									borderColor="#bbb"
									bg="#fff"
									h="100%"
									p={2}
									borderRightRadius="md"
									colorScheme="primary"
									flexDirection="row"
									justifyContent="center"
									alignItems="center"
									onLayout={e => setTriggerSize(e.nativeEvent.layout)}
									{...triggerProps}
								>
									<Icon as={FontAwesome5} name="chevron-down" color="primary.800" size="sm" />
								</Pressable>;
						}
					}
				>{menuItems}</Menu>
			</Row>;
}