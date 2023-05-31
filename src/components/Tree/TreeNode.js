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
import FolderClosed from '../Icons/FolderClosed.js';
import FolderOpen from '../Icons/FolderOpen.js';
import File from '../Icons/File.js';
import _ from 'lodash';

// This was broken out from Tree simply so we can memoize it

export default function TreeNode(props) {
	const {
			nodeProps,
			bg,
			entity,
			isExpanded,
			isVisible,
			hasChildren,
			isSelected,
			isHovered,
			depth,
			type,
			text,
			// icon,
			onToggle,
			onSelect,
		} = props,
		styles = UiGlobals.styles,
		isPhantom = entity.isPhantom,
		hash = entity?.hash || entity;

		const icon = props.icon || (hasChildren ? (isExpanded ? <FolderOpen /> : <FolderClosed />) : <File />);

		return useMemo(() => {
			
			return <Row
						alignItems="center"
						flexGrow={1}
						{...nodeProps}
						bg={bg}
						key={hash}
					>
						{isPhantom && <Box position="absolute" bg="#f00" h={2} w={2} t={0} l={0} />}
						
						{icon}

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
			entity,
			isPhantom,
			hash, // this is an easy way to determine if the data has changed and the entity needs to be rerendered
			isExpanded,
			isVisible,
			hasChildren,
			isSelected,
			isHovered,
			depth,
			type,
			text,
			// props.icon,
			onToggle,
			onSelect,
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
