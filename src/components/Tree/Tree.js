import { useState, useEffect, useRef, useMemo, } from 'react';
import {
	Column,
	FlatList,
	Modal,
	Pressable,
	Icon,
	Row,
	ScrollView,
	Text,
} from 'native-base';
import {
	SELECTION_MODE_SINGLE,
	SELECTION_MODE_MULTI,
} from '../../Constants/Selection.js';
import {
	EDIT,
} from '../../Constants/Commands.js';
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
import withComponent from '../Hoc/withComponent.js';
import withData from '../Hoc/withData.js';
import withEvents from '../Hoc/withEvents.js';
import withSideEditor from '../Hoc/withSideEditor.js';
import withFilters from '../Hoc/withFilters.js';
import withMultiSelection from '../Hoc/withMultiSelection.js';
import withPresetButtons from '../Hoc/withPresetButtons.js';
import withPermissions from '../Hoc/withPermissions.js';
import withSelection from '../Hoc/withSelection.js';
import withWindowedEditor from '../Hoc/withWindowedEditor.js';
import getIconButtonFromConfig from '../../Functions/getIconButtonFromConfig.js';
import inArray from '../../Functions/inArray.js';
import testProps from '../../Functions/testProps.js';
import nbToRgb from '../../Functions/nbToRgb.js';
import ReloadTreeButton from '../Buttons/ReloadTreeButton.js';
import TreeNode, { DraggableTreeNode } from './TreeNode.js';
import FormPanel from '../Panel/FormPanel.js';
import Input from '../Form/Field/Input.js';
import Xmark from '../Icons/Xmark.js';
import Dot from '../Icons/Dot.js';
import Collapse from '../Icons/Collapse.js';
import Expand from '../Icons/Expand.js';
import FolderClosed from '../Icons/FolderClosed.js';
import FolderOpen from '../Icons/FolderOpen.js';
import MagnifyingGlass from '../Icons/MagnifyingGlass.js';
import NoReorderRows from '../Icons/NoReorderRows.js';
import ReorderRows from '../Icons/ReorderRows.js';
import PaginationToolbar from '../Toolbar/PaginationToolbar.js';
import NoRecordsFound from '../Grid/NoRecordsFound.js';
import Toolbar from '../Toolbar/Toolbar.js';
import Loading from '../Messages/Loading.js';
import Unauthorized from '../Messages/Unauthorized.js';
import _ from 'lodash';

const DEPTH_INDENT_PX = 25;

