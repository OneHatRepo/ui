import { useState, useEffect, useRef, useMemo, useCallback, } from 'react';
import {
	Box,
	FlatList,
	HStack,
	Pressable,
	// ScrollView,
	VStack,
	VStackNative,
} from '@project-components/Gluestack';
import {
	ScrollView,
} from 'react-native';
import {
	SELECTION_MODE_SINGLE,
	SELECTION_MODE_MULTI,
} from '../../Constants/Selection.js';
import {
	EDIT,
	VIEW,
} from '../../Constants/Commands.js';
import {
	DROP_POSITION_BEFORE,
	DROP_POSITION_AFTER,
} from '../../Constants/Grid.js';
import {
	UI_MODE_WEB,
	UI_MODE_NATIVE,
	CURRENT_MODE,
} from '../../Constants/UiModes.js';
import {
	hasHeight,
	hasWidth,
	hasFlex,
} from '../../Functions/tailwindFunctions.js';
import * as yup from 'yup'; // https://github.com/jquense/yup#string
import Inflector from 'inflector-js';
import { EDITOR_TYPE__PLAIN } from '../../Constants/Editor.js';
import UiGlobals from '../../UiGlobals.js';
import useForceUpdate from '../../Hooks/useForceUpdate.js';
import withContextMenu from '../Hoc/withContextMenu.js';
import withAlert from '../Hoc/withAlert.js';
import withComponent from '../Hoc/withComponent.js';
import withData from '../Hoc/withData.js';
import { withDropTarget } from '../Hoc/withDnd.js';
import withEvents from '../Hoc/withEvents.js';
import withFilters from '../Hoc/withFilters.js';
import withInlineEditor from '../Hoc/withInlineEditor.js';
import withPermissions from '../Hoc/withPermissions.js';
import withPresetButtons from '../Hoc/withPresetButtons.js';
import withMultiSelection from '../Hoc/withMultiSelection.js';
import withSelection from '../Hoc/withSelection.js';
import withSideEditor from '../Hoc/withSideEditor.js';
import withWindowedEditor from '../Hoc/withWindowedEditor.js';
import Form from '../Form/Form.js';
import getSaved from '../../Functions/getSaved.js';
import setSaved from '../../Functions/setSaved.js';
import getIconButtonFromConfig from '../../Functions/getIconButtonFromConfig.js';
import testProps from '../../Functions/testProps.js';
import gsToHex from '../../Functions/gsToHex.js';
import Loading from '../Messages/Loading.js';
import isSerializable from '../../Functions/isSerializable.js';
import inArray from '../../Functions/inArray.js';
import ReloadButton from '../Buttons/ReloadButton.js';
import CheckboxButton from '../Buttons/CheckboxButton.js';
import GridHeaderRow from './GridHeaderRow.js';
import GridRow, { DragSourceDropTargetGridRow, DragSourceGridRow, DropTargetGridRow } from './GridRow.js';
import Button from '../Buttons/Button.js';
import ExpandButton from '../Buttons/ExpandButton.js';
import IconButton from '../Buttons/IconButton.js';
import PaginationToolbar from '../Toolbar/PaginationToolbar.js';
import NoRecordsFound from './NoRecordsFound.js';
import Toolbar from '../Toolbar/Toolbar.js';
import NoReorderRows from '../Icons/NoReorderRows.js';
import ReorderRows from '../Icons/ReorderRows.js';
import Unauthorized from '../Messages/Unauthorized.js';
import _ from 'lodash';


// This fn gets called many times per component
// First call
// !isInited
// render a placeholder, to get container dimensions
// onInitialLayout()
// set initial pageSize
// setIsInited(true)
// Second call
// !isReady
// set selectorSelected
// load Repo
// Third call
// isReady
// render Grid,
// subsequent calls due to changes of selectorSelected
// re-apply selectorSelected
// subsequent calls due to changes changes in onLayout
// adjust pageSize if needed

// TODO: account for various environments (mainly for optimization):
// RN vs web
// Repository vs data

const
	SINGLE_CLICK = 1,
	DOUBLE_CLICK = 2,
	TRIPLE_CLICK = 3;

