import { useState, useEffect, useRef, useMemo, } from 'react';
import {
	Column,
	FlatList,
	Modal,
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
import testProps from '../../Functions/testProps.js';
import nbToRgb from '../../Functions/nbToRgb.js';
import TreeNode, { ReorderableTreeNode } from './TreeNode.js';
import FormPanel from '../Panel/FormPanel.js';
import Input from '../Form/Field/Input.js';
import IconButton from '../Buttons/IconButton.js';
import Dot from '../Icons/Dot.js';
import Collapse from '../Icons/Collapse.js';
import FolderClosed from '../Icons/FolderClosed.js';
import FolderOpen from '../Icons/FolderOpen.js';
import MagnifyingGlass from '../Icons/MagnifyingGlass.js';
import NoReorderRows from '../Icons/NoReorderRows.js';
import ReorderRows from '../Icons/ReorderRows.js';
import PaginationToolbar from '../Toolbar/PaginationToolbar.js';
import NoRecordsFound from '../Grid/NoRecordsFound.js';
import Toolbar from '../Toolbar/Toolbar.js';
import _ from 'lodash';


//////////////////////
//////////////////////

// Need to take into account whether using Repository or data.
// If using data, everything exists at once. What format will data be in?
// How does this interface with Repository?
// Maybe if Repository is not AjaxRepository, everything needs to be present at once!

//////////////////////
//////////////////////


export function TreeComponent(props) {
	const {
			areRootsVisible = true,
			extraParams = {}, // Additional params to send with each request ( e.g. { order: 'Categories.name ASC' })
			getNodeText = (item) => { // extracts model/data and decides what the row text should be
				if (Repository) {
					return item.displayValue;
				}
				return item[displayIx];
			},
			getNodeIcon = (item, isExpanded) => { // decides what icon to show for this node
				// TODO: Allow for dynamic props on the icon (e.g. special color for some icons)
				let icon;
				if (item.hasChildren) {
					if (isExpanded) {
						icon = FolderOpen;
					} else {
						icon = FolderClosed;
					}
				} else {
					icon = Dot;
				}
				return icon;
			},
			getNodeProps = (item) => {
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
			reload = null, // Whenever this value changes after initial render, the tree will reload from scratch
			parentIdIx,

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
		[isSearchModalShown, setIsSearchModalShown] = useState(false),
		[treeNodeData, setTreeNodeData] = useState({}),
		[searchResults, setSearchResults] = useState([]),
		[searchFormData, setSearchFormData] = useState([]),
		[dragNodeSlot, setDragNodeSlot] = useState(null),
		[dragNodeIx, setDragNodeIx] = useState(),
		[treeSearchValue, setTreeSearchValue] = useState(''),
		onNodeClick = (item, e) => {
			if (!setSelection) {
				return;
			}

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
		getHeaderToolbarItems = () => {
			const
				buttons = [
					{
						key: 'searchBtn',
						text: 'Search tree',
						handler: onSearchTree,
						icon: MagnifyingGlass,
						isDisabled: !treeSearchValue.length,
					},
					{
						key: 'collapseBtn',
						text: 'Collapse whole tree',
						handler: onCollapseAll,
						icon: Collapse,
						isDisabled: false,
					},
				];
			if (canNodesReorder) {
				buttons.push({
					key: 'reorderBtn',
					text: 'Enter reorder mode',
					handler: () => setIsReorderMode(!isReorderMode),
					icon: isReorderMode ? NoReorderRows : ReorderRows,
					isDisabled: false,
				});
			}
			const items = _.map(buttons, getIconFromConfig);

			items.unshift(<Input // Add text input to beginning of header items
				key="searchNodes"
				flex={1}
				placeholder="Find tree node"
				onChangeText={(val) => setTreeSearchValue(val)}
				onKeyPress={(e, value) => {
					if (e.key === 'Enter') {
						onSearchTree(value);
					}
				}}
				value={treeSearchValue}
				autoSubmit={false}
			/>);

			return items;
		},
		getFooterToolbarItems = () => {
			return _.map(additionalToolbarButtons, getIconFromConfig);
		},
		getIconFromConfig = (config, ix) => {
			const
				iconButtonProps = {
					_hover: {
						bg: 'trueGray.400',
					},
					mx: 1,
					px: 3,
				},
				_icon = {
					alignSelf: 'center',
					size: styles.TREE_TOOLBAR_ITEMS_ICON_SIZE,
					h: 20,
					w: 20,
					color: isDisabled ? styles.TREE_TOOLBAR_ITEMS_DISABLED_COLOR : styles.TREE_TOOLBAR_ITEMS_COLOR,
				};
			let {
					key,
					text,
					handler,
					icon = null,
					isDisabled = false,
				} = config;
			return <IconButton
						key={key || ix}
						onPress={handler}
						icon={icon}
						_icon={_icon}
						isDisabled={isDisabled}
						tooltip={text}
						{...iconButtonProps}
					/>;
		},
		buildTreeNodeDatum = (treeNode) => {
			// Build the data-representation of one node and its children,
			// caching text & icon, keeping track of the state for whole tree
			// renderTreeNode uses this to render the nodes.
			const
				isRoot = treeNode.isRoot,
				children = buildTreeNodeData(treeNode.children), // recursively get data for children
				datum = {
					item: treeNode,
					text: getNodeText(treeNode),
					iconCollapsed: getNodeIcon(treeNode, false),
					iconExpanded: getNodeIcon(treeNode, true),
					iconLeaf: getNodeIcon(treeNode),
					isExpanded: isRoot, // all non-root treeNodes are not expanded by default
					isVisible: isRoot ? areRootsVisible : true,
					isLoading: false,
					children,
				};

			return datum;
		},
		buildTreeNodeData = (treeNodes) => {
			const data = [];
			_.each(treeNodes, (item) => {
				data.push(buildTreeNodeDatum(item));
			});
			return data;
		},
		renderTreeNode = (datum) => {
			const
				item = datum.item,
				depth = item.depth;
			if (item.isDestroyed) {
				return null;
			}
			if (!datum.isVisible) {
				return null;
			}

			let nodeProps = getNodeProps ? getNodeProps(item) : {},
				isSelected = isInSelection(item);

			return <Pressable
						// {...testProps(Repository ? Repository.schema.name + '-' + item.id : item.id)}
						key={item.hash}
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
								return;
							}

							if (!setSelection) {
								return;
							}
							
							// context menu
							const selection = [item];
							setSelection(selection);
							if (onContextMenu) {
								onContextMenu(item, e, selection, setSelection);
							}
						}}
						flexDirection="row"
						ml={((areRootsVisible ? depth : depth -1) * 20) + 'px'}
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
										datum={datum}
										onToggle={onToggle}

										// fields={fields}
										{...rowReorderProps}
									/>;
						}}
					</Pressable>;
		},
		renderTreeNodes = (data) => {
			let nodes = [];
			_.each(data, (datum) => {
				const node = renderTreeNode(datum);
				nodes.push(node);

				if (datum.children.length && datum.isExpanded) {
					const childTreeNodes = renderTreeNodes(datum.children); // recursion
					nodes = nodes.concat(childTreeNodes);
				}
			});
			return nodes;
		},
		getDatumChildIds = (datum) => {
			let ids = [];
			 _.each(datum.children, (childDatum) => {
				ids.push(childDatum.item.id);
				if (childDatum.children.length) {
					const childIds = getDatumChildIds(childDatum);
					ids = ids.concat(childIds);
					const t = true;
				}
			});
			return ids;
		},
		datumContainsSelection = (datum) => {
			if (_.isEmpty(selection)) {
				return false;
			}
			const
				selectionIds = _.map(selection, (item) => item.id),
				datumIds = getDatumChildIds(datum),
				intersection = selectionIds.filter(x => datumIds.includes(x));

			return !_.isEmpty(intersection);
		},
		buildAndSetTreeNodeData = async () => {
			let rootNodes;
			if (Repository) {
				if (!Repository.areRootNodesLoaded) {
					rootNodes = await Repository.getRootNodes(1);
				}
			} else {
				rootNodes = assembleDataTreeNodes();
			}

			const treeNodeData = buildTreeNodeData(rootNodes);
			setTreeNodeData(treeNodeData);
		},
		assembleDataTreeNodes = () => {
			// Populates the TreeNodes with .parent and .children references
			// NOTE: This is only for 'data', not for Repositories!
			// 'data' is essentially an Adjacency List, not a ClosureTable.

			const clonedData = _.clone(data);

			// Reset all parent/child relationships
			_.each(clonedData, (treeNode) => {
				treeNode.isRoot = !treeNode[parentIdIx];
				treeNode.parent = null;
				treeNode.children = [];
			});

			// Rebuild all parent/child relationships
			_.each(clonedData, (treeNode) => {
				const parent = _.find(clonedData, (tn) => {
					return tn[idIx] === treeNode[parentIdIx];
				});
				if (parent) {
					treeNode.parent = parent;
					parent.children.push(treeNode);
				}
			});

			// populate calculated fields
			const treeNodes = [];
			_.each(clonedData, (treeNode) => {
				treeNode.hasChildren = !_.isEmpty(treeNode.children);

				let parent = treeNode.parent,
					i = 0;
				while(parent) {
					i++;
					parent = parent.parent;
				}
				treeNode.depth = i;
				treeNode.hash = treeNode[idIx];

				if (treeNode.isRoot) {
					treeNodes.push(treeNode);
				}
			});

			return treeNodes;
		},
		reloadTree = () => {
			Repository.areRootNodesLoaded = false;
			return buildAndSetTreeNodeData();
		};

		// Button handlers
		onToggle = (datum) => {
			if (datum.isLoading) {
				return;
			}

			datum.isExpanded = !datum.isExpanded;

			if (datum.isExpanded && datum.item.repository?.isRemote && datum.item.hasChildren && !datum.item.areChildrenLoaded) {
				loadChildren(datum, 1);
				return;
			}

			if (!datum.isExpanded && datumContainsSelection(datum)) {
				deselectAll();
			}
			
			forceUpdate();
		},
		loadChildren = async (datum, depth) => {
			// Show loading indicator (spinner underneath current node?)
			datum.isLoading = true;
			forceUpdate();
			
			try {

				const children = await datum.item.loadChildren(1);
				const tnd = buildTreeNodeData(children);
				datum.children = tnd;

			} catch (err) {
				// TODO: how do I handle errors? 
				// 		Color parent node red
				// 		Modal alert box?
				// 		Inline error msg? I'm concerned about modals not stacking correctly, but if we put it inline, it'll work. 
				datum.isExpanded = false;
			}

			// Hide loading indicator
			datum.isLoading = false;
			forceUpdate();
		},
		onCollapseAll = (setNewTreeNodeData = true) => {
			// Go through whole tree and collapse all nodes
			const newTreeNodeData = _.clone(treeNodeData);
			collapseNodes(newTreeNodeData);

			if (setNewTreeNodeData) {
				setTreeNodeData(newTreeNodeData);
			}
			return newTreeNodeData;
		},
		collapseNodes = (nodes) => {
			_.each(nodes, (node) => {
				node.isExpanded = false;
				if (!_.isEmpty(node.children)) {
					collapseNodes(node.children);
				}
			});
		},
		onSearchTree = async (value) => {
			let found = [];
			if (Repository?.isRemote) {
				// Search tree on server
				found = await Repository.searchNodes(value);
			} else {
				// Search local tree data
				found = findTreeNodesByText(value);
			}

			const isMultipleHits = found.length > 1;
			if (!isMultipleHits) {
				expandPath(found[0].path);
				return;
			}

			const searchFormData = [];
			_.each(found, (item) => {
				searchFormData.push([item.id, getNodeText(item)]);
			});
			setSearchFormData(searchFormData);
			setSearchResults(found);
			setIsSearchModalShown(true);
		},
		findTreeNodesByText = (text) => {
			// Helper for onSearchTree
			// Searches whole treeNodeData for any matching items
			// Returns multiple nodes

			const regex = new RegExp(text, 'i'); // instead of matching based on full text match, search for a partial match

			function searchChildren(children, found = []) {
				_.each(children, (child) => {
					if (child.text.match(regex)) {
						found.push(child);
					}
					if (child.children) {
						searchChildren(child.children, found);
					}
				});
				return found;
			}
			return searchChildren(treeNodeData);
		},
		getTreeNodeByNodeId = (node_id) => {
			if (Repository) {
				return Repository.getById(node_id);
			}
			return data[node_id]; // TODO: This is probably not right!
		},
		expandPath = async (path) => {
			// Helper for onSearchTree

			// First, close thw whole tree.
			let newTreeNodeData = _.clone(treeNodeData);
			collapseNodes(newTreeNodeData);

			// As it navigates down, it will expand the appropriate branches,
			// and then finally highlight & select the node in question
			let pathParts,
				id,
				currentLevelData = newTreeNodeData,
				currentDatum,
				parentDatum,
				currentNode;
			
			while(path.length) {
				pathParts = path.split('/');
				id = parseInt(pathParts[0], 10); // grab the first part of the path
				
				// find match in current level
				currentDatum = _.find(currentLevelData, (treeNodeDatum) => {
					return treeNodeDatum.item.id === id; 
				});

				if (!currentDatum) {
					// datum is not currently loaded, so load it
					await loadChildren(parentDatum, 1);
					currentLevelData = parentDatum.children;
					currentDatum = _.find(currentLevelData, (treeNodeDatum) => {
						return treeNodeDatum.item.id === id; 
					});
				}
				
				currentNode = currentDatum.item;
				
				// THE MAGIC!
				currentDatum.isExpanded = true;
				
				path = pathParts.slice(1).join('/'); // put the rest of it back together
				currentLevelData = currentDatum.children;
				parentDatum = currentDatum;
			}

			setSelection([currentNode]);
			scrollToNode(currentNode);
			highlightNode(currentNode);

			setTreeNodeData(newTreeNodeData);
		},
		scrollToNode = (node) => {
			// Helper for expandPath
			// Scroll the tree so the given node is in view

			// TODO: This will probably need different methods in web and mobile


		},
		highlightNode = (node) => {
			// Helper for expandPath
			// Show a brief highlight animation to draw attention to the node

			// TODO: This will probably need different methods in web and mobile
			// react-highlight for web?


		},

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
		if (!isReady) {
			return () => {};
		}
		reloadTree();
	}, [reload]);
		
	useEffect(() => {

		if (!isReady) {
			if (Repository) {
				Repository.setBaseParams(extraParams);
			}
			(async () => {
				await buildAndSetTreeNodeData();
				setIsReady(true);
			})();
		}

		if (!Repository) {
			return () => {};
		}
		
		// set up @onehat/data repository
		const
			setTrue = () => setIsLoading(true),
			setFalse = () => setIsLoading(false);
		
		Repository.on('beforeLoad', setTrue);
		Repository.on('load', setFalse);
		Repository.ons(['changePage', 'changePageSize',], deselectAll);
		Repository.ons(['changeData', 'change'], buildAndSetTreeNodeData);
		Repository.on('changeFilters', reloadTree);
		Repository.on('changeSorters', reloadTree);

		return () => {
			Repository.off('beforeLoad', setTrue);
			Repository.off('load', setFalse);
			Repository.offs(['changePage', 'changePageSize',], deselectAll);
			Repository.offs(['changeData', 'change'], buildAndSetTreeNodeData);
			Repository.off('changeFilters', reloadTree);
			Repository.off('changeSorters', reloadTree);
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

	const
		headerToolbarItemComponents = useMemo(() => getHeaderToolbarItems(), [treeSearchValue, treeNodeData]),
		footerToolbarItemComponents = useMemo(() => getFooterToolbarItems(), [additionalToolbarButtons, isReorderMode, treeNodeData]);

	if (!isReady) {
		return null;
	}
	const treeNodes = renderTreeNodes(treeNodeData);

	// headers & footers
	let treeFooterComponent = null;
	if (!disableBottomToolbar) {
		if (Repository && bottomToolbar === 'pagination' && !disablePagination && Repository.isPaginated) {
			treeFooterComponent = <PaginationToolbar Repository={Repository} toolbarItems={footerToolbarItemComponents} />;
		} else if (footerToolbarItemComponents.length) {
			treeFooterComponent = <Toolbar>{footerToolbarItemComponents}</Toolbar>;
		}
	}
	
	return <>
				<Column
					{...testProps('Tree')}
					flex={1}
					w="100%"
				>
					{topToolbar}
					{headerToolbarItemComponents?.length && <Row>{headerToolbarItemComponents}</Row>}

					<Column w="100%" flex={1} p={2} borderTopWidth={isLoading ? 2 : 1} borderTopColor={isLoading ? '#f00' : 'trueGray.300'} onClick={() => {
						if (!isReorderMode) {
							deselectAll();
						}
					}}>
						{!treeNodes?.length ? <NoRecordsFound text={noneFoundText} onRefresh={onRefresh} /> :
							treeNodes}
					</Column>

					{treeFooterComponent}
				</Column>

				<Modal
					isOpen={isSearchModalShown}
					onClose={() => setIsSearchModalShown(false)}
				>
					<Column bg="#fff" w={300}>
						<FormPanel
							title="Choose Tree Node"
							instructions="Multiple tree nodes matched your search. Please select which one to show."
							flex={1}
							items={[
								{
									type: 'Column',
									flex: 1,
									items: [
										{
											key: 'node_id',
											name: 'node_id',
											type: 'Combo',
											label: 'Tree Node',
											data: searchFormData,
										}
									],
								},
							]}
							onCancel={(e) => {
								// Just close the modal
								setIsSearchModalShown(false);
							}}
							onSave={(data, e) => {
								const
									treeNode = _.find(searchResults, (item) => {
										return item.id === data.node_id;
									}),
									path = treeNode.path;
								expandPath(path);

								// Close the modal
								setIsSearchModalShown(false);
							}}
						/>
					</Column>
				</Modal>
			</>;

}

const Tree = withAlert(
				withEvents(
					withData(
						// withMultiSelection(
							withSelection(
								// withSideEditor(
									withFilters(
										// withPresetButtons(
											withContextMenu(
												TreeComponent
											)
										// )
									)
								// )
							)
						// )
					)
				)
			);

export const SideTreeEditor = withAlert(
									withEvents(
										withData(
											// withMultiSelection(
												withSelection(
													withSideEditor(
														withFilters(
															withPresetButtons(
																withContextMenu(
																	TreeComponent
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
																	TreeComponent
																)
															)
														)
													)
												)
											// )
										)
									)
								);

export default Tree;
