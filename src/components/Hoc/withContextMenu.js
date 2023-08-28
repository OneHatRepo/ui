import React, { useState, useEffect, } from 'react';
import {
	Box,
	Column,
	FlatList,
	Icon,
	Modal,
	Pressable,
	Row,
	Spacer,
	Text,
} from 'native-base';
import _ from 'lodash';

export default function withContextMenu(WrappedComponent) {
	return (props) => {
		const {
				// extract and pass
				disableContextMenu = false,
				contextMenuItems,
				...propsToPass
			} = props,
			{
				// for local use
				selection,
				setSelection, // in case it's ever needed!
			} = props,
			[isReady, setIsReady] = useState(false),
			[isContextMenuShown, setIsContextMenuShown] = useState(false),
			[contextMenuX, setContextMenuX] = useState(0),
			[contextMenuY, setContextMenuY] = useState(0),
			[contextMenuItemComponents, setContextMenuItemComponents] = useState([]),
			onContextMenu = (entity, e, selection, setSelection) => {
				if (disableContextMenu) {
					return;
				}
				if (!selection.length && entity) {
					// No current selections, so select this row so operations apply to it
					setSelection([entity]);
				}
				
				setIsContextMenuShown(true);
				setContextMenuX(e.nativeEvent.pageX);
				setContextMenuY(e.nativeEvent.pageY);
			};

		useEffect(() => {
			const contextMenuItemComponents = _.map(contextMenuItems, (config, ix) => {
				let {
					text,
					handler,
					icon = null,
					isDisabled = false,
				} = config;
				
				if (icon) {
					const iconProps = {
						alignSelf: 'center',
						size: 'sm',
						color: isDisabled ? 'disabled' : 'trueGray.800',
						h: 20,
						w: 20,
						mr: 2,
					};
					icon = React.cloneElement(icon, {...iconProps});
				}

				// <div style={{
				// 	userSelect: 'none',
				// }}>
				// </div>

				return <Pressable
							key={ix}
							onPress={() => {
								setIsContextMenuShown(false);
								handler();
							}}
							flexDirection="row"
							borderBottomWidth={1}
							borderBottomColor="trueGray.200"
							py={2}
							px={4}
							_hover={{
								bg: '#ffc',
							}}
							isDisabled={isDisabled}
							style={{
								userSelect: 'none',
							}}
							userSelect="none"
						>
							{icon}
							<Text
								flex={1}
								color={isDisabled ? 'disabled' : 'trueGray.800'}
								numberOfLines={1}
								ellipsizeMode="head"
								style={{
									userSelect: 'none',
								}}
								userSelect="none"
							>{text}</Text>
						</Pressable>;
			});
			const showId = true; // TODO: This should only be for local dev
			if (showId) {
				contextMenuItemComponents.push(<Text
													key="idViewer"
													flex={1}
													py={2}
													px={4}
													userSelect="none"
												>id: {selection?.[0]?.id}</Text>);
			}
			setContextMenuItemComponents(contextMenuItemComponents);
			
			if (!isReady) {
				setIsReady(true);
			}
		}, [contextMenuItems, setIsContextMenuShown]);

		if (!isReady) {
			return null;
		}

		return <>
					<WrappedComponent
						{...propsToPass}
						onContextMenu={onContextMenu}
					/>
					<Modal
						isOpen={isContextMenuShown && !disableContextMenu}
						onClose={() => setIsContextMenuShown(false)}
					>
						<Column bg="#fff" w={180} position="absolute" top={contextMenuY} left={contextMenuX}>
							{contextMenuItemComponents}
						</Column>
					</Modal>
				</>;
	};
}