import React, { useState, useEffect, } from 'react';
import {
	Box,
	Column,
	Input,
	Menu,
	Pressable,
	Row,
	Text,
} from 'native-base';
import {
	SELECTION_MODE_SINGLE,
	SELECTION_MODE_MULTI,
} from '../../constants/Selection';
import Grid from '../Grid/Grid';
import useForceUpdate from '../../hooks/useForceUpdate';
import IconButton from '../Buttons/IconButton';
import CaretDown from '../Icons/CaretDown';
import _ from 'lodash';

// Combo requires the use of HOC withSelection() whenever it's used.
// This is the *raw* component that can be combined with many HOCs
// for various functionality.

export default function Combo(props) {
	const {
		defaultSelection,
		selection,
		setSelection,
		value,
		Repository,
		selectionMode,
		menuWidth = 200,
		menuHeight = 200,
		autoSelectFirstItem,
		disableReloadOnChangeFilters,
	} = props,
	// entities = Repository && Repository.entities,
	forceUpdate = useForceUpdate(),
	[isReady, setIsReady] = useState(false),
	[isLoading, setIsLoading] = useState(false),
	[isMenuShown, setIsMenuShown] = useState(false),
	[height, setHeight] = useState(0),
	// [menuItems, setMenuItems] = useState([]),
	// [menuWidth, setMenuWidth] = useState(100),
	// [triggerSize, setTriggerSize] = useState({ height: 50, width: 50, }),
	onChangeText = (value) => {
		// onChangeValue(value);

		// const selectedEntity = _.find(entities, (entity) => {
		// 	return entity.value === value
		// });
		// onChangeId(selectedEntity && selectedEntity.id);
	},
	onSelect = (value) => {
		// const selectedEntity = _.find(entities, (entity) => entity.id === value);
		// onChangeId(selectedEntity && selectedEntity.id);
		// onChangeValue(selectedEntity && selectedEntity.value);
	};
	
	useEffect(() => {
		if (!Repository) {
			return () => {};
		}
		const
			setTrue = () => setIsLoading(true),
			setFalse = () => setIsLoading(false),
			resetSelection = () => {
				setSelection([]);
			},
			onChangeFilters = () => {
				if (!Repository.autoLoad && Repository.isLoaded && !disableReloadOnChangeFilters) {
					Repository.reload();
				}
			};

		Repository.on('beforeLoad', setTrue);
		Repository.on('load', setFalse);
		Repository.ons(['changePage', 'changePageSize',], resetSelection);
		Repository.ons(['changeData', 'change'], forceUpdate);
		Repository.on('changeFilters', onChangeFilters);

		if (autoSelectFirstItem) {
			setSelection([0]);
		}
		
		// // prepare menu items
		// const menuItems = _.map(entities, (entity) => {
		// 	return <Menu.Item key={entity.id} onPress={() => onSelect(entity.id)}>{entity.value}</Menu.Item>;
		// });
		// setMenuItems(menuItems);
	
		setIsReady(true);
		
		return () => {
			Repository.off('beforeLoad', setTrue);
			Repository.off('load', setFalse);
			Repository.offs(['changePage', 'changePageSize',], resetSelection);
			Repository.offs(['changeData', 'change'], forceUpdate);
			Repository.off('changeFilters', onChangeFilters);
		};
	}, [Repository]);

	if (!isReady) {
		return null;
	}

	console.log('height', height);
	return <Row justifyContent="center" alignItems="center" h="40px" onLayout={(e) => {
		const height = e.nativeEvent.layout.height;
		setHeight(height);
	}}>
				<Input
					flex={1}
					fontSize={20}
					value={value}
					onChangeText={onChangeText}
					borderTopRightRadius={0}
					borderBottomRightRadius={0}
					{...props._text}
					m={0}
				/>
				<IconButton
					_icon={{
						as: CaretDown,
						color: 'primary.800',
						size: 'sm',
					}}
					onPress={() => setIsMenuShown(!isMenuShown)}
					h="100%"
					borderWidth={1}
					borderColor="#bbb"
					borderLeftWidth={0}
					borderLeftRadius={0}
					borderRightRadius="md"
					_hover={{
						bg: 'trueGray.300',
					}}
				/>
				{isMenuShown && <Box
									position="absolute"
									top={height + 'px'}
									left={0}
									h={menuHeight}
									w={menuWidth}
									borderWidth={1}
									borderColor='trueGray.200'
								>
									<Grid {...props} />
								</Box>}
			</Row>;
}