function GridComponent(props) {
	const {

			columnsConfig = [], // json configurations for each column
			columnProps = {},
			defaultHiddenColumns = [],
			getRowProps = (item) => {
				return {
					className: `
						border-bottom-1
						border-bottom-grey-500
					`,
				};
			},
			flatListProps = {},
			onRowPress,
			onRender,
			disableLoadOnRender = false,
			forceLoadOnRender = false,
			pullToRefresh = true,
			hideNavColumn = true,
			noneFoundText,
			autoAdjustPageSizeToHeight = true,
			showRowExpander = false,
			getExpandedRowContent,
			showHeaders = true,
			showHovers = true,
			showSelectHandle = true,
			isRowSelectable = true,
			isRowHoverable = true,
			canColumnsSort = true,
			canColumnsReorder = true,
			canColumnsResize = true,
			allowToggleSelection = false, // i.e. single click with no shift key toggles the selection of the item clicked on
			disableBottomToolbar = false,
			disablePagination = false,
			bottomToolbar = 'pagination',
			_paginationToolbarProps = {},
			topToolbar = null,
			additionalToolbarButtons = [],
			bg = '#fff',
			canRecordBeEdited,
			alternateRowBackgrounds = true,
			alternatingInterval = 2,
			defaultRowHeight = 48,
			getRowTestId,
			
			// The selectorSelected mechanism allows us to filter results of the primary model, (e.g. WorkOrders)
			//   by the selection on the secondary model (e.g. Equipment). It's used on Grids, Trees, Forms, etc.
			// The 'selectorId' is the name of the primary model's filter (e.g. 'WorkOrders.equipment_id').
			//   which gets submitted to the server as a condition (e.g. 'conditions[WorkOrders.equipment_id]').
			// The 'selectorSelected' is the Entity on the secondary model which is selected (e.g. Equipment).
			// The 'selectorSelectedField' is the field on the secondary model to use as the value for the filter
			//   (e.g. 'fleet_id'). If not given, it defaults to 'id'.
			// It can be disabled altogether for a specific grid ('disableSelectorSelected'), and configured
			//   so that no selection means no results ('noSelectorMeansNoResults').

			selectorId,
			selectorSelected,
			selectorSelectedField = 'id',
			noSelectorMeansNoResults = false,
			disableSelectorSelected = false,

			// DND
			canRowsReorder = false,
			canRowAcceptDrop, // optional fn to customize whether each node can accept a dropped item: (targetItem, draggedItem) => boolean
			getCustomDragProxy, // optional fn to render custom drag preview: (item, selection) => ReactElement
			dragPreviewOptions, // optional object for drag preview positioning options
			areRowsDragSource = false,
			rowDragSourceType,
			getRowDragSourceItem,
			areRowsDropTarget = false,
			dropTargetAccept,
			onRowDrop,

			// withComponent
			self,

			// withModal
			showModal,
			hideModal,

			// withEditor
			onAdd,
			onEdit,
			onDelete,
			onView,
			onContextMenu,
			isAdding,

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

			// withPresetButtons
			onChangeColumnsConfig,

			// withSelection
			disableWithSelection,
			selection,
			setSelection,
			selectionMode,
			removeFromSelection,
			addToSelection,
			deselectAll,
			selectRangeTo,
			isInSelection,
			selectNext,
			selectPrev,
			addNextToSelection,
			addPrevToSelection,

			// withInlineEditor
			inlineEditor = null,
			isInlineEditorShown = false,
			onEditorRowClick,

		} = props,
		styles = UiGlobals.styles,
		id = props.id || props.self?.path,
		localColumnsConfigKey = id && id + '-localColumnsConfig',
		[hasUnserializableColumns] = useState(() => {
			return !isSerializable(columnsConfig); // (runs only once, when the component is first created)
		}),
		forceUpdate = useForceUpdate(),
		containerRef = useRef(),
		gridRef = useRef(),
		gridContainerRef = useRef(),
		isAddingRef = useRef(),
		expandedRowsRef = useRef({}),
		cachedDragElements = useRef(),
		dragSelectionRef = useRef([]),
		previousSelectorId = useRef(),
		[isInited, setIsInited] = useState(false),
		[isReady, setIsReady] = useState(false),
		[isLoading, setIsLoading] = useState(false),
		[localColumnsConfig, setLocalColumnsConfigRaw] = useState([]),
		[isReorderMode, setIsReorderMode] = useState(false),
		getIsExpanded = (index) => {
			return !!expandedRowsRef.current[index];
		},
		setIsExpanded = (index, isExpanded) => {
			expandedRowsRef.current[index] = isExpanded;
			forceUpdate();
		},
		setLocalColumnsConfig = (config) => {
			if (localColumnsConfigKey) {
				const localConfig = [...config]; // clone it so we don't alter the original
				if (hasUnserializableColumns) {
					// just save the data needed to later reconstruct the columns
					const usedIds = [];
					_.each(localConfig, (column, ix) => {
						if (!column.id || inArray(column.id, usedIds)) {
							throw Error('When using unserializable columns, each column must have a unique id. ' + localColumnsConfigKey);
						}
						usedIds.push(column.id);
						localConfig[ix] = {
							id: column.id,
							isHidden: !!column.isHidden,
						};
						if (column.w) {
							localConfig[ix].w = column.w;
						}
					});
				}
				setSaved(localColumnsConfigKey, localConfig);
			}

			setLocalColumnsConfigRaw(config);
			if (onChangeColumnsConfig) {
				onChangeColumnsConfig(config);
			}
		},
		onRowClick = (item, e) => {
			if (isInlineEditorShown) {
				return;
			}
			if (onRowPress) {
				onRowPress(item, e);
			}
			if (disableWithSelection) {
				return;
			}
			const {
					shiftKey = false,
					metaKey = false,
				 } = e;
			let allowToggle = allowToggleSelection;
			if (metaKey) {
				allowToggle = true;
			}
				
			if (selectionMode === SELECTION_MODE_MULTI) {
				if (shiftKey) {
					if (isInSelection(item)) {
						removeFromSelection(item);
					} else {
						selectRangeTo(item);
					}
				} else {
					if (allowToggle) {
						if (isInSelection(item)) {
							removeFromSelection(item);
						} else {
							addToSelection(item);
						}
					} else {
						if (!isInSelection(item)) {
							// select just this one
							setSelection([item]);
						}
					}
				}
			} else {
				// selectionMode is SELECTION_MODE_SINGLE
				let newSelection = selection;
				if (isInSelection(item)) {
					// Already selected
					if (allowToggle) {
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
			const items = _.map(additionalToolbarButtons, (config, ix) => getIconButtonFromConfig(config, ix, self));
			if (canRowsReorder && CURRENT_MODE === UI_MODE_WEB) { // DND is currently web-only  TODO: implement for RN
				items.unshift(<IconButton
					{...testProps('reorderBtn')}
					key="reorderBtn"
					parent={self}
					reference="reorderBtn"
					onPress={() => setIsReorderMode(!isReorderMode)}
					icon={isReorderMode ? NoReorderRows : ReorderRows}
					_icon={{
						className: styles.TOOLBAR_ITEMS_COLOR,
					}}
					tooltip="Reorder Rows"
				/>);
			}
			return items;
		},
		renderRow = (row) => {
			if (row.item.isDestroyed) {
				return null;
			}
			if (row.item.id === 'editor') {
				return inlineEditor;
			}

			let {
					item,
					index,
				} = row,
				isHeaderRow = row.item.id === 'headerRow',
				rowProps = getRowProps && !isHeaderRow ? getRowProps(item) : {},
				isSelected = !isHeaderRow && !disableWithSelection && isInSelection(item);

			let rowComponent =
				<Pressable
					dataSet={{ ix: index }}
					{...testProps(getRowTestId ? getRowTestId(row) : ((Repository ? Repository.schema.name : 'GridRow') + '-' + item?.id))}
					onPress={(e) => {
						if (e.preventDefault && e.cancelable) {
							e.preventDefault();
						}
						if (isHeaderRow || isReorderMode) {
							return
						}
						if (CURRENT_MODE === UI_MODE_WEB) {
							switch (e.detail) {
								case SINGLE_CLICK:
									onRowClick(item, e); // sets selection
									if (onEditorRowClick) {
										onEditorRowClick(item, index, e);
									}
									break;
								case DOUBLE_CLICK:
									if (!isSelected) { // If a row was already selected when double-clicked, the first click will deselect it,
										onRowClick(item, e); // so reselect it
									}

									if (UiGlobals.doubleClickingGridRowOpensEditorInViewMode) { // global setting
										if (onView) {
											if (canUser && !canUser(VIEW)) { // permissions
												return;
											}
											onView(!props.isEditorViewOnly);
										}
									} else {
										let canDoEdit = false,
											canDoView = false;
										if (onEdit && canUser && canUser(EDIT) && (!canRecordBeEdited || canRecordBeEdited(selection)) && !props.disableEdit) {
											canDoEdit = true;
										} else
										if (onView && canUser && canUser(VIEW) && !props.disableView) {
											canDoView = true;
										}

										if (canDoEdit) {
											onEdit();
										} else if (canDoView) {
											onView();
										}
									}
									break;
								case TRIPLE_CLICK:
									break;
								default:
							}
						} else if (CURRENT_MODE === UI_MODE_NATIVE) {
							onRowClick(item, e); // sets selection
							if (onEditorRowClick) {
								onEditorRowClick(item, index, e);
							}
						}
					}}
					onLongPress={(e) => {
						if (e.preventDefault && e.cancelable) {
							e.preventDefault();
						}
						if (isHeaderRow || isReorderMode) {
							return
						}
						if (selection && selection[0] && selection[0].isRemotePhantom) {
							return; // block context menu or changing selection when a remote phantom is already selected
						}
						
						// context menu
						const newSelection = [item];
						if (!disableWithSelection) {
							setSelection(newSelection);
						}
						if (onEditorRowClick) { // e.g. inline editor
							onEditorRowClick(item, index, e);
						}
						if (onContextMenu) {
							onContextMenu(item, e, newSelection);
						}
					}}
					className={`
						Pressable
						Row
						flex-row
						grow
					`}
				>
					{({
						hovered,
						focused,
						pressed,
					}) => {
						if (isHeaderRow) {
							let headerRow = <GridHeaderRow
												Repository={Repository}
												columnsConfig={localColumnsConfig}
												setColumnsConfig={setLocalColumnsConfig}
												hideNavColumn={hideNavColumn}
												canColumnsSort={canColumnsSort}
												canColumnsReorder={canColumnsReorder}
												canColumnsResize={canColumnsResize}
												setSelection={setSelection}
												gridRef={gridRef}
												isHovered={hovered}
												isInlineEditorShown={isInlineEditorShown}
												areRowsDragSource={areRowsDragSource}
												showColumnsSelector={showColumnsSelector}
												showSelectHandle={showSelectHandle}
											/>;
							if (showRowExpander) {
								// align the header row to content rows by adding a spacer that matches the width of the Grid-rowExpander-expandBtn
								headerRow = <HStack className="">
												<Box className="w-[40px]"></Box>
												{headerRow}
											</HStack>;
							}
							return headerRow;
						}
						const
							rowReorderProps = {},
							rowDragProps = {};
						let WhichRow = GridRow;
						if (CURRENT_MODE === UI_MODE_WEB) { // DND is currently web-only  TODO: implement for RN
							// Create a method that gets an always-current copy of the selection ids
							dragSelectionRef.current = selection;
							const getSelection = () => dragSelectionRef.current;

							const userHasPermissionToDrag = (!canUser || canUser(EDIT));
							if (userHasPermissionToDrag) {
								// assign event handlers
								if (canRowsReorder && isReorderMode) {
									WhichRow = DragSourceGridRow;
									rowReorderProps.isDragSource = true;
									rowReorderProps.dragSourceType = 'row';
									const dragIx = showHeaders ? index - 1 : index;
									rowReorderProps.dragSourceItem = {
										id: item.id,
										getSelection,
										onDrag: (dragState) => {
											onRowReorderDrag(dragState, dragIx);
										},
									};
									rowReorderProps.onDragEnd = onRowReorderEnd;
								} else {
									// Don't allow drag/drop from withDnd while reordering
									if (areRowsDragSource) {
										WhichRow = DragSourceGridRow;
										rowDragProps.isDragSource = true;
										rowDragProps.dragSourceType = rowDragSourceType;
										if (getRowDragSourceItem) {
											rowDragProps.dragSourceItem = getRowDragSourceItem(item, getSelection, rowDragSourceType);
										} else {
											rowDragProps.dragSourceItem = {
												id: item.id,
												item,
												getSelection,
												type: rowDragSourceType,
											};
										}
										
										// Add custom drag preview options
										if (dragPreviewOptions) {
											rowDragProps.dragPreviewOptions = dragPreviewOptions;
										}

										// Add drag preview rendering
										rowDragProps.getDragProxy = getCustomDragProxy ? 
											(dragItem) => getCustomDragProxy(item, getSelection()) :
											null; // Let GlobalDragProxy handle the default case
									}
									if (areRowsDropTarget) {
										WhichRow = DropTargetGridRow;
										rowDragProps.isDropTarget = true;
										rowDragProps.dropTargetAccept = dropTargetAccept;
										rowDragProps.onDrop = (droppedItem) => {
											// NOTE: item is sometimes getting destroyed, but it still as the id, so you can still use it
											onRowDrop(item, droppedItem); // item is what it was dropped on; droppedItem is the dragSourceItem defined above
										};
										rowDragProps.canDrop = (droppedItem, monitor) => {
											// Check if the drop operation would be valid based on business rules
											if (canRowAcceptDrop && typeof canRowAcceptDrop === 'function') {
												return canRowAcceptDrop(item, droppedItem);
											}
											// Default: allow all drops
											return true;
										};
									}
									if (areRowsDragSource && areRowsDropTarget) {
										WhichRow = DragSourceDropTargetGridRow;
									}
								}
							}

						}
						return <WhichRow
									columnsConfig={localColumnsConfig}
									columnProps={columnProps}
									fields={fields}
									rowProps={rowProps}
									hideNavColumn={hideNavColumn}
									isRowSelectable={isRowSelectable}
									isRowHoverable={isRowHoverable}
									isSelected={isSelected}
									isHovered={hovered}
									showHovers={showHovers}
									showSelectHandle={showSelectHandle}
									index={index}
									alternatingInterval={alternatingInterval}
									alternateRowBackgrounds={alternateRowBackgrounds}
									bg={bg}
									item={item}
									isInlineEditorShown={isInlineEditorShown}
									{...rowReorderProps}
									{...rowDragProps}

									key1={item.id}
								/>;
					}}
				</Pressable>;

			if (showRowExpander && !isHeaderRow) {
				const isExpanded = getIsExpanded(index);
				let className = `
					Grid-rowExpander
					w-full
					flex-none
				`;
				if (rowProps?.className) {
					className += ' ' + rowProps.className;
				}
				rowComponent = <VStack className={className}>
									<HStack
										className={`
											Grid-rowExpander-HStack
											w-full
											grow
										`}
									>
										<ExpandButton
											{...testProps((Repository ? Repository.schema.name : 'GridRow') + '-expandBtn-' + item?.id)}
											isExpanded={isExpanded}
											onToggle={() => setIsExpanded(index, !isExpanded)}
											_icon={{
												size: 'sm',
											}}
											className={`
												Grid-rowExpander-expandBtn
												${styles.GRID_EXPAND_BTN_CLASSNAME}
											`}
											tooltip="Expand/Contract Row"
										/>
										{rowComponent}
									</HStack>
									{isExpanded ? getExpandedRowContent(row) : null}
								</VStack>
			}
			return rowComponent;
		},
		getOverState = (rows, currentY, mouseX) => {
			// determines which row the mouse is over
			// and whether the marker should be moved to the top or bottom of the row
			let newIx = -1,
				useBottom = false;
			_.each(rows, (row, ix) => {
				const
					rect = row.getBoundingClientRect(),
					{
						top,
						bottom,
						height,
					} = rect,
					isOver = (
						mouseX >= rect.left &&
						mouseX <= rect.right &&
						currentY >= rect.top &&
						currentY <= rect.bottom
					);
				if (isOver) {
					newIx = ix;

					const
						halfHeight = height / 2,
						isOverTopHalf = currentY < top + halfHeight;

					useBottom = !isOverTopHalf;

					return false;
				}
			});
			return {
				ix: newIx,
				useBottom,
			};
		},
		buildCachedDragElements = (dragState) => {
			const
				{
					canDrag,
					isDragging,
					clientOffset,
					sourceClientOffset,
				} = dragState,

				scrollRef = gridRef.current._listRef._scrollRef,
				isUsingScroll = scrollRef.childNodes[0].style.overflow === 'auto',
				flatlist = isUsingScroll ? scrollRef.childNodes[0] : scrollRef,
				flatlistRect = flatlist.getBoundingClientRect(),
				rows = _.filter(flatlist.childNodes, (childNode, ix) => {
					const
						isZeroHeight = childNode.getBoundingClientRect().height === 0,
						isHeader = showHeaders && ix === 0;
					return !isZeroHeight && !isHeader;
				}),
				{ ix, useBottom } = getOverState(rows, clientOffset.y, clientOffset.x);


			// Render marker showing destination location
			const marker = document.createElement('div');
			marker.style.position = 'absolute';
			marker.style.top = '0px';
			marker.style.height = '8px';
			marker.style.width = flatlistRect.width + 'px';
			marker.style.backgroundColor = '#ccc';
			flatlist.appendChild(marker);
			
			if (ix !== -1) {
				marker.style.visibility = 'visible';
				const
					rowContainerRect = rows[ix].getBoundingClientRect(),
					top = (useBottom ? rowContainerRect.bottom : rowContainerRect.top) 
							- flatlistRect.top 
							- (flatlist.style.borderWidth ? parseInt(flatlist.style.borderWidth) : 0); // get relative Y position
				marker.style.top = top + 'px';
			} else {
				marker.style.visibility = 'hidden';
			}

			return { ix, useBottom, marker, rows };
		},
		onRowReorderDrag = (dragState, dragIx) => {
			// initial setup
			if (!cachedDragElements.current) {
				cachedDragElements.current = buildCachedDragElements(dragState);
			}

			const
				{
					canDrag,
					isDragging,
					clientOffset,
					sourceClientOffset,
				} = dragState,
				{ marker, rows, } = cachedDragElements.current,
				flatlist = gridRef.current._listRef._scrollRef.childNodes[0],
				flatlistRect = flatlist.getBoundingClientRect(),
				{ ix, useBottom } = getOverState(rows, clientOffset.y, clientOffset.x);

			// move marker to new location
			if (ix !== -1) {
				marker.style.visibility = 'visible';
				const
					rowContainerRect = rows[ix].getBoundingClientRect(),
					top = (useBottom ? rowContainerRect.bottom : rowContainerRect.top) 
							- flatlistRect.top 
							- (flatlist.style.borderWidth ? parseInt(flatlist.style.borderWidth) : 0); // get relative Y position
				marker.style.top = top + 'px';
			} else {
				marker.style.visibility = 'hidden';
			}

			cachedDragElements.current = { ix, useBottom, marker, rows, dragIx };
		},
		onRowReorderEnd = (item, monitor) => {
			const
				{ ix: dropIx, useBottom, marker, rows, dragIx } = cachedDragElements.current,
				shouldMove = dropIx !== dragIx;
			if (shouldMove && dropIx !== -1) {
				// Update the row with the new ix
				let dragRecord,
					dropRecord;
				if (Repository) {
					if (!Repository.isDestroyed) {
						dragRecord = Repository.getByIx(dragIx);
						dropRecord = Repository.getByIx(dropIx);
						if (dropRecord) {
							Repository.reorder(dragRecord, dropRecord, useBottom ? DROP_POSITION_AFTER : DROP_POSITION_BEFORE);
						}
					}
				} else {
					function arrayMove(arr, fromIndex, toIndex) {
						var element = arr[fromIndex];
						arr.splice(fromIndex, 1);
						arr.splice(toIndex, 0, element);
					}
					arrayMove(data, compensatedDragIx, finalDropIx);
				}
			}

			marker.remove();
			cachedDragElements.current = null;
		},
		calculatePageSize = (containerHeight) => {
			const
				headerHeight = showHeaders ? 50 : 0,
				footerHeight = !disablePagination ? 50 : 0,
				availableHeight = containerHeight - headerHeight - footerHeight,
				maxClassNormal = styles.GRID_ROW_MAX_HEIGHT_NORMAL, // e.g. max-h-[40px]
				rowNormalHeight = parseInt(maxClassNormal.match(/\d+/)[0]);
			
			let pageSize = Math.floor(availableHeight / rowNormalHeight);
			if (pageSize < 1) {
				pageSize = 1;
			}
			return pageSize;
		},
		adjustPageSizeToHeight = (e) => {
			if (CURRENT_MODE !== UI_MODE_WEB) { // TODO: Remove this conditional, and don't even do the double render for RN
				return;
			}
			if (!Repository || Repository.isDestroyed) { // This method gets delayed, so it's possible for Repository to have been destroyed. Check for this
				return;
			}

			let doAdjustment = autoAdjustPageSizeToHeight;
			if (!_.isNil(UiGlobals.autoAdjustPageSizeToHeight) && !UiGlobals.autoAdjustPageSizeToHeight) {
				// allow global override to prevent this auto adjustment
				doAdjustment = false;
			}
			if (doAdjustment) {
				const containerHeight = e.nativeEvent.layout.height;
				if (containerHeight > 0) {
					const pageSize = calculatePageSize(containerHeight);
					if (pageSize !== Repository.pageSize) {
						Repository.setPageSize(pageSize);
					}
				}
			}
		},
		debouncedAdjustPageSizeToHeight = useCallback(_.debounce(adjustPageSizeToHeight, 200), []),
		applySelectorSelected = () => {
			if (disableSelectorSelected || !selectorId) {
				return
			}

			if (previousSelectorId.current && selectorId !== previousSelectorId.current) {
				Repository.pauseEvents();
				Repository.clearFilters(previousSelectorId.current);
				Repository.resumeEvents();
			}
			previousSelectorId.current = selectorId;

			let value = null;
			if (selectorSelected) {
				value = selectorSelected[selectorSelectedField];
			}
			if (noSelectorMeansNoResults && _.isEmpty(selectorSelected)) {
				value = 'NO_MATCHES';
			}

			Repository.filter(selectorId, value, false); // false so it doesn't clear existing filters
		},
		onGridKeyDown = (e) => {
			if (isInlineEditorShown) {
				return;
			}
			if (disableWithSelection) {
				return;
			}
			const {
					shiftKey = false,
				} = e;
			if (selectionMode === SELECTION_MODE_MULTI && shiftKey) {
				switch(e.key) {
					case 'ArrowDown':
						e.preventDefault();
						addNextToSelection();
						break;
					case 'ArrowUp':
						e.preventDefault();
						addPrevToSelection();
						break;
				}
			} else {
				// selectionMode is SELECTION_MODE_SINGLE
				switch(e.key) {
					case 'Enter':
						// NOTE: This is never being reached.
						// The event is getting captured somwhere else,
						// but I can't find where.
						// e.preventDefault();
						
						// launch inline or windowed editor
						// const p = props;
						// debugger;
						break;
					case 'ArrowDown':
						e.preventDefault();
						selectNext();
						break;
					case 'ArrowUp':
						e.preventDefault();
						selectPrev();
						break;
				}
			}
		},
		showColumnsSelector = () => {
			const
				modalItems = _.map(localColumnsConfig, (config, ix) => {
					return {
						name: config.id,
						label: config.header,
						type: config.isHidable ? 'Checkbox' : 'Text',
						isEditable: config.isHidable ?? false,
					};
				}),
				startingValues = (() => {
					const startingValues = {};
					_.each(localColumnsConfig, (config) => {
						const value = !config.isHidden; // checkbox implies to show it, so flip the polarity
						startingValues[config.id] = config.isHidable ? value : 'Always shown';
					});
					return startingValues;
				})();
			
			showModal({
				title: 'Column Selector',
				includeReset: true,
				includeCancel: true,
				h: 800,
				w: styles.FORM_STACK_ROW_THRESHOLD + 10,
				body: <Form
							editorType={EDITOR_TYPE__PLAIN}
							columnDefaults={{
								labelWidth: '250px',
							}}
							items={[
								{
									name: 'instructions',
									type: 'DisplayField',
									text: 'Please select which columns to show in the grid.',
									className: 'mb-3',
								},
								{
									type: 'FieldSet',
									title: 'Columns',
									reference: 'columns',
									showToggleAllCheckbox: true,
									items: [
										...modalItems,
									],
								}
							]}
							startingValues={startingValues}
							onSave={(values)=> {
								hideModal();

								const newColumnsConfig = _.cloneDeep(localColumnsConfig);
								_.each(newColumnsConfig, (config, ix) => {
									if (config.isHidable) {
										newColumnsConfig[ix].isHidden = !values[config.id]; // checkbox implies to show it, so flip the polarity
									}
								});
								setLocalColumnsConfig(newColumnsConfig);
							}}
						/>,
			});
		};

	if (forceLoadOnRender && disableLoadOnRender) {
		throw new Error('incompatible config! forceLoadOnRender and disableLoadOnRender cannot both be true');
	}

	useEffect(() => {
		if (!isInited) {
			// first call -- meant to render placeholder so we get container dimensions
			if (Repository) {
				if (Repository.isRemote) {
					Repository.isAutoLoad = false;
				}
				Repository.pauseEvents();
			}
			if (onRender) {
				onRender(self)
			}
			return () => {};
		}

		(async () => {

			// second call -- do other necessary setup

			
			let columnsConfigVariable = columnsConfig,
				localColumnsConfig = [],
				savedLocalColumnsConfig,
				calculateLocalColumnsConfig = false;
			if (localColumnsConfigKey && !UiGlobals.disableSavedColumnsConfig) {
				savedLocalColumnsConfig = await getSaved(localColumnsConfigKey);
			}

			if (!savedLocalColumnsConfig || hasUnserializableColumns) {
				calculateLocalColumnsConfig = true;
			}
			if (calculateLocalColumnsConfig) {
				if (_.isFunction(columnsConfigVariable)) {
					columnsConfigVariable = columnsConfigVariable();
				}
				if (_.isEmpty(columnsConfigVariable)) {
					if (Repository) {
						// create a column for the displayProperty
						localColumnsConfig.push({
							fieldName: Repository.schema.model.displayProperty,
						});
					} else {
						localColumnsConfig.push({
							fieldName: displayField,
						});
					}
				} else {
					_.each(columnsConfigVariable, (columnConfig) => {
						if (!_.isPlainObject(columnConfig)) {
							localColumnsConfig.push(columnConfig);
							return;
						}
	
						const
							defaults = {
								isEditable: false,
								isReorderable: true,
								isResizable: true,
								isSortable: true,
								isHidden: inArray(columnConfig.id, defaultHiddenColumns),
								isHidable: true,
								isOver: false,
							},
							config = _.assign({}, defaults, columnConfig);
						
						if (!(config.w || config.width) && !config.flex) {
							// Neither is set
							config.w = 100; // default
						} else if (config.flex && (config.w || config.width)) {
							// Both are set. Width overrules flex.
							delete config.flex;
						}
	
						localColumnsConfig.push(config);
					});
				}
			}

			if (savedLocalColumnsConfig) {
				if (!hasUnserializableColumns) {
					// just use the saved config without any further processing
					localColumnsConfig = savedLocalColumnsConfig;

				} else {
					// Conform the calculated localColumnsConfig to the saved config.
					// This should allow us to continue using non-serializable configurations after a refresh
					const reconstructedLocalColumnsConfig = savedLocalColumnsConfig.map((savedConfig) => { // foreach saved column, in the order it was saved...
						const columnConfig = localColumnsConfig.find(localConfig => localConfig.id === savedConfig.id); // find the corresponding column in localColumnsConfig
						_.assign(columnConfig, savedConfig);
						return columnConfig;
					});
					localColumnsConfig = reconstructedLocalColumnsConfig;
				}
			}

			setLocalColumnsConfig(localColumnsConfig);

			setIsReady(true);
		})();

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
			},
			onChangePage = () => {
				if (showRowExpander) {
					expandedRowsRef.current = {}; // clear expanded rows
				}
			};

		Repository.on('beforeLoad', setTrue);
		Repository.on('load', setFalse);
		if (!disableWithSelection) {
			Repository.ons(['changePage', 'changePageSize',], deselectAll);
		}
		Repository.ons(['changeData', 'change'], forceUpdate);
		Repository.on('changeFilters', onChangeFilters);
		Repository.on('changeSorters', onChangeSorters);
		Repository.on('changePage', onChangePage);

		applySelectorSelected();
		Repository.resumeEvents();

		if (((Repository.isRemote && !Repository.isLoaded) || forceLoadOnRender) && !disableLoadOnRender) { // default remote repositories to load on render, optionally force or disable load on render
			Repository.load();
		}

		return () => {
			Repository.off('beforeLoad', setTrue);
			Repository.off('load', setFalse);
			if (!disableWithSelection) {
				Repository.offs(['changePage', 'changePageSize',], deselectAll);
			}
			Repository.offs(['changeData', 'change'], forceUpdate);
			Repository.off('changeFilters', onChangeFilters);
			Repository.off('changeSorters', onChangeSorters);
			Repository.off('changePage', onChangePage);
		};
	}, [isInited]);

	useEffect(() => {
		if (!Repository || !isReady) {
			return () => {};
		}

		applySelectorSelected();

	}, [selectorId, selectorSelected]);

	if (canUser && !canUser('view')) {
		return <Unauthorized />;
	}

	if (self) {
		self.ref = containerRef;
		self.gridRef = gridRef;
	}

	isAddingRef.current = isAdding;

	const footerToolbarItemComponents = useMemo(() => getFooterToolbarItems(), [Repository?.hash, additionalToolbarButtons, isReorderMode]);

	if (!isInited) {
		// first time through, render a placeholder so we can get container dimensions
		return <VStackNative
					onLayout={(e) => {
						adjustPageSizeToHeight(e);
						setIsInited(true);
					}}
					className="w-full flex-1"
				/>;
	}
	if (!isReady) {
		// second time through, render nothing, as we are still setting up the Repository
		return null;
	}

	// Actual data to show in the grid
	const entities = Repository ? (Repository.isRemote ? Repository.entities : Repository.getEntitiesOnPage()) : data;
	let rowData = [...entities]; // don't use the original array, make a new one so alterations to it are temporary
	if (showHeaders) {
		rowData.unshift({ id: 'headerRow' });
	}
	if (inlineEditor) {
		rowData.push({ id: 'editor' }); // make editor the last row so it can scroll with all other rows
	}
	const initialNumToRender = rowData?.length || 10;

	// headers & footers
	let listFooterComponent = null;
	if (!disableBottomToolbar) {
		if (Repository && bottomToolbar === 'pagination' && !disablePagination && Repository.isPaginated) {
			let disablePageSize = autoAdjustPageSizeToHeight; // component setting
			if (!_.isNil(UiGlobals.autoAdjustPageSizeToHeight) && !UiGlobals.autoAdjustPageSizeToHeight) { // global setting
				disablePageSize = false;
			}
			let showMoreOnly = false;
			if (UiGlobals.paginationIsShowMoreOnly) { // global setting
				showMoreOnly = true;
			}
			listFooterComponent = <PaginationToolbar
										Repository={Repository}
										self={self}
										toolbarItems={footerToolbarItemComponents}
										disablePageSize={disablePageSize}
										showMoreOnly={showMoreOnly}
										{..._paginationToolbarProps}
									/>;
		} else if (footerToolbarItemComponents.length) {
			listFooterComponent = <Toolbar>
										<ReloadButton Repository={Repository} self={self} />
										{footerToolbarItemComponents}
									</Toolbar>;
		}
	}

	let grid = <FlatList
					{...testProps('flatlist')}
					ref={gridRef}
					scrollEnabled={CURRENT_MODE === UI_MODE_WEB}
					nestedScrollEnabled={true}
					contentContainerStyle={{
						overflow: 'auto',
						height: '100%',
					}}
					refreshing={isLoading}
					onRefresh={pullToRefresh ? onRefresh : null}
					progressViewOffset={100}
					data={rowData}
					keyExtractor={(item) => {
						let id;
						if (item.id) {
							id = item.id;
						} else if (fields) {
							id = item[idIx];
						}
						return String(id);
					}}
					initialNumToRender={initialNumToRender}
					initialScrollIndex={0}
					renderItem={renderRow}
					className="bg-grey-100"
					{...flatListProps}
				/>;
	
	if (CURRENT_MODE === UI_MODE_WEB) {
		// fix scrolling bug on nested FlatLists (inner one would not scroll without this)
		grid = <ScrollView
					horizontal={false}
					className="ScrollView overflow-auto"
					contentContainerStyle={{
						height: '100%',
					}}
				>{grid}</ScrollView>;
	} else
	if (CURRENT_MODE === UI_MODE_NATIVE) {
		grid = <ScrollView className="flex-1 w-full">{grid}</ScrollView>
	}

	// placeholders in case no entities yet
	if (!entities?.length) {
		if (Repository?.isLoading) {
			grid = <Loading isScreen={true} />;
		} else {
			grid = <NoRecordsFound 
						text={noneFoundText}
						onRefresh={onRefresh}
					/>;
		}
	}

	let gridContainerBorderClassName = '';
	if (isReorderMode) {
		gridContainerBorderClassName += ' ' + styles.GRID_REORDER_BORDER_WIDTH;
		gridContainerBorderClassName += ' ' + styles.GRID_REORDER_BORDER_COLOR;
		gridContainerBorderClassName += ' ' + styles.GRID_REORDER_BORDER_STYLE;
	} else if (isLoading) {
		gridContainerBorderClassName += ' border-t-4';
		gridContainerBorderClassName += ' border-t-[#f00]';
	} else {
		gridContainerBorderClassName += ' border-t-0';
	}
	
	const style = props.style || {};
	style.backgroundColor = bg;
	if (!hasHeight(props) && !hasWidth(props) && !hasFlex(props)) {
		style.flex = 1;
	}
	let className = `
		Grid-VStackNative
		w-full
		border
		border-grey-300
	`;
	if (props.className) {
		className += props.className;
	}

	grid = <VStackNative
				{...testProps(self)}
				ref={containerRef}
				tabIndex={0}
				onKeyDown={onGridKeyDown}
				onLayout={(e) => debouncedAdjustPageSizeToHeight(e)}
				className={className}
				style={style}
			>
				{topToolbar}

				<VStack
					ref={gridContainerRef}
					onClick={() => {
						if (!isReorderMode && !isInlineEditorShown && deselectAll) {
							deselectAll();
						}
					}}
					className={`
						gridContainer
						w-full
						h-full
						flex-1
						min-h-[40px]
						${gridContainerBorderClassName}
					`}
				>
					{grid}
				</VStack>

				{listFooterComponent}

			</VStackNative>

	if (isDropTarget) {
		grid = <VStackNative
					{...testProps(self, '-dropTarget')}
					ref={dropTargetRef}
					className={`
						Grid-dropTarget
						h-full
						w-full
						border-[#0ff]
						${canDrop && isOver ? "border-[4px]" : "border-[0px]"}
					`}
				>{grid}</VStackNative>
	}
	return grid;
}


export const Grid = withComponent(
						withAlert(
							withEvents(
								withData(
									withPermissions(
										withDropTarget(
											withMultiSelection(
												withSelection(
													withFilters(
														withPresetButtons(
															withContextMenu(
																GridComponent
															)
														),
														true // isGrid
													)
												)
											)
										)
									)
								)
							)
						)
					);

export const SideGridEditor = withComponent(
									withAlert(
										withEvents(
											withData(
												withPermissions(
													withDropTarget(
														withMultiSelection(
															withSelection(
																withSideEditor(
																	withFilters(
																		withPresetButtons(
																			withContextMenu(
																				GridComponent
																			)
																		),
																		true // isGrid
																	)
																)
															)
														)
													)
												)
											)
										)
									)
								);

export const WindowedGridEditor = withComponent(
									withAlert(
										withEvents(
											withData(
												withPermissions(
													withDropTarget(
														withMultiSelection(
															withSelection(
																withWindowedEditor(
																	withFilters(
																		withPresetButtons(
																			withContextMenu(
																				GridComponent
																			),
																			true // isGrid
																		)
																	)
																)
															)
														)
													)
												)
											)
										)
									)
								);

export const InlineGridEditor = withComponent(
									withAlert(
										withEvents(
											withData(
												withPermissions(
													withDropTarget(
														withMultiSelection(
															withSelection(
																withInlineEditor(
																	withFilters(
																		withPresetButtons(
																			withContextMenu(
																				GridComponent
																			)
																		),
																		true // isGrid
																	)
																)
															)
														)
													)
												)
											)
										)
									)
								);

// export const InlineSideGridEditor = withComponent(
// 									withAlert(
// 										withEvents(
// 											withData(
// 												withPermissions(
// 													withDropTarget(
// 														withMultiSelection(
// 															withSelection(
// 																withInlineSideEditor(
// 																	withFilters(
// 																		withPresetButtons(
// 																			withContextMenu(
// 																				GridComponent
// 																			)
// 																		),
// 																		true // isGrid
// 																	)
// 																)
// 															)
// 														)
// 													)
// 												)
// 											)
// 										)
// 									)
// 								);

export default Grid;
