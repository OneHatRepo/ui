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
import inArray from '../../Functions/inArray.js';
import testProps from '../../Functions/testProps.js';
import nbToRgb from '../../Functions/nbToRgb.js';
import TreeNode, { DraggableTreeNode } from './TreeNode.js';
import FormPanel from '../Panel/FormPanel.js';
import Input from '../Form/Field/Input.js';
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
		[isSearchModalShown, setIsSearchModalShown] = useState(false),
		[rowToDatumMap, setRowToDatumMap] = useState({}),
		[searchResults, setSearchResults] = useState([]),
		[searchFormData, setSearchFormData] = useState([]),
		[highlitedDatum, setHighlitedDatum] = useState(null),
		[isDragMode, setIsDragMode] = useState(false),
		[dragNodeId, setDragNodeId] = useState(null),
		[dropRowIx, setDropRowIx] = useState(null),
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
			
			buildRowToDatumMap();
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
				await reloadNode(parent); // includes buildRowToDatumMap
			} else {
				buildRowToDatumMap();
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

			buildRowToDatumMap();
		},
		onCollapseAll = (setNewTreeNodeData = true) => {
			// Go through whole tree and collapse all nodes
			const newTreeNodeData = _.clone(getTreeNodeData());
			collapseNodes(newTreeNodeData);

			if (setNewTreeNodeData) {
				setTreeNodeData(newTreeNodeData);
			}
			buildRowToDatumMap();
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
			let found = null;
			_.each(getTreeNodeData(), (node) => {
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

			const treeNodeData = buildTreeNodeData(nodes);
			setTreeNodeData(treeNodeData);

			buildRowToDatumMap();
		},
		buildRowToDatumMap = () => {
			const rowToDatumMap = {};
			let ix = 0;

			function walkTree(datum) {
				if (!datum.isVisible) {
					return;
				}

				// Add this datum's id
				rowToDatumMap[ix] = datum;
				ix++;

				if (datum.isExpanded) {
					_.each(datum.children, (child) => {
						walkTree(child);
					});
				}
			}
			_.each(getTreeNodeData(), (rootDatum) => {
				walkTree(rootDatum);
			});
			
			setRowToDatumMap(rowToDatumMap);
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
			return searchChildren(getTreeNodeData());
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
		getDatumById = (id) => {

			let found = null;

			function walkTree(datum) {
				if (datum.item.id === id) {
					found = datum;
					return;
				}
				_.each(datum.children, (child) => {
					if (!found) {
						walkTree(child);
					}
				});
			}
			_.each(getTreeNodeData(), (rootDatum) => {
				walkTree(rootDatum);
			});

			return found;
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

			buildRowToDatumMap();
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
			
			buildRowToDatumMap();
		},
		collapseNodes = (nodes) => {
			collapseNodesRecursive(nodes);
			buildRowToDatumMap();
		},
		collapseNodesRecursive = (nodes) => {
			_.each(nodes, (node) => {
				node.isExpanded = false;
				if (!_.isEmpty(node.children)) {
					collapseNodesRecursive(node.children);
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
			setHighlitedDatum(currentDatum);

			setTreeNodeData(newTreeNodeData);
			buildRowToDatumMap();
		},
		scrollToNode = (node) => {
			// Helper for expandPath
			// Scroll the tree so the given node is in view

			// TODO: This will probably need different methods in web and mobile


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
					text: (isDragMode ? 'Exit' : 'Enter') + ' reorder mode',
					handler: () => {
						setIsDragMode(!isDragMode)
					},
					icon: isDragMode ? NoReorderRows : ReorderRows,
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
							if (isDragMode) {
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
							if (isDragMode) {
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
							if (!isDragMode) {
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
							} else {

							}
							let WhichTreeNode = TreeNode,
								dragProps = {};
							if (canNodesReorder && isDragMode && !datum.item.isRoot) { // Can't drag root nodes
								WhichTreeNode = DraggableTreeNode;
								dragProps = {
									mode: VERTICAL,
									onDrag,
									onDragStop,
									getParentNode: (node) => node.parentElement.parentElement,
									getDraggableNodeFromNode: (node) => node.parentElement,
									getProxy: getDragProxy,
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
										isDragMode={isDragMode}
										isHighlighted={highlitedDatum === datum}

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
		getDragProxy = (node) => {

			// TODO: Maybe the proxy should grab itself and all descendants??

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
				dragRowIx = Array.from(rows).indexOf(row),
				dragRowRecord = rowToDatumMap[dragRowIx].item;
			
			setDragNodeId(dragRowRecord.id); // the id of which record is being dragged

			proxy.style.top = top + 'px';
			proxy.style.left = (dragRowRecord.depth * DEPTH_INDENT_PX) + 'px';
			proxy.style.height = rowRect.height + 'px';
			proxy.style.width = rowRect.width + 'px';
			proxy.style.display = 'flex';
			proxy.style.position = 'absolute';
			proxy.style.border = '1px solid #bbb';
			return proxy;
		},
		onDrag = (info, e, proxy, node) => {
			// console.log('onDrag', info, e, proxy, node);
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

			// Figure out which row the user wants as a parentId
			let newIx = 0; // default to root being new parentId
			_.each(rows, (child, ix, all) => {
				const
					rect = child.getBoundingClientRect(), // rect of the row of this iteration
					{
						top,
						bottom,
						height,
					} = rect,
					compensatedBottom = bottom - parentRect.top;

				if (child === proxy) {
					return;
				}
				if (ix === 0) {
					// first row
					if (currentY < compensatedBottom) {
						newIx = 0;
						return false;
					}
					return;
				} else if (ix === all.length -1) {
					// last row
					if (currentY < compensatedBottom) {
						newIx = ix;
						return false;
					}
					return;
				}
				
				// all other rows
				if (currentY < compensatedBottom) {
					newIx = ix;
					return false;
				}
			});


			const
				dragDatum = getDatumById(dragNodeId),
				dragDatumChildIds = getDatumChildIds(dragDatum),
				dropRowDatum = rowToDatumMap[newIx],
				dropRowRecord = dropRowDatum.item,
				dropNodeId = dropRowRecord.id,
				dragNodeContainsDropNode = inArray(dropNodeId, dragDatumChildIds) || dropRowRecord.id === dragNodeId;
			
			if (dragNodeContainsDropNode) {
				// the node can be a child of any node except itself or its own descendants
				setDropRowIx(null);
				setHighlitedDatum(null);

			} else {
				console.log('setDropRowIx', newIx);
				setDropRowIx(newIx);

				// highlight the drop node
				setHighlitedDatum(dropRowDatum);

				// shift proxy's depth
				const depth = (dropRowRecord.id === dragNodeId) ? dropRowRecord.depth : dropRowRecord.depth + 1;
				proxy.style.left = (depth * DEPTH_INDENT_PX) + 'px';
			}
		},
		onDragStop = async (delta, e, config) => {
			// console.log('onDragStop', delta, e, config);

			if (_.isNil(dropRowIx)) {
				return;
			}
			
			const
				dragDatum = getDatumById(dragNodeId),
				dragRowRecord = dragDatum.item,
				dropRowDatum = rowToDatumMap[dropRowIx],
				dropRowRecord = dropRowDatum.item;

			if (Repository) {
				
				const commonAncestorId = await Repository.moveTreeNode(dragRowRecord, dropRowRecord.id);
				const commonAncestorDatum = getDatumById(commonAncestorId);
				reloadNode(commonAncestorDatum.item);

			} else {

				throw Error('Not yet implemented');
				// function arrayMove(arr, fromIndex, toIndex) {
				// 	var element = arr[fromIndex];
				// 	arr.splice(fromIndex, 1);
				// 	arr.splice(toIndex, 0, element);
				// }
				// arrayMove(data, dragNodeIx, finalDropIx);
			}
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
		headerToolbarItemComponents = useMemo(() => getHeaderToolbarItems(), [treeSearchValue, isDragMode, getTreeNodeData()]),
		footerToolbarItemComponents = useMemo(() => getFooterToolbarItems(), [additionalToolbarButtons, isDragMode, getTreeNodeData()]);

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
	if (isDragMode) {
		borderProps.borderWidth = isDragMode ? styles.REORDER_BORDER_WIDTH : 0;
		borderProps.borderColor = isDragMode ? styles.REORDER_BORDER_COLOR : null;
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
							if (!isDragMode) {
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
