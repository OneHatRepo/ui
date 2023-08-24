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
	XY,
} from '../../Constants/Directions.js';
import {
	DROP_POSITION_BEFORE,
	DROP_POSITION_AFTER,
	COLLAPSED,
	EXPANDED,
	LEAF,
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
import getIconButtonFromConfig from '../../Functions/getIconButtonFromConfig.js';
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

const DEPTH_INDENT_PX = 20;

function TreeComponent(props) {
	const {
			areRootsVisible = true,
			extraParams = {}, // Additional params to send with each request ( e.g. { order: 'Categories.name ASC' })
			getNodeText = (item) => { // extracts model/data and decides what the row text should be
				if (Repository) {
					return item.displayValue;
				}
				return item[displayIx];
			},
			getNodeIcon = (which, item) => { // decides what icon to show for this node
				// TODO: Allow for dynamic props on the icon (e.g. special color for some icons)
				let icon;
				switch(which) {
					case COLLAPSED:
						icon = FolderClosed;
						break;
					case EXPANDED:
						icon = FolderOpen;
						break;
					case LEAF:
						icon = Dot;
						break;
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
			setWithEditListeners,

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
		treeNodeData = useRef(),
		[isReady, setIsReady] = useState(false),
		[isLoading, setIsLoading] = useState(false),
		[isReorderMode, setIsReorderMode] = useState(false),
		[isSearchModalShown, setIsSearchModalShown] = useState(false),
		[searchResults, setSearchResults] = useState([]),
		[searchFormData, setSearchFormData] = useState([]),
		[dragNodeSlot, setDragNodeSlot] = useState(null),
		[dragNodeIx, setDragNodeIx] = useState(),
		[dragProxyDepth, setDragProxyDepth] = useState(0),
		[treeSearchValue, setTreeSearchValue] = useState(''),

		// state getters & setters
		getTreeNodeData = () => {
			return treeNodeData.current;
		},
		setTreeNodeData = (tnd) => {
			treeNodeData.current = tnd;
			forceUpdate();
		},

		// event handers
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
		onBeforeAdd = async () => {
			// Load children before adding the new node
			const
				parent = selection[0],
				parentDatum = getNodeData(parent.id);

			if (parent.hasChildren && !parent.areChildrenLoaded) {
				await loadChildren(parentDatum);
			}
		},
		onAfterAdd = async (entity) => {
			// Expand the parent before showing the new node
			const
				parent = entity.parent,
				parentDatum = getNodeData(parent.id);

			if (!parentDatum.isExpanded) {
				parentDatum.isExpanded = true;
			}

			// Add the entity to the tree
			const entityDatum = buildTreeNodeDatum(entity);
			parentDatum.children.unshift(entityDatum);
			forceUpdate();
		},
		onBeforeEditSave = (entities) => {
			onBeforeSave(entities);
		},
		onAfterEdit = async (entities) => {
			// Refresh the node's display
			const
				node = entities[0],
				existingDatum = getNodeData(node.id), // TODO: Make this work for >1 entity
				newDatum = buildTreeNodeDatum(node);

			// copy the updated data to existingDatum
			_.assign(existingDatum, newDatum);
			existingDatum.isLoading = false;


			if (node.parent?.id) {
				const
					existingParentDatum = getNodeData(node.parent.id),
					newParentDatum = buildTreeNodeDatum(node.parent);
				_.assign(existingParentDatum, newParentDatum);
				existingParentDatum.isExpanded = true;
			}

			forceUpdate();
		},
		onBeforeDeleteSave = (entities) => {
			onBeforeSave(entities);
		},
		onBeforeSave = (entities) => {
			const
				node = entities[0],
				datum = getNodeData(node.id); // TODO: Make this work for >1 entity
			
			datum.isLoading = true;
			forceUpdate();
		},
		onAfterDelete = async (entities) => {
			const parent = entities[0].parent;
			if (parent) {
				await reloadNode(parent);
			}
		},
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
		onCollapseAll = (setNewTreeNodeData = true) => {
			// Go through whole tree and collapse all nodes
			const newTreeNodeData = _.clone(getTreeNodeData());
			collapseNodes(newTreeNodeData);

			if (setNewTreeNodeData) {
				setTreeNodeData(newTreeNodeData);
			}
			return newTreeNodeData;
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

		// utilities
		getNodeData = (id) => {
			function findNodeById(node) {
				if (node.item.id === id) {
					return node;
				}
				if (!_.isEmpty(node.children)) {
					let found1 = null;
					_.each(node.children, (node2) => {
						const found2 = findNodeById(node2);
						if (found2) {
							found1 = found2;
							return false; // break loop
						}
					})
					return found1
				}
				return false;
			}
			const treeNodeData = getTreeNodeData();
			let found = null;
			_.each(treeNodeData, (node) => {
				const foundNode = findNodeById(node);
				if (foundNode) {
					found = foundNode;
					return false;
				}
			});
			return found;
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
					iconCollapsed: getNodeIcon(COLLAPSED, treeNode),
					iconExpanded: getNodeIcon(EXPANDED, treeNode),
					iconLeaf: getNodeIcon(LEAF, treeNode),
					isExpanded: isRoot, // all non-root treeNodes are collapsed by default
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
		buildAndSetTreeNodeData = async () => {
			let nodes = [];
			if (Repository) {
				if (!Repository.areRootNodesLoaded) {
					nodes = await Repository.loadRootNodes(1);
				} else {
					nodes = Repository.getRootNodes();
				}
			} else {
				nodes = assembleDataTreeNodes();
			}

			setTreeNodeData(buildTreeNodeData(nodes));
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
		},
		reloadNode = async (node) => {
			// mark node as loading
			const existingDatum = getNodeData(node.id);
			existingDatum.isLoading = true;
			forceUpdate();

			// reload from server
			await node.reload();

			// Refresh the node's display
			const newDatum = buildTreeNodeDatum(node);

			// copy the updated data to existingDatum
			_.assign(existingDatum, _.omit(newDatum, ['isExpanded']));
			existingDatum.isLoading = false;
			forceUpdate();
		},
		loadChildren = async (datum, depth = 1) => {
			// Show loading indicator (spinner underneath current node?)
			datum.isLoading = true;
			forceUpdate();
			
			try {

				const children = await datum.item.loadChildren(depth);
				datum.children = buildTreeNodeData(children);
				datum.isExpanded = true;

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
		collapseNodes = (nodes) => {
			_.each(nodes, (node) => {
				node.isExpanded = false;
				if (!_.isEmpty(node.children)) {
					collapseNodes(node.children);
				}
			});
		},
		expandPath = async (path) => {
			// First, close thw whole tree.
			let newTreeNodeData = _.clone(getTreeNodeData());
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

		// render
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
					text: (isReorderMode ? 'Exit' : 'Enter') + ' reorder mode',
					handler: () => {
						setIsReorderMode(!isReorderMode)
					},
					icon: isReorderMode ? NoReorderRows : ReorderRows,
					isDisabled: false,
				});
			}
			const items = _.map(buttons, getIconButtonFromConfig);

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
			return _.map(additionalToolbarButtons, getIconButtonFromConfig);
		},
		renderTreeNode = (datum) => {
			if (!datum.isVisible) {
				return null;
			}
			const item = datum.item;
			if (item.isDestroyed) {
				return null;
			}
			const depth = item.depth;

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
						ml={((areRootsVisible ? depth : depth -1) * DEPTH_INDENT_PX) + 'px'}
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
								dragProps = {};
							if (canNodesReorder && isReorderMode && !datum.item.isRoot) {
								WhichTreeNode = ReorderableTreeNode;
								dragProps = {
									mode: XY,
									onDragStart: onNodeReorderDragStart,
									onDrag: onNodeReorderDrag,
									onDragStop: onNodeReorderDragStop,
									getParentNode: (node) => node.parentElement.parentElement,
									getDraggableNodeFromNode: (node) => node.parentElement,
									getProxy: getReorderProxy,
									proxyParent: treeRef.current,
									proxyPositionRelativeToParent: true,
								};
								nodeProps.width = '100%';
							}
							
							return <WhichTreeNode
										nodeProps={nodeProps}
										{...dragProps}
										bg={bg}
										datum={datum}
										onToggle={onToggle}

										// fields={fields}
									/>;
						}}
					</Pressable>;
		},
		renderTreeNodes = (data) => {
			let nodes = [];
			_.each(data, (datum) => {
				const node = renderTreeNode(datum);
				if (!node) {
					return;
				}
				nodes.push(node);

				if (datum.children.length && datum.isExpanded) {
					const childTreeNodes = renderTreeNodes(datum.children); // recursion
					nodes = nodes.concat(childTreeNodes);
				}
			});
			return nodes;
		},

		// drag/drop
		getReorderProxy = (node) => {
			const
				row = node,
				rowRect = row.getBoundingClientRect(),
				parent = row.parentElement,
				parentRect = parent.getBoundingClientRect(),
				proxy = row.cloneNode(true),
				top = rowRect.top - parentRect.top,
				rows = _.filter(parent.children, (childNode) => {
					if (childNode.getBoundingClientRect().height === 0 && childNode.style.visibility !== 'hidden') {
						return false; // Skip zero-height children
					}
					if (childNode === proxy) {
						return false;
					}
					return true;
				}),
				dragNodeIx = Array.from(rows).indexOf(row)
			
			setDragNodeIx(dragNodeIx); // the ix of which record is being dragged

			proxy.style.top = top + 'px';
			proxy.style.left = (dragProxyDepth * DEPTH_INDENT_PX) + 'px';
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
				row = node,
				parent = row.parentElement,
				parentRect = parent.getBoundingClientRect(),
				rows = _.filter(parent.children, (childNode) => {
					if (childNode.getBoundingClientRect().height === 0 && childNode.style.visibility !== 'hidden') {
						return false; // Skip zero-height children
					}
					if (childNode === proxy) {
						return false;
					}
					return true;
				}),
				currentY = proxyRect.top - parentRect.top; // top position of pointer, relative to page

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

				if (child === proxy) {
					return;
				}
				if (ix === 0) {
					// first row
					if (currentY < compensatedTop + halfHeight) {
						newIx = 0;
						return false;
					} else if (currentY < compensatedBottom) {
						newIx = 0 + 1;
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
				top = (useBottom ? rowContainerRect.bottom : rowContainerRect.top) - parentRect.top - parseInt(parent.style.borderWidth || 0), // get relative Y position
				treeNodesContainer = treeRef.current,
				treeNodesContainerRect = treeNodesContainer.getBoundingClientRect(),
				marker = document.createElement('div');

			marker.style.position = 'absolute';
			marker.style.top = top -4 + 'px'; // -4 so it's always visible
			marker.style.height = '4px';
			marker.style.width = treeNodesContainerRect.width + 'px';
			marker.style.backgroundColor = '#f00';
			treeNodesContainer.appendChild(marker);

			proxy.style.left = rowContainerRect.left + 'px'; // start proxy at indentation of whatever it's replacing

			setDragNodeSlot({ ix: newIx, marker, useBottom, });
		},
		onNodeReorderDrag = (info, e, proxy, node) => {
			// console.log('onNodeReorderDrag', info, e, proxy, node);
			const
				proxyRect = proxy.getBoundingClientRect(),
				row = node,
				parent = row.parentElement,
				parentRect = parent.getBoundingClientRect(),
				marker = dragNodeSlot.marker,
				rows = _.filter(parent.children, (childNode) => {
					if (childNode.getBoundingClientRect().height === 0 && childNode.style.visibility !== 'hidden') {
						return false; // Skip zero-height children
					}
					if (childNode === proxy || childNode === marker) {
						return false;
					}
					return true;
				}),
				currentY = proxyRect.top - parentRect.top; // top position of pointer, relative to page

			// Figure out which index the user wants
			let newIx = 0,
				useBottom = false;
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
				
				if (ix === 0) {
					// first row
					if (currentY < compensatedTop + halfHeight) {
						// top half
						newIx = 0;
						return false;
					} else if (currentY < compensatedBottom) {
						// bottom half
						newIx = 1;
						return false;
					}
					return;
				} else if (ix === all.length -1) { // compensate for zero-indexing
					// last row
					// top half
					newIx = ix;
					if (currentY < compensatedTop + halfHeight) {
						return false;
					}
					// bottom half
					useBottom = true;
					return false;
				}
				
				// all other rows
				if (compensatedTop <= currentY && currentY < compensatedTop + halfHeight) {
					// top half
					newIx = ix;
					return false;
				} else if (currentY < compensatedBottom) {
					// bottom half
					newIx = ix +1;
					return false;
				}
			});



			// Figure out which record user wants to be the parentId
			// Take into account the X tranposition for depth
			// Contrain the X transposition to proper depth

			// Don't allow the creation of a new root node
			// Basically, the node can be a child of any node except itself or its own descendants
			// Maybe the proxy should grab itself and all descendants??

			// const dragProxyDepth = 0;
			// proxy.style.left = (dragProxyDepth * DEPTH_INDENT_PX) + 'px';
			// setDragProxyDepth(dragProxyDepth);



			// Render marker showing destination location (can't use regular render cycle because this div is absolutely positioned on page)
			const
				rowContainerRect = rows[newIx].getBoundingClientRect(),
				top = (useBottom ? rowContainerRect.bottom : rowContainerRect.top) - parentRect.top - parseInt(marker.style.height); // get relative Y position
			if (marker) {
				marker.style.top = (top -4) + 'px'; // -4 so it's always visible
			}

			setDragNodeSlot({ ix: newIx, marker, useBottom, });
		},
		onNodeReorderDragStop = (delta, e, config) => {
			// console.log('onNodeReorderDragStop', delta, e, config);
			const
				dropIx = dragNodeSlot.ix,
				dropPosition = dragNodeSlot.useBottom ? DROP_POSITION_AFTER : DROP_POSITION_BEFORE;

			let shouldMove = true,
				finalDropIx = dropIx;
			
			if (dropPosition === DROP_POSITION_BEFORE) {
				if (dragNodeIx === dropIx || dragNodeIx === dropIx -1) { // basically before or after the drag row's origin
					// Same as origin; don't do anything
					shouldMove = false;
				} else {
					// Actually move it
					if (!Repository) { // If we're just going to be switching rows, rather than telling server to reorder rows, so maybe adjust finalDropIx...
						if (finalDropIx > dragNodeIx) { // if we're dropping *before* the origin ix
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
					dragRecord = Repository.getByIx(dragNodeIx);
					dropRecord = Repository.getByIx(finalDropIx);
					
					Repository.reorder(dragRecord, dropRecord, dropPosition);

				} else {
					function arrayMove(arr, fromIndex, toIndex) {
						var element = arr[fromIndex];
						arr.splice(fromIndex, 1);
						arr.splice(toIndex, 0, element);
					}
					arrayMove(data, dragNodeIx, finalDropIx);
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
		Repository.on('changeFilters', reloadTree);
		Repository.on('changeSorters', reloadTree);

		return () => {
			Repository.off('beforeLoad', setTrue);
			Repository.off('load', setFalse);
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

	setWithEditListeners({ // Update withEdit's listeners on every render
		onBeforeAdd,
		onAfterAdd,
		onBeforeEditSave,
		onAfterEdit,
		onBeforeDeleteSave,
		onAfterDelete,
	});
	
	const
		headerToolbarItemComponents = useMemo(() => getHeaderToolbarItems(), [treeSearchValue, isReorderMode, getTreeNodeData()]),
		footerToolbarItemComponents = useMemo(() => getFooterToolbarItems(), [additionalToolbarButtons, isReorderMode, getTreeNodeData()]);

	if (!isReady) {
		return null;
	}
	
	const treeNodes = renderTreeNodes(getTreeNodeData());

	// headers & footers
	let treeFooterComponent = null;
	if (!disableBottomToolbar) {
		if (Repository && bottomToolbar === 'pagination' && !disablePagination && Repository.isPaginated) {
			treeFooterComponent = <PaginationToolbar Repository={Repository} toolbarItems={footerToolbarItemComponents} />;
		} else if (footerToolbarItemComponents.length) {
			treeFooterComponent = <Toolbar>{footerToolbarItemComponents}</Toolbar>;
		}
	}

	const borderProps = {};
	if (isReorderMode) {
		borderProps.borderWidth = isReorderMode ? styles.REORDER_BORDER_WIDTH : 0;
		borderProps.borderColor = isReorderMode ? styles.REORDER_BORDER_COLOR : null;
		borderProps.borderStyle = styles.REORDER_BORDER_STYLE;
	} else {
		borderProps.borderTopWidth = isLoading ? 2 : 1;
		borderProps.borderTopColor = isLoading ? '#f00' : 'trueGray.300';
	}

	return <>
				<Column
					{...testProps('Tree')}
					flex={1}
					w="100%"
				>
					{topToolbar}
					{headerToolbarItemComponents?.length && <Row>{headerToolbarItemComponents}</Row>}

					<Column
						ref={treeRef}
						w="100%"
						flex={1}
						p={2}
						{...borderProps}
						onClick={() => {
							if (!isReorderMode) {
								deselectAll();
							}
						}}
					>
						{!treeNodes?.length ? <NoRecordsFound text={noneFoundText} onRefresh={reloadTree} /> :
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

export const Tree = withAlert(
						withEvents(
							withData(
								// withMultiSelection(
									withSelection(
										withFilters(
											withContextMenu(
												TreeComponent
											)
										)
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
														),
														true // isTree
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
														),
														true // isTree
													)
												)
											// )
										)
									)
								);

export default Tree;
