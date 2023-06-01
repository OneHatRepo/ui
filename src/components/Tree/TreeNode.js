import { useState, useMemo, } from 'react';
import {
	Box,
	Row,
	Text,
} from 'native-base';
import {
	VERTICAL,
} from '../../Constants/Directions.js';
import UiGlobals from '../../UiGlobals.js';
import withDraggable from '../Hoc/withDraggable.js';
import IconButton from '../Buttons/IconButton.js';
import FolderClosed from '../Icons/FolderClosed.js';
import FolderOpen from '../Icons/FolderOpen.js';
import File from '../Icons/File.js';
import _ from 'lodash';

// This was broken out from Tree simply so we can memoize it

export default function TreeNode(props) {
	const {
			nodeProps,
			bg,
			itemData,
			onToggle,
		} = props,
		styles = UiGlobals.styles,
		item = itemData.item,
		isPhantom = item.isPhantom,
		isExpanded = itemData.isExpanded,
		hasChildren = itemData.hasChildren,
		depth = itemData.depth,
		text = itemData.text,
		hash = item?.hash || item;

		const icon = props.icon || (hasChildren ? (isExpanded ? <FolderOpen /> : <FolderClosed />) : <File />);

		return useMemo(() => {
			
			return <Row
						alignItems="center"
						flexGrow={1}
						{...nodeProps}
						bg={bg}
						key={hash}
						pl={(depth * 10) + 'px'}
					>
						{isPhantom && <Box position="absolute" bg="#f00" h={2} w={2} t={0} l={0} />}
						
						<IconButton
							icon={icon}
							onPress={onToggle}
						/>

						<Text
							key={key}
							overflow="hidden"
							textOverflow="ellipsis"
							alignSelf="center"
							style={{ userSelect: 'none', }}
							fontSize={styles.TREE_NODE_FONTSIZE}
							px={styles.TREE_NODE_PX}
							py={styles.TREE_NODE_PY}
							numberOfLines={1}
							ellipsizeMode="head"
							{...propsToPass}
						>{text}</Text>

					</Row>;
		}, [
			nodeProps,
			bg,
			item,
			isPhantom,
			hash, // this is an easy way to determine if the data has changed and the item needs to be rerendered
			isExpanded,
			isVisible,
			hasChildren,
			depth,
			text,
			// props.icon,
			onToggle,
		]);
}

function withAdditionalProps(WrappedComponent) {
	return (props) => {
		return <WrappedComponent
					mode={VERTICAL}
					{...props}
				/>;
	};
}

export const ReorderableTreeNode = withAdditionalProps(withDraggable(TreeNode));
