import { useState, useEffect, useRef, useMemo, } from 'react';
import {
	HStack,
	Pressable,
	ScrollView,
	VStack,
	VStackNative,
} from '@project-components/Gluestack';
import clsx from 'clsx';
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
import {
	UI_MODE_WEB,
	UI_MODE_NATIVE,
	CURRENT_MODE,
} from '../../Constants/UiModes.js';
import UiGlobals from '../../UiGlobals.js';
import useForceUpdate from '../../Hooks/useForceUpdate.js';
import withContextMenu from '../Hoc/withContextMenu.js';
import withAlert from '../Hoc/withAlert.js';
import withComponent from '../Hoc/withComponent.js';
import withData from '../Hoc/withData.js';
import { withDropTarget } from '../Hoc/withDnd.js';
import withEvents from '../Hoc/withEvents.js';
import withSideEditor from '../Hoc/withSideEditor.js';
import withFilters from '../Hoc/withFilters.js';
import withModal from '../Hoc/withModal.js';
import withMultiSelection from '../Hoc/withMultiSelection.js';
import withPresetButtons from '../Hoc/withPresetButtons.js';
import withPermissions from '../Hoc/withPermissions.js';
import withSelection from '../Hoc/withSelection.js';
import withWindowedEditor from '../Hoc/withWindowedEditor.js';
import getIconButtonFromConfig from '../../Functions/getIconButtonFromConfig.js';
import inArray from '../../Functions/inArray.js';
import testProps from '../../Functions/testProps.js';
import CenterBox from '../Layout/CenterBox.js';
import ReloadButton from '../Buttons/ReloadButton.js';
import TreeNode, { DragSourceDropTargetTreeNode, DragSourceTreeNode, DropTargetTreeNode } from './TreeNode.js';
import FormPanel from '../Panel/FormPanel.js';
import Input from '../Form/Field/Input.js';
import Xmark from '../Icons/Xmark.js';
import Dot from '../Icons/Dot.js';
import Collapse from '../Icons/Collapse.js';
import Expand from '../Icons/Expand.js';
import Gear from '../Icons/Gear.js';
import MagnifyingGlass from '../Icons/MagnifyingGlass.js';
import PaginationToolbar from '../Toolbar/PaginationToolbar.js';
import NoRecordsFound from '../Grid/NoRecordsFound.js';
import Toolbar from '../Toolbar/Toolbar.js';
import Loading from '../Messages/Loading.js';
import Unauthorized from '../Messages/Unauthorized.js';
import _ from 'lodash';

const
	DEPTH_INDENT_PX = 25,
	SIMULATED_CLICK = 0,
	SINGLE_CLICK = 1,
	DOUBLE_CLICK = 2,
	TRIPLE_CLICK = 3,
	TREE_NODE_INTERNAL = 'TREE_NODE_INTERNAL';

// NOTE: If using TreeComponent with getCustomDragProxy, ensure that <GlobalDragProxy /> exists in App.js

