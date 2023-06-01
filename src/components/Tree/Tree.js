import React, { useState, useEffect, useRef, useMemo, } from 'react';
import {
	Column,
	FlatList,
	Pressable,
	Icon,
	Row,
	Text,
} from 'native-base';
import {
	SELECTION_MODE_SINGLE,
	SELECTION_MODE_MULTI,
} from '../../Constants/Selection.js';
import {
	VERTICAL,
} from '../../Constants/Directions.js';
import {
	DROP_POSITION_BEFORE,
	DROP_POSITION_AFTER,
} from '../../Constants/Tree.js';
import * as colourMixer from '@k-renwick/colour-mixer'
import UiGlobals from '../../UiGlobals.js';
import useForceUpdate from '../../Hooks/useForceUpdate.js';
import withContextMenu from '../Hoc/withContextMenu.js';
import withAlert from '../Hoc/withAlert.js';
import withData from '../Hoc/withData.js';
import withEvents from '../Hoc/withEvents.js';
import withSideEditor from '../Hoc/withSideEditor.js';
import withFilters from '../Hoc/withFilters.js';
import withPresetButtons from '../Hoc/withPresetButtons.js';
import withMultiSelection from '../Hoc/withMultiSelection.js';
import withSelection from '../Hoc/withSelection.js';
import withWindowedEditor from '../Hoc/withWindowedEditor.js';
import withInlineEditor from '../Hoc/withInlineEditor.js';
import testProps from '../../Functions/testProps.js';
import nbToRgb from '../../Functions/nbToRgb.js';
import TreeHeaderRow from './TreeHeaderRow.js';
import TreeNode, { ReorderableTreeNode } from './TreeNode.js';
import IconButton from '../Buttons/IconButton.js';
import PaginationToolbar from '../Toolbar/PaginationToolbar.js';
import NoRecordsFound from './NoRecordsFound.js';
import Toolbar from '../Toolbar/Toolbar.js';
import NoReorderRows from '../Icons/NoReorderRows.js';
import ReorderRows from '../Icons/ReorderRows.js';
import _ from 'lodash';


// Tree requires the use of HOC withSelection() whenever it's used.
// The default export is *with* the HOC. A separate *raw* component is
// exported which can be combined with many HOCs for various functionality.

