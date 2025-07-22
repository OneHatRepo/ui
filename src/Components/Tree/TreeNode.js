import { useMemo, useEffect, } from 'react';
import {
	Box,
	HStackNative,
	Icon,
	Spinner,
	TextNative,
} from '@project-components/Gluestack';
import * as colourMixer from '@k-renwick/colour-mixer';
import {
	UI_MODE_WEB,
	CURRENT_MODE,
} from '../../Constants/UiModes.js';
import UiGlobals from '../../UiGlobals.js';
import withDraggable from '../Hoc/withDraggable.js';
import IconButton from '../Buttons/IconButton.js';
import { withDragSource, withDropTarget } from '../Hoc/withDnd.js';
import TreeNodeDragHandle from './TreeNodeDragHandle.js';
import testProps from '../../Functions/testProps.js';
import ChevronRight from '../Icons/ChevronRight.js';
import ChevronDown from '../Icons/ChevronDown.js';
import _ from 'lodash';

// Conditional import for web only
let getEmptyImage;
if (CURRENT_MODE === UI_MODE_WEB) {
	import('react-dnd-html5-backend').then((module) => {
		getEmptyImage = module.getEmptyImage;
	}).catch(() => {
		getEmptyImage = null;
	});
}

// This was broken out from Tree simply so we can memoize it

export default function TreeNode(props) {
	const {
			datum,
			nodeProps = {},
			onToggle,
			bg,
			isDragSource,
			isHovered,
			isHighlighted,
			isOver,
			isSelected,
			canDrop,
			draggedItem,
			validateDrop, // same as canDrop (for visual feedback)
			getDragProxy,
			dragSourceRef,
			dragPreviewRef,
			dropTargetRef,
			...propsToPass
		} = props,
		styles = UiGlobals.styles,
		item = datum.item,
		isExpanded = datum.isExpanded,
		isLoading = datum.isLoading,
		isPhantom = item.isPhantom,
		hasChildren = item.hasChildren,
		depth = item.depth,
		text = datum.text,
		content = datum.content,
		icon = datum.icon,
		hash = item?.hash || item;

	// Hide the default drag preview only when using custom drag proxy (and only on web)
	useEffect(() => {
		if (dragPreviewRef && typeof dragPreviewRef === 'function' && getDragProxy && CURRENT_MODE === UI_MODE_WEB) {
			// Only suppress default drag preview when we have a custom one and we're on web
			dragPreviewRef(getEmptyImage(), { captureDraggingState: true });
		}
	}, [dragPreviewRef, getDragProxy]);

	return useMemo(() => {
		let bg = props.nodeProps?.bg || props.bg || styles.TREE_NODE_BG,
			mixWith;
		
		// Determine visual state priority (highest to lowest):
		// 1. Drop target states (when being hovered during drag)
		// 2. Selection states
		// 3. Hover states
		// 4. Highlighted state
		
		// Use custom validation for enhanced visual feedback, fallback to React DnD's canDrop
		let actualCanDrop = canDrop;
		if (isOver && draggedItem && validateDrop) {
			actualCanDrop = validateDrop(draggedItem);
		}
		
		if (isOver && actualCanDrop) {
			// Valid drop target - show positive feedback
			mixWith = styles.TREE_NODE_DROP_VALID_BG || '#4ade80'; // green-400 fallback
		// } else if (isOver && actualCanDrop === false) {
		// 	// Invalid drop target - show negative feedback
		// 	mixWith = styles.TREE_NODE_DROP_INVALID_BG || '#f87171'; // red-400 fallback
		} else if (isSelected) {
			if (isHovered) {
				mixWith = styles.TREE_NODE_SELECTED_BG_HOVER;
			} else {
				mixWith = styles.TREE_NODE_SELECTED_BG;
			}
		} else if (isHovered) {
			mixWith = styles.TREE_NODE_BG_HOVER;
		} else if (isHighlighted) {
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
			flex-1
			grow-1
			select-none
			cursor-pointer
		`;
		
		// Add drop state classes for additional styling
		if (isOver && actualCanDrop) {
			className += ' TreeNode--dropValid border-2 border-green-400';
		// } else if (isOver && actualCanDrop === false) {
		// 	className += ' TreeNode--dropInvalid border-2 border-red-400';
		}
		
		if (props.className) {
			className += ' ' + props.className;
		}
	
		return <HStackNative
					{...testProps('node' + (isSelected ? '-selected' : ''))}
					{...nodeProps}
					key={hash}
					className={className}
					style={{
						backgroundColor: bg,
					}}
					ref={(element) => {
						// Attach both drag and drop refs to the same element
						if (dragSourceRef && typeof dragSourceRef === 'function') {
							dragSourceRef(element);
						}
						if (dropTargetRef && dropTargetRef.current !== undefined) {
							// dropTargetRef is a ref object, not a callback
							dropTargetRef.current = element;
						}
					}}
				>
					{isPhantom && <Box t={0} l={0} className="absolute bg-[#f00] h-[2px] w-[2px]" />}
					
					{isDragSource && <TreeNodeDragHandle />}

					{hasChildren && <IconButton
										{...testProps('expandBtn')}
										icon={isExpanded ? ChevronDown : ChevronRight}
										onPress={(e) => onToggle(datum, e)}
										className="ml-2"
									/>}
					
					{isLoading && <Spinner className="px-2" />}

					{!isLoading && icon && <Icon as={icon} className="ml-2 mr-1" />}

					{text && <TextNative
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
									select-none
									${styles.TREE_NODE_CLASSNAME}
								`}
								style={{
									userSelect: 'none',
								}}
							>{text}</TextNative>}

					{content}

				</HStackNative>;
	}, [
		nodeProps,
		bg,
		item,
		hash, // this is an easy way to determine if the data has changed and the item needs to be rerendered
		isDragSource,
		isExpanded,
		isHighlighted,
		isLoading,
		isOver,
		isPhantom,
		isSelected,
		hasChildren,
		depth,
		text,
		content,
		onToggle,
		canDrop,
		draggedItem,
		validateDrop,
		dragSourceRef,
		dragPreviewRef,
		dropTargetRef,
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

export const DragSourceTreeNode = withDragSource(TreeNode);
export const DropTargetTreeNode = withDropTarget(TreeNode);
export const DragSourceDropTargetTreeNode = withDropTarget(withDragSource(TreeNode));
