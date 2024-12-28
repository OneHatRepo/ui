import { useMemo, } from 'react';
import {
	Box,
	Icon,
	Row,
	Spinner,
	Text,
} from 'native-base';
import UiGlobals from '../../UiGlobals.js';
import withDraggable from '../Hoc/withDraggable.js';
import IconButton from '../Buttons/IconButton.js';
import testProps from '../../Functions/testProps.js';
import _ from 'lodash';

// This was broken out from Tree simply so we can memoize it

export default function TreeNode(props) {
	const {
			nodeProps = {},
			bg,
			datum,
			onToggle,
			isDragMode,
			isHighlighted,
			isSelected,
			...propsToPass
		} = props,
		styles = UiGlobals.styles,
		item = datum.item,
		isPhantom = item.isPhantom,
		isExpanded = datum.isExpanded,
		isLoading = datum.isLoading,
		hasChildren = item.hasChildren,
		depth = item.depth,
		text = datum.text,
		content = datum.content,
		iconCollapsed = datum.iconCollapsed,
		iconExpanded = datum.iconExpanded,
		iconLeaf = datum.iconLeaf,
		hash = item?.hash || item;

	const
		icon = hasChildren ? (isExpanded ? iconExpanded : iconCollapsed) : iconLeaf,
		adjustedBg = isHighlighted ? styles.TREE_NODE_HIGHLIGHTED_BG : bg;

	return useMemo(() => {
		
		return <Row
					{...testProps('node' + (isSelected ? '-selected' : ''))}
					alignItems="center"
					flexGrow={1}
					{...nodeProps}
					bg={adjustedBg}
					key={hash}
				>
					{isPhantom && <Box position="absolute" bg="#f00" h={2} w={2} t={0} l={0} />}
					
					{isLoading ? 
						<Spinner px={2} /> : 
						(hasChildren && !isDragMode ? 
							<IconButton
								icon={icon}
								onPress={(e) => onToggle(datum, e)}
								{...testProps('expandBtn')}
							/> : <Icon as={icon} px={2} />)}
					
					{text ? <Text
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
							>{text}</Text> : null}

					{content}

				</Row>;
	}, [
		nodeProps,
		adjustedBg,
		item,
		isPhantom,
		hash, // this is an easy way to determine if the data has changed and the item needs to be rerendered
		isExpanded,
		hasChildren,
		depth,
		text,
		content,
		icon,
		onToggle,
		isLoading,
		isDragMode,
		isHighlighted,
	]);
}

function withAdditionalProps(WrappedComponent) {
	return (props) => {
		return <WrappedComponent
					isDraggable={true}
					{...props}
				/>;
	};
}

export const DraggableTreeNode = withAdditionalProps(withDraggable(TreeNode));