export function Tree(props) {
	const {
			isRootVisible = true,
			getChildParams = () => { // returns params needed to get child nodes from server (getEquipment, getRentalEquipment, etc). This is primarily to limit results, as different kinds of views are only interested in certain types of nodes in the returned data.
				return {};
			},
			getNodeText = (item) => { // extracts model/data and decides what the row text should be
				return item.displayValue;
			},
			getNodeType, // extracts model/data and decides what kind of node this should be. Helper for getNodeIcon
			getNodeIcon,
			nodeProps = (item) => {
				return {};
			},
			noneFoundText,
			disableLoadingIndicator = false,
			disableSelectorSelected = false,
			showHovers = true,
			canNodesReorder = false,
			allowToggleSelection = true, // i.e. single click with no shift key toggles the selection of the node clicked on
			disableBottomToolbar = false,
			bottomToolbar = null,
			topToolbar = null,
			additionalToolbarButtons = [],

			// withEditor
			onAdd,
			onEdit,
			onDelete,
			onView,
			onDuplicate,
			onReset,
			onContextMenu,

			// withData
			Repository,
			data,
			fields,
			idField,
			displayField,
			idIx,
			displayIx,

			// withSelection
			selection,
			setSelection,
			selectionMode,
			removeFromSelection,
			addToSelection,
			deselectAll,
			selectRangeTo,
			isInSelection,
			noSelectorMeansNoResults = false,

			// DataMgt
			selectorId,
			selectorSelected,

		} = props,
		styles = UiGlobals.styles,
		forceUpdate = useForceUpdate(),
		treeRef = useRef(),
		[isReady, setIsReady] = useState(false),
		[isLoading, setIsLoading] = useState(false),
		[isReorderMode, setIsReorderMode] = useState(false),
		[treeNodeData, setTreeNodeData] = useState({}),
		[dragNodeSlot, setDragNodeSlot] = useState(null),
		[dragNodeIx, setDragNodeIx] = useState(),
		onNodeClick = (item, e) => {
			const
				{
					shiftKey,
					metaKey,
				 } = e;
				
			if (selectionMode === SELECTION_MODE_MULTI) {
				if (shiftKey) {
					if (isInSelection(item)) {
						removeFromSelection(item);
					} else {
						selectRangeTo(item);
					}
				} else if (metaKey) {
					if (isInSelection(item)) {
						// Already selected
						if (allowToggleSelection) {
							removeFromSelection(item);
						} else {
							// Do nothing.
						}
					} else {
						addToSelection(item);
					}
				} else {
					if (isInSelection(item)) {
						// Already selected
						if (allowToggleSelection) {
							removeFromSelection(item);
						} else {
							// Do nothing.
						}
					} else {
						// select just this one
						setSelection([item]);
					}
				}
			} else {
				// selectionMode is SELECTION_MODE_SINGLE
				let newSelection = selection;
				if (isInSelection(item)) {
					// Already selected
					if (allowToggleSelection) {
						// Create empty selection
						newSelection = [];
					} else {
						// Do nothing.
					}
				} else {
					// Select it alone
					newSelection = [item];
				}
				if (newSelection) {
					setSelection(newSelection);
				}
			}
		},
		onRefresh = () => {
			if (!Repository) {
				return;
			}
			const promise = Repository.reload();
			if (promise) { // Some repository types don't use promises
				promise.then(() => {
					setIsLoading(false);
					forceUpdate();
				});
			}
		},
		getFooterToolbarItems = () => {
			const
				iconButtonProps = {
					_hover: {
						bg: 'trueGray.400',
					},
					mx: 1,
					px: 3,
				},
				iconProps = {
					alignSelf: 'center',
					size: styles.TREE_TOOLBAR_ITEMS_ICON_SIZE,
					h: 20,
					w: 20,
				},
				items = _.map(additionalToolbarButtons, (config, ix) => {
					let {
							text,
							handler,
							icon = null,
							isDisabled = false,
						} = config;
					if (icon) {
						const thisIconProps = {
							color: isDisabled ? styles.TREE_TOOLBAR_ITEMS_DISABLED_COLOR : styles.TREE_TOOLBAR_ITEMS_COLOR,
						};
						icon = React.cloneElement(icon, {...iconProps, ...thisIconProps});
					}
					return <IconButton
								key={ix}
								{...iconButtonProps}
								onPress={handler}
								icon={icon}
								isDisabled={isDisabled}
								tooltip={text}
							/>;
				});
			if (canNodesReorder) {
				items.unshift(<IconButton
					key="reorderBtn"
					{...iconButtonProps}
					onPress={() => setIsReorderMode(!isReorderMode)}
					icon={<Icon as={isReorderMode ? NoReorderRows : ReorderRows} color={styles.TREE_TOOLBAR_ITEMS_COLOR} />}
				/>);
			}
			return items;
		},
		renderNode = (itemData) => {
			const item = itemData.item;
			if (item.isDestroyed) {
				return null;
			}


			// TODO: Figure out these vars
			// icon (optional)
			// onToggle (handler for if expand/collapse icon is clicked)



			let nodeProps = getNodeProps && !isHeaderNode ? getNodeProps(item) : {},
				isSelected = !isHeaderNode && isInSelection(item);

			return <Pressable
						// {...testProps(Repository ? Repository.schema.name + '-' + item.id : item.id)}
						onPress={(e) => {
							if (e.preventDefault && e.cancelable) {
								e.preventDefault();
							}
							if (isReorderMode) {
								return
							}
							switch (e.detail) {
								case 1: // single click
									onNodeClick(item, e); // sets selection
									break;
								case 2: // double click
									if (!isSelected) { // If a row was already selected when double-clicked, the first click will deselect it,
										onNodeClick(item, e); // so reselect it
									}
									if (onEdit) {
										onEdit();
									}
									break;
								case 3: // triple click
									break;
								default:
							}
						}}
						onLongPress={(e) => {
							if (e.preventDefault && e.cancelable) {
								e.preventDefault();
							}
							if (isReorderMode) {
								return
							}
							
							// context menu
							const selection = [item];
							setSelection(selection);
							if (onContextMenu) {
								onContextMenu(item, e, selection, setSelection);
							}
						}}
						flexDirection="row"
						flexGrow={1}
					>
						{({
							isHovered,
							isFocused,
							isPressed,
						}) => {
							let bg = nodeProps.bg || styles.TREE_NODE_BG,
								mixWith;
							if (isSelected) {
								if (showHovers && isHovered) {
									mixWith = styles.TREE_NODE_SELECTED_HOVER_BG;
								} else {
									mixWith = styles.TREE_NODE_SELECTED_BG;
								}
							} else if (showHovers && isHovered) {
								mixWith = styles.TREE_NODE_HOVER_BG;
							}
							if (mixWith) {
								const
									mixWithObj = nbToRgb(mixWith),
									ratio = mixWithObj.alpha ? 1 - mixWithObj.alpha : 0.5;
								bg = colourMixer.blend(bg, ratio, mixWithObj.color);
							}
							let WhichTreeNode = TreeNode,
								rowReorderProps = {};
							if (canNodesReorder && isReorderMode) {
								WhichTreeNode = ReorderableTreeNode;
								rowReorderProps = {
									mode: VERTICAL,
									onDragStart: onNodeReorderDragStart,
									onDrag: onNodeReorderDrag,
									onDragStop: onNodeReorderDragStop,
									proxyParent: treeRef.current?.getScrollableNode().children[0],
									proxyPositionRelativeToParent: true,
									getParentNode: (node) => node.parentElement.parentElement.parentElement,
									getProxy: getReorderProxy,
								};
							}
							
							return <WhichTreeNode
										nodeProps={nodeProps}
										bg={bg}
										itemData={itemData}

										icon={icon}
										onToggle={onToggle}

										// fields={fields}
										// hideNavColumn={hideNavColumn}
										{...rowReorderProps}
									/>;
						}}
					</Pressable>;
		},
		buildTreeNode = (itemData) => {
			// this one is to be used recursively on children

			// isVisible // skip if not visible, just return keyed array

			// renderNode(itemData);

		},
		buildTreeNodes = () => {

			// const entities = Repository ? (Repository.isRemote ? Repository.entities : Repository.getEntitiesOnPage()) : data;
			// let rowData = _.clone(entities); // don't use the original array, make a new one so alterations to it are temporary

			const
				rootEntity = Repository.getRootEntity(),
				rootNode = buildTreeNode(rootEntity);




			return rootNode;
		},
		getChildren = (node_id, depth) => {
			// Calls getChildParams(), then submits to server
			// Server returns this for each node:
			// hasChildren (so view can show/hide caret)
			// model (e.g. "Fleet", "Equipment)
			// data (json encoded representation of entity)
			
		},

		// Button handlers
		expandPath = (path) => {} // - drills down the tree based on path (usually given by server). Path would be a list of sequential IDs (3/35/263/1024)
		collapseOne = (node_id) => {},
		collapseAll = () => {},
		expandOne = (node_id) => {},
		expandAll = () => {},

		// Drag/Drop
		getReorderProxy = (node) => {
			const
				row = node.parentElement.parentElement,
				rowRect = row.getBoundingClientRect(),
				parent = row.parentElement,
				parentRect = parent.getBoundingClientRect(),
				proxy = row.cloneNode(true),
				top = rowRect.top - parentRect.top,
				dragNodeIx = Array.from(parent.children).indexOf(row)
			
			setDragNodeIx(dragNodeIx); // the ix of which record is being dragged

			proxy.style.top = top + 'px';
			proxy.style.left = '20px';
			proxy.style.height = rowRect.height + 'px';
			proxy.style.width = rowRect.width + 'px';
			proxy.style.display = 'flex';
			// proxy.style.backgroundColor = '#ccc';
			proxy.style.position = 'absolute';
			proxy.style.border = '1px solid #000';
			return proxy;
		},
		onNodeReorderDragStart = (info, e, proxy, node) => {
			// console.log('onNodeReorderDragStart', info, e, proxy, node);
			const
				proxyRect = proxy.getBoundingClientRect(),
				row = node.parentElement.parentElement,
				parent = row.parentElement,
				parentRect = parent.getBoundingClientRect(),
				rows = _.filter(row.parentElement.children, (childNode) => {
					return childNode.getBoundingClientRect().height !== 0; // Skip zero-height children
				}),
				currentY = proxyRect.top - parentRect.top, // top position of pointer, relative to page
				headerNodeIx = showHeaders ? 0 : null,
				firstActualNodeIx = showHeaders ? 1 : 0;

			// Figure out which index the user wants
			let newIx = 0;
			_.each(rows, (child, ix, all) => {
				const
					rect = child.getBoundingClientRect(), // rect of the row of this iteration
					{
						top,
						bottom,
						height,
					} = rect,
					compensatedTop = top - parentRect.top,
					compensatedBottom = bottom - parentRect.top,
					halfHeight = height / 2;

				if (ix === headerNodeIx || child === proxy) {
					return;
				}
				if (ix === firstActualNodeIx) {
					// first row
					if (currentY < compensatedTop + halfHeight) {
						newIx = firstActualNodeIx;
						return false;
					} else if (currentY < compensatedBottom) {
						newIx = firstActualNodeIx + 1;
						return false;
					}
					return;
				} else if (ix === all.length -1) {
					// last row
					if (currentY < compensatedTop + halfHeight) {
						newIx = ix;
						return false;
					}
					newIx = ix +1;
					return false;
				}
				
				// all other rows
				if (compensatedTop <= currentY && currentY < compensatedTop + halfHeight) {
					newIx = ix;
					return false;
				} else if (currentY < compensatedBottom) {
					newIx = ix +1;
					return false;
				}
			});

			let useBottom = false;
			if (!rows[newIx] || rows[newIx] === proxy) {
				newIx--;
				useBottom = true;
			}

			// Render marker showing destination location
			const
				rowContainerRect = rows[newIx].getBoundingClientRect(),
				top = (useBottom ? rowContainerRect.bottom : rowContainerRect.top) - parentRect.top - parseInt(parent.style.borderWidth), // get relative Y position
				treeNodesContainer = treeRef.current._listRef._scrollRef.childNodes[0],
				treeNodesContainerRect = treeNodesContainer.getBoundingClientRect(),
				marker = document.createElement('div');

			marker.style.position = 'absolute';
			marker.style.top = top -4 + 'px'; // -4 so it's always visible
			marker.style.height = '4px';
			marker.style.width = treeNodesContainerRect.width + 'px';
			marker.style.backgroundColor = '#f00';

			treeNodesContainer.appendChild(marker);

			setDragNodeSlot({ ix: newIx, marker, useBottom, });
		},
		onNodeReorderDrag = (info, e, proxy, node) => {
			// console.log('onNodeReorderDrag', info, e, proxy, node);
			const
				proxyRect = proxy.getBoundingClientRect(),
				row = node.parentElement.parentElement,
				parent = row.parentElement,
				parentRect = parent.getBoundingClientRect(),
				rows = _.filter(row.parentElement.children, (childNode) => {
					return childNode.getBoundingClientRect().height !== 0; // Skip zero-height children
				}),
				currentY = proxyRect.top - parentRect.top, // top position of pointer, relative to page
				headerNodeIx = showHeaders ? 0 : null,
				firstActualNodeIx = showHeaders ? 1 : 0;

			// Figure out which index the user wants
			let newIx = 0;
			_.each(rows, (child, ix, all) => {
				const
					rect = child.getBoundingClientRect(), // rect of the row of this iteration
					{
						top,
						bottom,
						height,
					} = rect,
					compensatedTop = top - parentRect.top,
					compensatedBottom = bottom - parentRect.top,
					halfHeight = height / 2;

				if (ix === headerNodeIx || child === proxy) {
					return;
				}
				if (ix === firstActualNodeIx) {
					// first row
					if (currentY < compensatedTop + halfHeight) {
						newIx = firstActualNodeIx;
						return false;
					} else if (currentY < compensatedBottom) {
						newIx = firstActualNodeIx + 1;
						return false;
					}
					return;
				} else if (ix === all.length -1) {
					// last row
					if (currentY < compensatedTop + halfHeight) {
						newIx = ix;
						return false;
					}
					newIx = ix +1;
					return false;
				}
				
				// all other rows
				if (compensatedTop <= currentY && currentY < compensatedTop + halfHeight) {
					newIx = ix;
					return false;
				} else if (currentY < compensatedBottom) {
					newIx = ix +1;
					return false;
				}
			});

			let useBottom = false;
			if (!rows[newIx] || rows[newIx] === proxy) {
				newIx--;
				useBottom = true;
			}

			// Render marker showing destination location (can't use regular render cycle because this div is absolutely positioned on page)
			const
				rowContainerRect = rows[newIx].getBoundingClientRect(),
				top = (useBottom ? rowContainerRect.bottom : rowContainerRect.top) - parentRect.top - parseInt(parent.style.borderWidth); // get relative Y position
			let marker = dragNodeSlot && dragNodeSlot.marker;
			if (marker) {
				marker.style.top = top -4 + 'px'; // -4 so it's always visible
			}

			setDragNodeSlot({ ix: newIx, marker, useBottom, });
			// console.log('onNodeReorderDrag', newIx);

		},
		onNodeReorderDragStop = (delta, e, config) => {
			// console.log('onNodeReorderDragStop', delta, e, config);
			const
				dropIx = dragNodeSlot.ix,
				compensatedDragIx = showHeaders ? dragNodeIx -1 : dragNodeIx, // ix, without taking header row into account
				compensatedDropIx = showHeaders ? dropIx -1 : dropIx, // // ix, without taking header row into account
				dropPosition = dragNodeSlot.useBottom ? DROP_POSITION_AFTER : DROP_POSITION_BEFORE;

			let shouldMove = true,
				finalDropIx = compensatedDropIx;
			
			if (dropPosition === DROP_POSITION_BEFORE) {
				if (dragNodeIx === dropIx || dragNodeIx === dropIx -1) { // basically before or after the drag row's origin
					// Same as origin; don't do anything
					shouldMove = false;
				} else {
					// Actually move it
					if (!Repository) { // If we're just going to be switching rows, rather than telling server to reorder rows, so maybe adjust finalDropIx...
						if (finalDropIx > compensatedDragIx) { // if we're dropping *before* the origin ix
							finalDropIx = finalDropIx -1; // Because we're using BEFORE, we want to switch with the row *prior to* the ix we're dropping before
						}
					}
				}
			} else if (dropPosition === DROP_POSITION_AFTER) {
				// Only happens on the very last row. Everything else is BEFORE...
				if (dragNodeIx === dropIx) {
					// Same as origin; don't do anything
					shouldMove = false;
				}
			}

			if (shouldMove) {
				// Update the row with the new ix
				let dragRecord,
					dropRecord;
				if (Repository) {
					dragRecord = Repository.getByIx(compensatedDragIx);
					dropRecord = Repository.getByIx(finalDropIx);
					
					Repository.reorder(dragRecord, dropRecord, dropPosition);

				} else {
					function arrayMove(arr, fromIndex, toIndex) {
						var element = arr[fromIndex];
						arr.splice(fromIndex, 1);
						arr.splice(toIndex, 0, element);
					}
					arrayMove(data, compensatedDragIx, finalDropIx);
				}
			}

			if (dragNodeSlot) {
				dragNodeSlot.marker.remove();
			}
			setDragNodeSlot(null);
		};
		
	useEffect(() => {


		function buildTreeNodeData() {
			// Take the Repository and build up the tree node data from its entities
			const
				entities = Repository.entities,
				treeNodes = {};

			// TODO: Get root node?
			// I'm thinking if a repository senses that it's a tree, then at initial load
			// it should get the root node +1 level of children.
			//
			// How would it then subsequently get the proper children?
			// i.e. When a node gets its children, how will it do this
			// while maintaining the nodes that already exist there?
			// We don't want it to *replace* all exisitng nodes!
			//
			// And if the repository does a reload, should it just get root+1 again?
			// Changing filters would potentially change the tree structure.
			// Changing sorting would only change the ordering, not what is expanded/collapsed or visible/invisible.

			// include the following on each node
			// - item
			// - isExpanded,
			// - isVisible,
			// - hasChildren,
			// - children
			// - depth,
			// - text,

			// Need to take into account whether using Repository or data.
			// If using data, everything exists at once. What format will data be in?
			// How does this interface with Repository?
			// Maybe if Repository is not AjaxRepository, everything needs to be present at once!


			return treeNodes;
		}

		function buildAndSetTreeNodeData() {
			setTreeNodeData(buildTreeNodeData());
		}

		if (!isReady) {
			buildAndSetTreeNodeData();
			setIsReady(true);
		}
		if (!Repository) {
			return () => {};
		}

		// set up @onehat/data repository
		const
			setTrue = () => setIsLoading(true),
			setFalse = () => setIsLoading(false),
			onChangeFilters = () => {
				if (!Repository.isAutoLoad) {
					Repository.reload();
				}
			},
			onChangeSorters = () => {
				if (!Repository.isAutoLoad) {
					Repository.reload();
				}
			};

		Repository.on('beforeLoad', setTrue);
		Repository.on('load', setFalse);
		Repository.ons(['changePage', 'changePageSize',], deselectAll);
		Repository.ons(['changeData', 'change'], buildAndSetTreeNodeData);
		Repository.on('changeFilters', onChangeFilters);
		Repository.on('changeSorters', onChangeSorters);


		return () => {
			Repository.off('beforeLoad', setTrue);
			Repository.off('load', setFalse);
			Repository.offs(['changePage', 'changePageSize',], deselectAll);
			Repository.offs(['changeData', 'change'], buildAndSetTreeNodeData);
			Repository.off('changeFilters', onChangeFilters);
			Repository.off('changeSorters', onChangeSorters);
		};
	}, []);

	useEffect(() => {
		if (!Repository) {
			return () => {};
		}
		if (!disableSelectorSelected && selectorId) {
			let id = selectorSelected?.id;
			if (_.isEmpty(selectorSelected)) {
				id = noSelectorMeansNoResults ? 'NO_MATCHES' : null;
			}
			Repository.filter(selectorId, id, false); // so it doesn't clear existing filters
		}

	}, [selectorId, selectorSelected]);

	const footerToolbarItemComponents = useMemo(() => getFooterToolbarItems(), [additionalToolbarButtons, isReorderMode]);

	if (!isReady) {
		return null;
	}

	// Actual TreeNodes
	const treeNodes = buildTreeNodes();

	// headers & footers
	let treeFooterComponent = null;
	if (!disableBottomToolbar) {
		if (Repository && bottomToolbar === 'pagination' && !disablePagination && Repository.isPaginated) {
			treeFooterComponent = <PaginationToolbar Repository={Repository} toolbarItems={footerToolbarItemComponents} />;
		} else if (footerToolbarItemComponents.length) {
			treeFooterComponent = <Toolbar>{footerToolbarItemComponents}</Toolbar>;
		}
	}
	
	return <Column
				{...testProps('Tree')}
				flex={1}
				w="100%"
			>
				{topToolbar}

				<Column w="100%" flex={1} borderTopWidth={isLoading ? 2 : 1} borderTopColor={isLoading ? '#f00' : 'trueGray.300'} onClick={() => {
					if (!isReorderMode) {
						deselectAll();
					}
				}}>
					{!treeNodes.length ? <NoRecordsFound text={noneFoundText} onRefresh={onRefresh} /> :
						treeNodes}
				</Column>

				{treeFooterComponent}

			</Column>;

}

export const SideTreeEditor = withAlert(
									withEvents(
										withData(
											// withMultiSelection(
												withSelection(
													withSideEditor(
														withFilters(
															withPresetButtons(
																withContextMenu(
																	Tree
																)
															)
														)
													)
												)
											// )
										)
									)
								);

export const WindowedTreeEditor = withAlert(
									withEvents(
										withData(
											// withMultiSelection(
												withSelection(
													withWindowedEditor(
														withFilters(
															withPresetButtons(
																withContextMenu(
																	Tree
																)
															)
														)
													)
												)
											// )
										)
									)
								);

export default WindowedTreeEditor;