function TreeComponent(props) {
	const {
			areRootsVisible = true,
			autoLoadRootNodes = true,
			autoSelectRootNode = false,
			extraParams = {}, // Additional params to send with each request ( e.g. { order: 'Categories.name ASC' })
			isNodeTextConfigurable = false,
			editDisplaySettings, // fn
			getNodeText = (item) => { // extracts model/data and decides what the row text should be
				if (Repository) {
					return item.displayValue;
				}
				return item[displayIx];
			},
			getNodeContent = (item) => { // extracts model/data and decides what the row content should be
				return null;
			},
			getDisplayTextFromSearchResults = (item) => {
				return item.id
			},
			getNodeIcon = (item) => {
				// TODO: Allow for dynamic props on the icon (e.g. special color for some icons)
				return Dot;
			},
			getNodeProps = (item) => {
				return {};
			},
			noneFoundText,
			disableLoadingIndicator = false,
			disableSelectorSelected = false,
			hideReloadBtn = false,
			showHeaderToolbar = true,
			showHovers = true,
			showSelectHandle = true,
			isNodeSelectable = true,
			isNodeHoverable = true,
			allowToggleSelection = true, // i.e. single click with no shift key toggles the selection of the node clicked on
			allowDeselectAll = true, // allow deselecting all nodes by clicking on empty space in tree
			forceSelectionOnCollapse = false, // when true, maintains selection by auto-selecting appropriate nodes when collapse would hide current selection
			disableBottomToolbar = false,
			bottomToolbar = null,
			topToolbar = null,
			additionalToolbarButtons = [],
			reload = null, // Whenever this value changes after initial render, the tree will reload from scratch
			parentIdIx,
			initialSelection,
			canRecordBeEdited,
			onTreeLoad,
			onLayout,
			selectorId,
			selectorSelected,
			selectorSelectedField = 'id',

			// DND
			canNodesMoveInternally = false,
			canNodeMoveInternally, // optional fn to customize whether each node can be dragged INternally
			canNodeMoveExternally, // optional fn to customize whether each node can be dragged EXternally
			canNodeAcceptDrop, // optional fn to customize whether each node can accept a dropped item: (targetItem, draggedItem) => boolean
			getCustomDragProxy, // optional fn to render custom drag preview: (item, selection) => ReactElement
			dragPreviewOptions, // optional object for drag preview positioning options
			areNodesDragSource = false,
			nodeDragSourceType,
			getNodeDragSourceItem,
			areNodesDropTarget = false,
			dropTargetAccept,
			onNodeDrop,

			// withComponent
			self,

			// withAlert
			alert,
			confirm,
			showInfo,

			// withModal
			showModal,
			hideModal,
		
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

			// withDnd
			isDropTarget,
			canDrop,
			isOver,
			dropTargetRef,

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
			disableSelectionChanges,
			enableSelectionChanges,
			refreshSelection,

		} = props,
		forceUpdate = useForceUpdate(),
		treeRef = useRef(),
		treeNodeData = useRef(),
		dragSelectionRef = useRef([]),
		[isReady, setIsReady] = useState(false),
		[isLoading, setIsLoading] = useState(false),
		[searchResults, setSearchResults] = useState([]),
		[searchFormData, setSearchFormData] = useState([]),
		[highlitedDatum, setHighlitedDatum] = useState(null),
		[treeSearchValue, setTreeSearchValue] = useState(''),
		showNodeHandle = showSelectHandle || areNodesDragSource,
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

			const {
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
				parentDatum = getDatumById(parent.id);

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
				parentDatum = getDatumById(parent.id);
			if (!parent.hasChildren) {
				parent.hasChildren = true; // since we're adding a new child
			}
			if (!parentDatum.isExpanded) {
				parentDatum.isExpanded = true;
			}

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
				existingDatum = getDatumById(node.id), // TODO: Make this work for >1 entity
				newDatum = buildTreeNodeDatum(node);

			// copy the updated data to existingDatum
			_.assign(existingDatum, newDatum);
			existingDatum.isLoading = false;


			if (node.parent?.id) {
				const
					existingParentDatum = getDatumById(node.parent.id),
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
				datum = getDatumById(node.id); // TODO: Make this work for >1 entity
			
			datum.isLoading = true;
			forceUpdate();
		},
		onAfterDelete = async (entities) => {
			const parent = entities[0].parent;
			if (parent) {
				await reloadNode(parent);
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
					if (forceSelectionOnCollapse) {
						// Select the node being collapsed instead of deselecting all
						setSelection([datum.item]);
					} else {
						deselectAll();
					}
				}
			}
			
			forceUpdate();
		},
		onCollapseAll = () => {
			const newTreeNodeData = [...getTreeNodeData()];
			
			// Check if current selection will be hidden after collapse
			let willSelectionBeHidden = false;
			if (forceSelectionOnCollapse && selection.length > 0) {
				// After collapse, only root nodes will be visible
				const rootNodeIds = newTreeNodeData.map(datum => datum.item.id);
				willSelectionBeHidden = !selection.some(selectedItem => 
					rootNodeIds.includes(selectedItem.id)
				);
			}
			
			collapseNodes(newTreeNodeData);
			setTreeNodeData(newTreeNodeData);
			
			// If selection will be hidden and we have root nodes, select the first root
			if (willSelectionBeHidden && newTreeNodeData.length > 0) {
				setSelection([newTreeNodeData[0].item]);
			}
		},
		onExpandAll = () => {
			confirm('Are you sure you want to expand the whole tree? This may take a while.', async () => {
				const newTreeNodeData = [...getTreeNodeData()];
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
			showChooseTreeNode();
		},
		showChooseTreeNode = () => {
			showModal({
				body: <VStack className="bg-white w-[300px]">
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
									hideModal();
								},
								onSave: (data, e) => {
									const
										treeNode = _.find(searchResults, (item) => {
											return item.id === data.node_id;
										}),
										cPath = treeNode.cPath;
									expandPath(cPath);
									hideModal();
								},
							}}
						/>
					</VStack>,
				onCancel: hideModal,
			});
		},

		// internal DND
		onInternalNodeDrop = async (droppedOn, droppedItem) => {
			let selectedNodes = [];
			if (droppedItem.getSelection) {
				selectedNodes = droppedItem.getSelection();
			}
			if (_.isEmpty(selectedNodes)) {
				selectedNodes = [droppedItem.item];
			}

			// filter out nodes that would already be moved by others in the selection
			const selectedNodesClone = [...selectedNodes];
			selectedNodes = selectedNodes.filter((node) => {
				let isDescendant = false;
				_.each(selectedNodesClone, (otherNode) => {
					if (node.id === otherNode.id) {
						return false; // skip self
					}
					isDescendant = isDescendantOf(node, otherNode);
					if (isDescendant) {
						return false; // found descendant; break loop
					}
					isDescendant = isDescendantOf(otherNode, node);
					if (isDescendant) {
						return false; // found ancestor; break loop
					}
				});
				return !isDescendant;
			});
			
			const isMultiSelection = selectedNodes.length > 1;
			if (isMultiSelection) {
				alert('moving multiple disparate nodes not yet implemented');
				return;
			}

			// Check if drop target had no children before the move
			const
				hadNoChildrenBefore = !droppedOn.hasChildren,
				selectedNode = selectedNodes[0],
				commonAncestorId = await Repository.moveTreeNode(selectedNode, droppedOn.id);
			const commonAncestorDatum = getDatumById(commonAncestorId);

			disableSelectionChanges(); // the reloadNode() commands change the selection. We don't want this when dragging and dropping the tree

			await reloadNode(commonAncestorDatum.item); // **selectionChange to [] bc child node no longer exists

			// If drop target gained its first children, reload it specifically and expand it
			if (hadNoChildrenBefore) {
				const refreshedDroppedOn = Repository.getById(droppedOn.id);
				if (refreshedDroppedOn && refreshedDroppedOn.hasChildren) {
					// Reload the drop target to get its new children
					await reloadNode(refreshedDroppedOn); // **selectionChange
					
					// Now expand it to show the moved node
					const dropTargetDatum = getDatumById(refreshedDroppedOn.id);
					if (dropTargetDatum) {
						dropTargetDatum.isExpanded = true;
						forceUpdate();
					}
				}
			}
			enableSelectionChanges();
			refreshSelection();

		},

		// utilities
		buildTreeNodeDatum = (treeNode, defaultToExpanded = false) => {
			// Build the data-representation of one node and its children,
			// caching text & icon, keeping track of the state for whole tree
			// renderTreeNode uses this to render the nodes.
			const
				isRoot = treeNode.isRoot,
				children = buildTreeNodeData(treeNode.children, defaultToExpanded), // recursively get data for children
				datum = {
					item: treeNode,
					treeRef,
					text: getNodeText(treeNode),
					content: getNodeContent ? getNodeContent(treeNode) : null,
					icon: getNodeIcon(treeNode),
					isExpanded: treeNode.isExpanded || defaultToExpanded || isRoot, // all non-root treeNodes are collapsed by default
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
				if (!Repository.isDestroyed) {
					if (!Repository.isLoaded) {
						nodes = await Repository.loadRootNodes(1);
					} else {
						nodes = Repository.getRootNodes();
					}
				}
			} else {
				nodes = assembleDataTreeNodes();
			}

			const treeNodeData = buildTreeNodeData(nodes);
			setTreeNodeData(treeNodeData);

			if (onTreeLoad) {
				onTreeLoad(self);
			}
			return treeNodeData;
		},
		buildAndSetOneTreeNodeData = (entity) => {
			
			if (!entity || !entity.parent) {
				// If no parent, it might be a root node, so rebuild the tree
				buildAndSetTreeNodeData();
				return;
			}

			const parentDatum = getDatumById(entity.parent.id);
			if (!parentDatum) {
				// Parent not found in current tree structure, rebuild
				buildAndSetTreeNodeData();
				return;
			}

			// Create datum for the new entity and add it to parent's children
			const newDatum = buildTreeNodeDatum(entity);
			parentDatum.children.push(newDatum);
			
			// Update parent to show it has children and expand if needed
			if (!entity.parent.hasChildren) {
				entity.parent.hasChildren = true;
			}
			if (!parentDatum.isExpanded) {
				parentDatum.isExpanded = true;
			}

			forceUpdate();
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
				if (!Repository.isDestroyed) {
					return Repository.getById(node_id);
				}
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

			const clonedData = [...data];

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
		belongsToThisTree = (treeNode) => {
			if (!treeNode) {
				return false;
			}
			const datum = getDatumById(treeNode.id);
			if (!datum) {
				return false;
			}
			return datum.treeRef === treeRef;
		},
		isDescendantOf = (potentialDescendant, potentialAncestor) => {
			// Check if potentialDescendant is a descendant of potentialAncestor
			// by walking up the parent chain from potentialDescendant
			let currentTreeNode = potentialDescendant;
			while(currentTreeNode) {
				if (currentTreeNode.id === potentialAncestor.id) {
					return true;
				}
				currentTreeNode = currentTreeNode.parent;
			}
			return false;
		},
		isChildOf = (potentialChild, potentialParent) => {
			return potentialChild.parent?.id === potentialParent.id;
		},
		reloadTree = () => {
			Repository.areRootNodesLoaded = false;
			return buildAndSetTreeNodeData();
		},
		reloadNode = async (node) => {
			// mark node as loading
			const existingDatum = getDatumById(node.id);
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

				let defaultToExpanded = false;
				if (depth === 'all') {
					defaultToExpanded = true;
					depth = 9999;
				}

				const
					node = await datum.item.loadChildren(depth),
					directChildren = _.filter(node.children, (child) => { // narrow list to only direct descendants, so buildTreeNodeData can work correctly
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
		},
		collapseNodes = (nodes) => {
			collapseNodesRecursive(nodes);
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
			let newTreeNodeData = [...getTreeNodeData()];
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
					// {
					// 	key: 'searchBtn',
					// 	text: 'Search tree',
					// 	handler: () => onSearchTree(treeSearchValue),
					// 	icon: MagnifyingGlass,
					// 	isDisabled: !treeSearchValue.length,
					// },
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
			if (isNodeTextConfigurable && editDisplaySettings) {
				buttons.push({
					key: 'editNodeTextBtn',
					text: 'Display Settings',
					handler: () => editDisplaySettings(),
					icon: Gear,
				});
			}
			const items = _.map(buttons, (config, ix) => getIconButtonFromConfig(config, ix, self));

			// items.unshift(<Input // Add text input to beginning of header items
			// 	key="searchNodes"
			// 	className="flex-1"
			// 	placeholder="Find tree node"
			// 	onChangeText={(val) => setTreeSearchValue(val)}
			// 	onKeyPress={(e) => {
			// 		if (e.key === 'Enter') {
			// 			onSearchTree(treeSearchValue);
			// 		}
			// 	}}
			// 	value={treeSearchValue}
			// 	autoSubmit={false}
			// />);

			// if (treeSearchValue.length) {
			// 	// Add 'X' button to clear search
			// 	items.unshift(getIconButtonFromConfig({
			// 		key: 'xBtn',
			// 		handler: () => {
			// 			setHighlitedDatum(null);
			// 			setTreeSearchValue('');
			// 		},
			// 		icon: Xmark,
			// 	}, 0, self));
			// }

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
							switch (e.detail) {
								case SIMULATED_CLICK:
								case SINGLE_CLICK:
									onNodeClick(item, e); // sets selection
									break;
								case DOUBLE_CLICK:
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
								case TRIPLE_CLICK:
									break;
								default:
							}
						}}
						onLongPress={(e) => {
							if (e.preventDefault && e.cancelable) {
								e.preventDefault();
							}

							if (!setSelection) {
								return;
							}
							
							// context menu
							const selection = [item];
							setSelection(selection);
							if (onContextMenu) {
								onContextMenu(item, e, selection);
							}
						}}
						onContextMenu={(e) => {
							// web only; happens before onLongPress triggers
							// different behavior here than onLongPress:
							// if user clicks on a phantom record, or if onContextMenu is not set, pass to the browser's context menu
							if (selection && selection[0] && selection[0].isRemotePhantom) {
								return; // block context menu or changing selection when a remote phantom is already selected
							}
							if (onContextMenu) {
								e.preventDefault();
								e.stopPropagation(); // disallow browser's default behavior for context menu

								// if the right-clicked item is not in the current selection,
								// set the selection only to this one item.
								let newSelection = selection;
								if (!isInSelection(item)) {
									newSelection = [item];
									setSelection(newSelection);
								}

								if (onContextMenu) {
									onContextMenu(item, e, newSelection);
								}
							}
						}}
						className={clsx(
							'Pressable',
							'Node',
							'flex-row',
						)}
						style={{
							paddingLeft: (areRootsVisible ? depth : depth -1) * DEPTH_INDENT_PX,
						}}
					>
						{({
							hovered,
							focused,
							pressed,
						}) => {
							const nodeDragProps = {};
							let WhichNode = TreeNode,
								nodeCanSelect = true,
								nodeCanDrag = false;
							if (CURRENT_MODE === UI_MODE_WEB) { // DND is currently web-only  TODO: implement for RN
								dragSelectionRef.current = selection;
								const
									getSelection = () => dragSelectionRef.current,
									userHasPermissionToDrag = (!canUser || canUser(EDIT));
								if (userHasPermissionToDrag) {
									const
										shouldSupportInternalDrag = canNodesMoveInternally,
										shouldSupportExternalDrag = areNodesDragSource,
										shouldSupportExternalDrop = areNodesDropTarget,
										supportedDragTypes = [],
										acceptedDropTypes = [];
									
									if (shouldSupportInternalDrag) {
										supportedDragTypes.push(TREE_NODE_INTERNAL);
									}
									if (shouldSupportExternalDrag) {
										supportedDragTypes.push(nodeDragSourceType);
									}
									if (shouldSupportInternalDrag) {
										acceptedDropTypes.push(TREE_NODE_INTERNAL);
									}
									if (shouldSupportExternalDrop) {
										acceptedDropTypes.push(dropTargetAccept);
									}

									// Set up drag source if needed
									if (supportedDragTypes.length > 0) {
										// If only internal drag is supported, root nodes cannot be dragged
										// since they cannot be dropped anywhere valid within the tree
										const canDragRootNode = shouldSupportExternalDrag || !shouldSupportInternalDrag;
										nodeDragProps.isDragSource = canDragRootNode || !item.isRoot;
										
										// Use the primary drag type (external takes precedence if both are supported)
										// This is what react-dnd will use as the main type for drag operations
										nodeDragProps.dragSourceType = shouldSupportExternalDrag ? supportedDragTypes.find(type => type !== TREE_NODE_INTERNAL) || supportedDragTypes[0] : supportedDragTypes[0];
										
										// Create unified drag source item
										const baseDragSourceItem = {
											id: item.id,
											item,
											getSelection,
											isInSelection,
											type: nodeDragProps.dragSourceType, // Primary drag type
											supportedDragTypes, // Include all supported types
											sourceComponentRef: treeRef, // Reference to the originating component
											dragContext: {
												isInternal: shouldSupportInternalDrag,
												isExternal: shouldSupportExternalDrag,
												sourceComponent: treeRef
											},
											onDragStart: () => {
												if (!isInSelection(item)) { // get updated isSelected (will be stale if using one in closure)
													// reset the selection to just this one node if it's not already selected
													setSelection([item]);
												}
											},
										};
										
										// Add external drag properties if needed
										if (shouldSupportExternalDrag && getNodeDragSourceItem) {
											const externalDragItem = getNodeDragSourceItem(item, getSelection, isInSelection, nodeDragSourceType);
											Object.assign(baseDragSourceItem, externalDragItem);
										}
										
										nodeDragProps.dragSourceItem = baseDragSourceItem;

										// Unified canDrag logic
										nodeDragProps.canDrag = (monitor) => {
											const currentSelection = getSelection();
											
											// Root nodes can be dragged - restriction is handled in drop validation
											
											// Use custom drag validation if provided
											if (shouldSupportInternalDrag && canNodeMoveInternally) {
												// In multi-selection, all nodes must be draggable
												const internalValid = currentSelection.every(node => canNodeMoveInternally(node));
												if (!internalValid) return false;
											}
											
											if (shouldSupportExternalDrag && canNodeMoveExternally) {
												const externalValid = canNodeMoveExternally(monitor);
												if (!externalValid) return false;
											}
											
											return true;
										};

										// Add custom drag preview options
										if (dragPreviewOptions) {
											nodeDragProps.dragPreviewOptions = dragPreviewOptions;
										}

										// Add drag preview rendering
										nodeDragProps.getDragProxy = getCustomDragProxy ? 
											(dragItem) => getCustomDragProxy(item, getSelection()) :
											null; // let GlobalDragProxy handle the default case

										nodeCanDrag = true;
									}

									// Set up drop target if needed
									if (acceptedDropTypes.length > 0) {
										nodeDragProps.isDropTarget = true;
										nodeDragProps.dropTargetAccept = acceptedDropTypes;
										
										// drop validation
										const validateDrop = (draggedItem) => {
											if (!draggedItem) {
												return false;
											}
											
											// Determine if this is an internal drop based on component reference
											// If sourceComponentRef is undefined, treat as external drop
											const isInternalDrop = draggedItem.sourceComponentRef && 
																   draggedItem.sourceComponentRef === treeRef;
											
											if (isInternalDrop && shouldSupportInternalDrag) {
												// Internal drop validation
												const currentSelection = getSelection();

												// Always include the dragged item itself in validation
												// If no selection exists, the dragged item is what we're moving
												const nodesToValidate = currentSelection.length > 0 ? currentSelection : [draggedItem.item];
												
												// Root nodes cannot be moved internally within the same tree
												const hasRootNode = nodesToValidate.some(node => node.isRoot);
												if (hasRootNode) {
													return false;
												}
												
												// validate that the dropped item is not already a direct child of the target node
												if (isChildOf(draggedItem.item, item)) {
													return false;
												}

												// Validate that none of the nodes being moved can be dropped into the target location
												for (const nodeToMove of nodesToValidate) {
													if (nodeToMove.id === item.id) {
														// Cannot drop a node onto itself
														return false;
													}
													if (isDescendantOf(item, nodeToMove)) {
														// Cannot drop a node into its own descendants
														return false;
													}
												}
												
												// Internal drops are allowed if they pass the above validations
												return true;
											} else {
												// External drop validation - use custom business logic
												if (canNodeAcceptDrop && typeof canNodeAcceptDrop === 'function') {
													return canNodeAcceptDrop(item, draggedItem);
												}
												
												// Allow external drops by default if no custom validation is provided
												return true;
											}
										};
										nodeDragProps.canDrop = (draggedItem, monitor) => validateDrop(draggedItem); // for React DnD
										nodeDragProps.validateDrop = validateDrop; // for visual feedback
										
										// drop handler
										nodeDragProps.onDrop = (droppedItem) => {
											// Determine if this is an internal drop based on component reference
											// If sourceComponentRef is undefined, treat as external drop
											const isInternalDrop = droppedItem.sourceComponentRef && 
																   droppedItem.sourceComponentRef === treeRef;
											
											if (isInternalDrop && shouldSupportInternalDrag) {
												onInternalNodeDrop(item, droppedItem);
											} else if (shouldSupportExternalDrop && onNodeDrop) {
												onNodeDrop(item, droppedItem);
											}
										};
									}

									if (nodeDragProps.isDragSource && nodeDragProps.isDropTarget) {
										WhichNode = DragSourceDropTargetTreeNode;
									} else if (nodeDragProps.isDragSource) {
										WhichNode = DragSourceTreeNode;
									} else if (nodeDragProps.isDropTarget) {
										WhichNode = DropTargetTreeNode;
									}
								}
							}
							
							return <WhichNode
										datum={datum}
										nodeProps={nodeProps}
										onToggle={onToggle}
										isNodeSelectable={isNodeSelectable}
										isNodeHoverable={isNodeHoverable}
										isSelected={isSelected}
										isHovered={hovered}
										showHovers={showHovers}
										showNodeHandle={showNodeHandle}
										nodeCanSelect={nodeCanSelect}
										nodeCanDrag={nodeCanDrag}
										isHighlighted={highlitedDatum === datum}
										{...nodeDragProps}

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
		Repository.on('add', buildAndSetOneTreeNodeData);
		Repository.on('changeFilters', reloadTree);
		Repository.on('changeSorters', reloadTree);

		(async () => {
			if (autoLoadRootNodes) {
				await reloadTree();
			}
			if (autoSelectRootNode) {
				const rootNodes = Repository.getRootNodes();
				if (rootNodes.length) {
					setSelection([rootNodes[0]]);
				}
			}
			setIsReady(true);
		})();

		return () => {
			Repository.off('beforeLoad', setTrue);
			Repository.off('load', setFalse);
			Repository.off('loadRootNodes', setFalse);
			Repository.off('loadRootNodes', buildAndSetTreeNodeData);
			Repository.off('add', buildAndSetOneTreeNodeData);
			Repository.off('changeFilters', reloadTree);
			Repository.off('changeSorters', reloadTree);
		};
	}, []);

	useEffect(() => {
		if (!Repository) {
			return () => {};
		}
		if (!disableSelectorSelected && selectorId) {
			let id = selectorSelected?.[selectorSelectedField] ?? null;
			if (_.isEmpty(selectorSelected)) {
				id = noSelectorMeansNoResults ? 'NO_MATCHES' : null;
			}
			Repository.filter(selectorId, id, false); // so it doesn't clear existing filters
		}
	}, [selectorId, selectorSelected]);

	if (canUser && !canUser('view')) {
		return <CenterBox>
					<Unauthorized />
				</CenterBox>;
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
		self.buildAndSetTreeNodeData = buildAndSetTreeNodeData;
		self.forceUpdate = forceUpdate;
	}
	
	const
		headerToolbarItemComponents = showHeaderToolbar ? useMemo(() => getHeaderToolbarItems(), [Repository?.hash, treeSearchValue, getTreeNodeData()]) : null,
		footerToolbarItemComponents = useMemo(() => getFooterToolbarItems(), [Repository?.hash, additionalToolbarButtons, getTreeNodeData()]);

	if (!isReady) {
		return <CenterBox>
					<Loading />
				</CenterBox>;
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
										{!hideReloadBtn && <ReloadButton isTree={true} Repository={Repository} self={self} />}
										{footerToolbarItemComponents}
									</Toolbar>;
		}
	}

	let className = clsx(
		'Tree-VStack',
		'flex-1',
		'w-full',
		'min-w-[300px]',
	);
	if (isLoading) {
		className += ' border-t-2 border-[#f00]';
	} else {
		className += ' border-t-1 border-grey-300';
	}
	if (props.className) {
		className += ' ' + props.className;
	}

	return <VStackNative
				{...testProps(self)}
				className={className}
				onLayout={onLayout}
			>
				{topToolbar}

				{headerToolbarItemComponents?.length && <HStack>{headerToolbarItemComponents}</HStack>}

				<VStack
					ref={treeRef}
					onClick={() => {
						if (allowDeselectAll) {
							deselectAll();
						}
					}}
					className="Tree-deselector w-full flex-1 p-1 bg-white"
				>
					<ScrollView
						{...testProps('ScrollView-Vertical')}
						className="Tree-ScrollView flex-1 w-full"
						contentContainerStyle={{
							minHeight: '100%',
						}}
					>
						<ScrollView
							{...testProps('ScrollView-Horizontal')}
							horizontal={true}
							className="w-full"
							contentContainerStyle={{
								minWidth: '100%',
								flexDirection: 'column', // Keep vertical stacking
							}}
						>
							{!treeNodes?.length ? 
							<CenterBox>
								{Repository.isLoading ? <Loading /> : <NoRecordsFound text={noneFoundText} onRefresh={reloadTree} />}
							</CenterBox> :
							treeNodes}
						</ScrollView>
					</ScrollView>
				</VStack>

				{treeFooterComponent}

			</VStackNative>;

}

export const Tree = withComponent(
						withAlert(
							withEvents(
								withData(
									withPermissions(
										withDropTarget(
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
						)
					);

export const SideTreeEditor = withComponent(
									withAlert(
										withEvents(
											withData(
												withPermissions(
													withDropTarget(
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
									)
								);

export const WindowedTreeEditor = withComponent(
									withAlert(
										withEvents(
											withData(
												withPermissions(
													withDropTarget(
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
									)
								);

export default Tree;