function TreeComponent(props) {
	const {
			areRootsVisible = true,
			autoLoadRootNodes = true,
			extraParams = {}, // Additional params to send with each request ( e.g. { order: 'Categories.name ASC' })
			getNodeText = (item) => { // extracts model/data and decides what the row text should be
				if (Repository) {
					return item.displayValue;
				}
				return item[displayIx];
			},
			getDisplayTextFromSearchResults = (item) => {
				return item.id
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
			initialSelection,
			canRecordBeEdited,
			onTreeLoad,

			// withComponent
			self,

			// withAlert
			alert,
			confirm,
			showInfo,
		
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

			// withPermissions
			canUser,

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
		[isModalShown, setIsModalShown] = useState(false),
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
			// called during withEditor::doAdd, before the add operation is called
			// returning false will cancel the add operation

			// Load children before adding the new node
			if (_.isEmpty(selection)) {
				alert('Please select a parent node first.')
				return;
			}
			const
				parent = selection[0],
				parentDatum = getNodeData(parent.id);

			if (parent.hasChildren && !parent.areChildrenLoaded) {
				await loadChildren(parentDatum);
			}

			// forceUpdate();
		},
		onAfterAdd = (entity) => {
			// called during withEditor::doAdd, after the add operation is called

			// Add the entity to the tree, show parent as hasChildren and expanded
			const
				parent = selection[0],
				parentDatum = getNodeData(parent.id);
			if (!parent.hasChildren) {
				parent.hasChildren = true; // since we're adding a new child
			}
			if (!parentDatum.isExpanded) {
				parentDatum.isExpanded = true;
			}

			buildRowToDatumMap();
			forceUpdate();
		},
		onAfterAddSave = (entities) => {

			// Update the datum with the new entity
			return onAfterEdit(entities);
			

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
		onToggle = async (datum, e) => {
			if (datum.isLoading) {
				return;
			}

			const
				isExpanded = !datum.isExpanded, // sets new state
				isShiftKey = e.shiftKey; // hold down the shift key to load all children
				
			datum.isExpanded = isExpanded;

			if (isExpanded) {
				// opening
				if (datum.item.repository?.isRemote && datum.item.hasChildren) {
					if (isShiftKey) {
						// load ALL children
						await loadChildren(datum, 'all');
						return;
					} else if (!datum.item.areChildrenLoaded) {
						// load only one level
						await loadChildren(datum, 1);
						return;
					}
				}
			} else {
				// closing
				if (datumContainsSelection(datum)) {
					deselectAll();
				}
			}
			
			forceUpdate();
			buildRowToDatumMap();
		},
		onCollapseAll = () => {
			const newTreeNodeData = _.clone(getTreeNodeData());
			collapseNodes(newTreeNodeData);
			setTreeNodeData(newTreeNodeData);
		},
		onExpandAll = () => {
			confirm('Are you sure you want to expand the whole tree? This may take a while.', async () => {
				const newTreeNodeData = _.clone(getTreeNodeData());
				await expandNodes(newTreeNodeData);
				setTreeNodeData(newTreeNodeData);
			});
		},
		onSearchTree = async (q) => {
			let found = [];
			if (q === '') {
				setHighlitedDatum(null);
				alert('Please enter a search query.');
				return;
			}

			if (Repository?.isRemote) {
				// Search tree on server
				found = await Repository.searchNodes(q);
			} else {
				// Search local tree data
				found = findTreeNodesByText(q);
			}

			if (_.isEmpty(found)) {
				deselectAll();
				setHighlitedDatum(null);
				alert('No matches found.');
				return;
			}

			const isMultipleHits = found.length > 1;
			if (!isMultipleHits) {
				expandPath(found[0].cPath); // highlights and selects the last node in the cPath
				return;
			}

			// Show modal so user can select which node to go to
			const searchFormData = [];
			_.each(found, (item) => {
				searchFormData.push([item.id, getDisplayTextFromSearchResults(item)]);
			});
			setSearchFormData(searchFormData);
			setSearchResults(found);
			setIsModalShown(true);
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
		buildTreeNodeDatum = (treeNode, defaultToExpanded = false) => {
			// Build the data-representation of one node and its children,
			// caching text & icon, keeping track of the state for whole tree
			// renderTreeNode uses this to render the nodes.
			const
				isRoot = treeNode.isRoot,
				children = buildTreeNodeData(treeNode.children, defaultToExpanded), // recursively get data for children
				datum = {
					item: treeNode,
					text: getNodeText(treeNode),
					iconCollapsed: getNodeIcon(COLLAPSED, treeNode),
					iconExpanded: getNodeIcon(EXPANDED, treeNode),
					iconLeaf: getNodeIcon(LEAF, treeNode),
					isExpanded: defaultToExpanded || isRoot, // all non-root treeNodes are collapsed by default
					isVisible: isRoot ? areRootsVisible : true,
					isLoading: false,
					children,
				};

			return datum;
		},
		buildTreeNodeData = (treeNodes, defaultToExpanded = false) => {
			const data = [];
			_.each(treeNodes, (item) => {
				data.push(buildTreeNodeDatum(item, defaultToExpanded));
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

			if (onTreeLoad) {
				onTreeLoad();
			}
			return treeNodeData;
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

				let defaultToExpanded = false;
				if (depth === 'all') {
					defaultToExpanded = true;
					depth = 9999;
				}

				const
					depthChildren = await datum.item.loadChildren(depth),
					directChildren = _.filter(depthChildren, (child) => { // narrow list to only direct descendants, so buildTreeNodeData can work correctly
						return child.depth === datum.item.depth + 1;
					});

				datum.children = buildTreeNodeData(directChildren, defaultToExpanded);
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
		expandNodes = async (nodes) => {

			// load all children of nodes
			for (const node of nodes) {
				await loadChildren(node, 'all');
			}

			// expand them in UI
			expandNodesRecursive(nodes);
			buildRowToDatumMap();
		},
		expandNodesRecursive = (nodes) => {
			_.each(nodes, (node) => {
				node.isExpanded = true;
				if (!_.isEmpty(node.children)) {
					expandNodesRecursive(node.children);
				}
			});
		},
		expandPath = async (cPath, highlight = true) => {
			// First, close the whole tree.
			let newTreeNodeData = _.clone(getTreeNodeData());
			collapseNodes(newTreeNodeData);

			// As it navigates down, it will expand the appropriate branches,
			// and then finally highlight & select the node in question
			let cPathParts,
				id,
				currentLevelData = newTreeNodeData,
				currentDatum,
				parentDatum,
				currentNode;
			
			while(cPath.length) {
				cPathParts = cPath.split('/');
				id = parseInt(cPathParts[0], 10); // grab the first part of the cPath
				
				// find match in current level
				currentDatum = _.find(currentLevelData, (treeNodeDatum) => {
					return treeNodeDatum.item.id === id; 
				});

				if (!currentDatum) {
					if (!parentDatum) {
						currentDatum = currentLevelData[0]; // this is essentially the root node (currentLevelData can contain more than one node, so just set it to the first)
						// currentLevelData = currentDatum;
					} else {
						if (!parentDatum.isLoaded) {
							await loadChildren(parentDatum, 1);
						}
						currentLevelData = parentDatum.children;
					}

					currentDatum = _.find(currentLevelData, (treeNodeDatum) => {
						return treeNodeDatum.item.id === id; 
					});
				}
				
				currentNode = currentDatum.item;
				
				if (!currentDatum.isExpanded) {
					await loadChildren(currentDatum, 1);
				}
				
				cPath = cPathParts.slice(1).join('/'); // put the rest of it back together
				currentLevelData = currentDatum.children;
				parentDatum = currentDatum;
			}

			setSelection([currentNode]);
			scrollToNode(currentNode);
			if (highlight) {
				setHighlitedDatum(currentDatum);
			}

			setTreeNodeData(newTreeNodeData);
			buildRowToDatumMap();
		},
		scrollToNode = (node) => {
			// Helper for expandPath
			// Scroll the tree so the given node is in view

			// TODO: This will probably need different methods in web and mobile

			// From Github Copliot:
			// In React, if you want to scroll individual DOM nodes into view, you would typically assign a ref to each of them. However, managing a large number of refs can be cumbersome and may lead to performance issues.
			// An alternative approach is to assign a unique id to each DOM node and use the document.getElementById(id).scrollIntoView() method to scroll to a specific node. This way, you don't need to manage a large number of refs.
			// Here's an example:
			// const MyComponent = () => {
			// 	const scrollTo = (id) => {
			// 	  document.getElementById(id).scrollIntoView();
			// 	};
			// 	return (
			// 	  <div>
			// 		{Array.from({ length: 100 }).map((_, index) => (
			// 		  <div id={`item-${index}`} key={index}>
			// 			Item {index}
			// 		  </div>
			// 		))}
			// 		<button onClick={() => scrollTo('item-50')}>Scroll to item 50</button>
			// 	  </div>
			// 	);
			// };
			// In this example, we're creating 100 divs each with a unique id. We also have a button that, when clicked, scrolls to the div with the id 'item-50'.
			// Please note that this approach uses the DOM API directly, which is generally discouraged in React. It's recommended to use refs when you need to interact with DOM nodes directly. However, in cases where you need to manage a large number of DOM nodes, using ids can be a more practical solution.
			// Also, keep in mind that document.getElementById(id).scrollIntoView() might not work as expected in all situations, especially in complex layouts or when using certain CSS properties. Always test your code thoroughly to make sure it works as expected.

			// ... Not sure how to do this with NativeBase, as I've had trouble assigning IDs
			// Maybe I first collapse the tree, then expand just the cPath?
		},

		// render
		getHeaderToolbarItems = () => {
			const
				buttons = [
					{
						key: 'searchBtn',
						text: 'Search tree',
						handler: () => onSearchTree(treeSearchValue),
						icon: MagnifyingGlass,
						isDisabled: !treeSearchValue.length,
					},
					{
						key: 'collapseAllBtn',
						text: 'Collapse whole tree',
						handler: onCollapseAll,
						icon: Collapse,
						isDisabled: false,
					},
					{
						key: 'expandAllBtn',
						text: 'Expand whole tree',
						handler: onExpandAll,
						icon: Expand,
						isDisabled: false,
					},
				];
			if (canNodesReorder) {
				buttons.push({
					key: 'reorderBtn',
					text: (isDragMode ? 'Exit' : 'Enter') + ' reorder mode',
					handler: () => {
						setIsDragMode(!isDragMode);
					},
					icon: isDragMode ? NoReorderRows : ReorderRows,
					isDisabled: false,
				});
			}
			const items = _.map(buttons, (config, ix) => getIconButtonFromConfig(config, ix, self));

			items.unshift(<Input // Add text input to beginning of header items
				key="searchNodes"
				flex={1}
				placeholder="Find tree node"
				onChangeText={(val) => setTreeSearchValue(val)}
				onKeyPress={(e) => {
					if (e.key === 'Enter') {
						onSearchTree(treeSearchValue);
					}
				}}
				value={treeSearchValue}
				autoSubmit={false}
			/>);

			if (treeSearchValue.length) {
				// Add 'X' button to clear search
				items.unshift(getIconButtonFromConfig({
					key: 'xBtn',
					handler: () => {
						setHighlitedDatum(null);
						setTreeSearchValue('');
					},
					icon: Xmark,
				}, 0, self));
			}

			return items;
		},
		getFooterToolbarItems = () => {
			return _.map(additionalToolbarButtons, (config, ix) => getIconButtonFromConfig(config, ix, self));
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
						{...testProps((Repository ? Repository.schema.name : 'TreeNode') + '-' + item?.id)}
						key={item.hash}
						onPress={(e) => {
							if (e.preventDefault && e.cancelable) {
								e.preventDefault();
							}
							if (isDragMode) {
								return
							}
							switch (e.detail) {
								case 0: // simulated click
								case 1: // single click
									onNodeClick(item, e); // sets selection
									break;
								case 2: // double click
									if (!isSelected) { // If a row was already selected when double-clicked, the first click will deselect it,
										onNodeClick(item, e); // so reselect it
									}
									if (onEdit) {
										if (canUser && !canUser(EDIT)) { // permissions
											return;
										}
										if (canRecordBeEdited && !canRecordBeEdited(selection)) { // record can be edited
											return;
										}
										onEdit();
									} else if (onView) {
										if (canUser && !canUser(VIEW)) { // permissions
											return;
										}
										onView();
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
										isSelected={isSelected}

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
				// console.log('setDropRowIx', newIx);
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

		if (!Repository) {
			(async () => {
				await buildAndSetTreeNodeData();
				setIsReady(true);
			})();
			return () => {};
		}
		
		// set up @onehat/data repository
		const
			setTrue = () => setIsLoading(true),
			setFalse = () => setIsLoading(false);

		if (Repository.isLoading) {
			setTrue();
		}
		
		Repository.on('beforeLoad', setTrue);
		Repository.on('load', setFalse);
		Repository.on('loadRootNodes', setFalse);
		Repository.on('loadRootNodes', buildAndSetTreeNodeData);
		Repository.on('add', buildAndSetTreeNodeData);
		Repository.on('changeFilters', reloadTree);
		Repository.on('changeSorters', reloadTree);

		(async () => {
			if (autoLoadRootNodes) {
				await reloadTree();
			}
			setIsReady(true);
		})();

		return () => {
			Repository.off('beforeLoad', setTrue);
			Repository.off('load', setFalse);
			Repository.off('loadRootNodes', setFalse);
			Repository.off('loadRootNodes', buildAndSetTreeNodeData);
			Repository.off('add', buildAndSetTreeNodeData);
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

	if (canUser && !canUser('view')) {
		return <Unauthorized />;
	}

	if (setWithEditListeners) {
		setWithEditListeners({ // Update withEdit's listeners on every render
			onBeforeAdd,
			onAfterAdd,
			onAfterAddSave,
			onBeforeEditSave,
			onAfterEdit,
			onBeforeDeleteSave,
			onAfterDelete,
		});
	}

	// update self with methods
	if (self) {
		self.reloadTree = reloadTree;
		self.expandPath = expandPath;
		self.scrollToNode = scrollToNode;
	}
	
	const
		headerToolbarItemComponents = useMemo(() => getHeaderToolbarItems(), [Repository?.hash, treeSearchValue, isDragMode, getTreeNodeData()]),
		footerToolbarItemComponents = useMemo(() => getFooterToolbarItems(), [Repository?.hash, additionalToolbarButtons, isDragMode, getTreeNodeData()]);

	if (!isReady) {
		return <Loading />;
	}
	
	const treeNodes = renderTreeNodes(getTreeNodeData());

	// headers & footers
	let treeFooterComponent = null;
	if (!disableBottomToolbar) {
		if (Repository && bottomToolbar === 'pagination' && !disablePagination && Repository.isPaginated) {
			treeFooterComponent = <PaginationToolbar
										Repository={Repository}
										self={self}
										toolbarItems={footerToolbarItemComponents}
									/>;
		} else if (footerToolbarItemComponents.length) {
			treeFooterComponent = <Toolbar>
										<ReloadTreeButton Repository={Repository} self={self} />
										{footerToolbarItemComponents}
									</Toolbar>;
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
					{...testProps(self)}
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
						bg="#fff"
						{...borderProps}
						onClick={() => {
							if (!isDragMode) {
								deselectAll();
							}
						}}
					>
						<ScrollView {...testProps('ScrollView')} flex={1} w="100%">
							{!treeNodes?.length ? 
								<NoRecordsFound text={noneFoundText} onRefresh={reloadTree} /> :
								treeNodes}
						</ScrollView>
					</Column>

					{treeFooterComponent}

				</Column>

				<Modal
					isOpen={isModalShown}
					onClose={() => setIsModalShown(false)}
				>
					<Column bg="#fff" w={300}>
						<FormPanel
							_panel={{ 
								title: 'Choose Tree Node',
							}}
							instructions="Multiple tree nodes matched your search. Please select which one to show."
							_form={{ 
								flex: 1,
								items: [
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
								],
								onCancel: (e) => {
									setHighlitedDatum(null);
									setIsModalShown(false);
								},
								onSave: (data, e) => {
									const
										treeNode = _.find(searchResults, (item) => {
											return item.id === data.node_id;
										}),
										cPath = treeNode.cPath;
									expandPath(cPath);
	
									// Close the modal
									setIsModalShown(false);
								},
							}}
						/>
					</Column>
				</Modal>
			</>;

}

export const Tree = withComponent(
						withAlert(
							withEvents(
								withData(
									withPermissions(
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
							)
						)
					);

export const SideTreeEditor = withComponent(
									withAlert(
										withEvents(
											withData(
												withPermissions(
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
										)
									)
								);

export const WindowedTreeEditor = withComponent(
									withAlert(
										withEvents(
											withData(
												withPermissions(
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
										)
									)
								);

export default Tree;
