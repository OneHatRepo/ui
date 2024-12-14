import { useMemo, } from 'react';
import {
	Box,
	HStack,
	Icon,
	Spinner,
	TextNative,
} from '@project-components/Gluestack';
import * as colourMixer from '@k-renwick/colour-mixer';
import UiGlobals from '../../UiGlobals.js';
import withDraggable from '../Hoc/withDraggable.js';
import IconButton from '../Buttons/IconButton.js';
import testProps from '../../Functions/testProps.js';
import _ from 'lodash';

// This was broken out from Tree simply so we can memoize it

export default function TreeNode(props) {
	const {
			datum,
			nodeProps = {},
			onToggle,
			isSelected,
			isHovered,
			isDragMode,
			isHighlighted,
			bg,
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
		iconCollapsed = datum.iconCollapsed,
		iconExpanded = datum.iconExpanded,
		iconLeaf = datum.iconLeaf,
		hash = item?.hash || item;

	return useMemo(() => {
		const icon = hasChildren ? (isExpanded ? iconExpanded : iconCollapsed) : iconLeaf;
		let bg = props.bg || styles.TREE_NODE_BG,
			mixWith;
		if (isSelected) {
			if (isHovered) {
				mixWith = styles.TREE_NODE_SELECTED_BG_HOVER;
			} else {
				mixWith = styles.TREE_NODE_SELECTED_BG;
			}
		} else if (isHovered) {
			mixWith = styles.TREE_NODE_BG_HOVER;
		}
		if (isHighlighted) {
			mixWith = styles.TREE_NODE_HIGHLIGHTED_BG;
		}
		if (mixWith) {
			// const
			// 	mixWithObj = gsToHex(mixWith),
			// 	ratio = mixWithObj.alpha ? 1 - mixWithObj.alpha : 0.5;
			// bg = colourMixer.blend(bg, ratio, mixWithObj.color);
			bg = colourMixer.blend(bg, 0.5, mixWith);
		}

		let className = `
			TreeNode
			items-center
			flex
			flex-1
			grow-1
		`;
		if (props.className) {
			className += ' ' + props.className;
		}
	
		return <HStack
					{...testProps('node' + (isSelected ? '-selected' : ''))}
					{...nodeProps}
					key={hash}
					className={className}
					style={{
						backgroundColor: bg,
					}}
				>
					{isPhantom && <Box t={0} l={0} className="absolute bg-[#f00] h-[2px] w-[2px]" />}
					
					{isLoading ? 
						<Spinner className="px-2" /> : 
						(hasChildren && !isDragMode ? 
							<IconButton
								{...testProps('expandBtn')}
								icon={icon}
								onPress={(e) => onToggle(datum, e)}
							/> : 
							<Icon as={icon} className="ml-4 mr-1" />)}

					<TextNative
						numberOfLines={1}
						ellipsizeMode="head"
						// {...propsToPass}
						className={`
							TreeNode-TextNative
							self-center
							overflow-hidden
							flex
							flex-1
							text-ellipsis
							${styles.TREE_NODE_CLASSNAME}
						`}
						style={{ userSelect: 'none', }}
					>{text}</TextNative>

				</HStack>;
	}, [
		nodeProps,
		bg,
		item,
		hash, // this is an easy way to determine if the data has changed and the item needs to be rerendered
		isDragMode,
		isHighlighted,
		isSelected,
		isPhantom,
		isExpanded,
		isLoading,
		hasChildren,
		depth,
		text,
		onToggle,
		isLoading,
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
