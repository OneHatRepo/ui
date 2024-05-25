import React, { useState, useEffect, useRef, useMemo, useCallback, } from 'react';
import {
	Box,
	FlatList,
	HStack,
	Modal,
	Pressable,
	Icon,
	ScrollView,
	VStack,
} from '@gluestack-ui/themed';
import {
	SELECTION_MODE_SINGLE,
	SELECTION_MODE_MULTI,
} from '../../Constants/Selection.js';
import {
	v4 as uuid,
} from 'uuid';
import {
	DROP_POSITION_BEFORE,
	DROP_POSITION_AFTER,
} from '../../Constants/Grid.js';
import {
	UI_MODE_WEB,
	UI_MODE_REACT_NATIVE,
	CURRENT_MODE,
} from '../../Constants/UiModes.js';
import * as colourMixer from '@k-renwick/colour-mixer';
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
import withPresetButtons from '../Hoc/withPresetButtons.js';
import withMultiSelection from '../Hoc/withMultiSelection.js';
import withSelection from '../Hoc/withSelection.js';
import withWindowedEditor from '../Hoc/withWindowedEditor.js';
import withInlineEditor from '../Hoc/withInlineEditor.js';
import getSaved from '../../Functions/getSaved.js';
import setSaved from '../../Functions/setSaved.js';
import getIconButtonFromConfig from '../../Functions/getIconButtonFromConfig.js';
import testProps from '../../Functions/testProps.js';
import nbToRgb from '../../Functions/nbToRgb.js';
import Loading from '../Messages/Loading.js';
import GridHeaderRow from './GridHeaderRow.js';
import GridRow, { DragSourceDropTargetGridRow, DragSourceGridRow, DropTargetGridRow } from './GridRow.js';
import IconButton from '../Buttons/IconButton.js';
import ExpandButton from '../Buttons/ExpandButton.js';
import PaginationToolbar from '../Toolbar/PaginationToolbar.js';
import NoRecordsFound from './NoRecordsFound.js';
import Toolbar from '../Toolbar/Toolbar.js';
import NoReorderRows from '../Icons/NoReorderRows.js';
import ReorderRows from '../Icons/ReorderRows.js';
import ColumnSelectorWindow from './ColumnSelectorWindow.js';
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

function GridComponent(props) {
	const {

			columnsConfig = [], // json configurations for each column
			columnProps = {},
			getRowProps = (item) => {
				return {
					borderBottomWidth: 1,
					borderBottomColor: 'trueGray.500',
				};
			},
			flatListProps = {},
			onRowPress,
			onRender,
			forceLoadOnRender = false,
			pullToRefresh = true,
			hideNavColumn = true,
			noneFoundText,
			autoAdjustPageSizeToHeight = true,
			disableSelectorSelected = false,
			showRowExpander = false,
			getExpandedRowContent,
			showHeaders = true,
			showHovers = true,
			canColumnsSort = true,
			canColumnsReorder = true,
			canColumnsResize = true,
			canRowsReorder = false,
			areRowsDragSource = false,
			rowDragSourceType,
			getRowDragSourceItem,
			areRowsDropTarget = false,
			dropTargetAccept,
			onRowDrop,
			allowToggleSelection = false, // i.e. single click with no shift key toggles the selection of the item clicked on
			disableBottomToolbar = false,
			disablePagination = false,
			bottomToolbar = 'pagination',
			topToolbar = null,
			additionalToolbarButtons = [],
			h,
			flex,
			bg = '#fff',
			verifyCanEdit,
			alternateRowBackgrounds = true,
			alternatingInterval = 2,
			defaultRowHeight = 48,

			// withComponent
			self,

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
			noSelectorMeansNoResults = false,
			selectNext,
			selectPrev,
			addNextToSelection,
			addPrevToSelection,

			// DataMgt
			selectorId,
			selectorSelected,

			// withInlineEditor
			inlineEditor = null,
			isInlineEditorShown = false,
			onEditorRowClick,

		} = props,
		styles = UiGlobals.styles,
		id = props.id || props.self?.path,
		localColumnsConfigKey = id && id + '-localColumnsConfig',
		[hasFunctionColumn, setHasActionColumns] = useState((() => {
			// We can't save localColumnsConfig when there's a function column, so we need to determine if this is the case (only run once per Grid)
			let ret = false;
			_.each(columnsConfig, (column) => {
				if (column.renderer || _.isFunction(column)) {
					ret = true;
					return false;
				}
			});
			return ret;
		})()),
		forceUpdate = useForceUpdate(),
		containerRef = useRef(),
		gridRef = useRef(),
		gridContainerRef = useRef(),
		isAddingRef = useRef(),
		expandedRowsRef = useRef({}),
		cachedDragElements = useRef(),
		dragSelectionRef = useRef([]),
		[isInited, setIsInited] = useState(false),
		[isReady, setIsReady] = useState(false),
		[isLoading, setIsLoading] = useState(false),
		[localColumnsConfig, setLocalColumnsConfigRaw] = useState([]),
		[isReorderMode, setIsReorderMode] = useState(false),
		[isColumnSelectorShown, setIsColumnSelectorShown] = useState(false),
		getIsExpanded = (index) => {
			return !!expandedRowsRef.current[index];
		},
		setIsExpanded = (index, isExpanded) => {
			expandedRowsRef.current[index] = isExpanded;
			forceUpdate();
		},
		setLocalColumnsConfig = (config) => {
			if (localColumnsConfigKey && !hasFunctionColumn) {
				setSaved(localColumnsConfigKey, config);
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
					key="reorderBtn"
					parent={self}
					reference="reorderBtn"
					onPress={() => setIsReorderMode(!isReorderMode)}
					icon={<Icon as={isReorderMode ? NoReorderRows : ReorderRows} color={styles.GRID_TOOLBAR_ITEMS_COLOR} />}
					tooltip="Reorder Rows"
				/>);
			}
			return items;
		},
		renderRow = (row) => {
			if (row.item.isDestroyed) {
				return null;
			}
			if (row.item.id === 'inlineEditor') {
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
					// {...testProps(Repository ? Repository.schema.name + '-' + item.id : item.id)}
					onPress={(e) => {
						if (e.preventDefault && e.cancelable) {
							e.preventDefault();
						}
						if (isHeaderRow || isReorderMode) {
							return
						}
						if (CURRENT_MODE === UI_MODE_WEB) {
							switch (e.detail) {
								case 1: // single click
									onRowClick(item, e); // sets selection
									if (onEditorRowClick) {
										onEditorRowClick(item, index, e);
									}
									break;
								case 2: // double click
									if (!isSelected) { // If a row was already selected when double-clicked, the first click will deselect it,
										onRowClick(item, e); // so reselect it
									}

									if (UiGlobals.doubleClickingGridRowOpensEditorInViewMode) { // global setting
										if (onView) {
											onView(true);
										}
									} else {
										if (onEdit) {
											if (verifyCanEdit && !verifyCanEdit(selection)) {
												return;
											}
											onEdit();
										}
									}
									break;
								case 3: // triple click
									break;
								default:
							}
						} else if (CURRENT_MODE === UI_MODE_REACT_NATIVE) {
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
						
						// context menu
						const selection = [item];
						if (!disableWithSelection) {
							setSelection(selection);
						}
						if (onEditorRowClick) { // e.g. inline editor
							onEditorRowClick(item, index, e);
						}
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
						if (isHeaderRow) {
							return <GridHeaderRow
										Repository={Repository}
										columnsConfig={localColumnsConfig}
										setColumnsConfig={setLocalColumnsConfig}
										hideNavColumn={hideNavColumn}
										canColumnsSort={canColumnsSort}
										canColumnsReorder={canColumnsReorder}
										canColumnsResize={canColumnsResize}
										setSelection={setSelection}
										gridRef={gridRef}
										isHovered={isHovered}
										isInlineEditorShown={isInlineEditorShown}
										areRowsDragSource={areRowsDragSource}
										showColumnsSelector={() => setIsColumnSelectorShown(true)}
									/>;
						}

						let bg = rowProps.bg || styles.GRID_ROW_BG,
							mixWith;
						if (isSelected) {
							if (showHovers && isHovered) {
								mixWith = styles.GRID_ROW_SELECTED_HOVER_BG;
							} else {
								mixWith = styles.GRID_ROW_SELECTED_BG;
							}
						} else if (showHovers && isHovered) {
							mixWith = styles.GRID_ROW_HOVER_BG;
						} else if (alternateRowBackgrounds && index % alternatingInterval === 0) { // i.e. every second line, or every third line
							mixWith = styles.GRID_ROW_ALTERNATE_BG;
						}
						if (mixWith) {
							const
								mixWithObj = nbToRgb(mixWith),
								ratio = mixWithObj.alpha ? 1 - mixWithObj.alpha : 0.5;
							bg = colourMixer.blend(bg, ratio, mixWithObj.color);
						}
						const
							rowReorderProps = {},
							rowDragProps = {};
						let WhichRow = GridRow;
						if (CURRENT_MODE === UI_MODE_WEB) { // DND is currrently web-only  TODO: implement for RN
							// Create a method that gets an always-current copy of the selection ids
							dragSelectionRef.current = selection;
							const getSelection = () => dragSelectionRef.current;

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
											getSelection,
											type: rowDragSourceType,
										};
									}
								}
								if (areRowsDropTarget) {
									WhichRow = DropTargetGridRow;
									rowDragProps.isDropTarget = true;
									rowDragProps.dropTargetAccept = dropTargetAccept;
									rowDragProps.onDrop = (droppedItem) => {
										// NOTE: item is sometimes getting destroyed, but it still as the id, so you can still use it
										onRowDrop(item, droppedItem); // item is what it was dropped on; droppedItem is the dragSourceItem defined above
									};
								}
								if (areRowsDragSource && areRowsDropTarget) {
									WhichRow = DragSourceDropTargetGridRow;
								}
							}
						}
						return <WhichRow
									columnsConfig={localColumnsConfig}
									columnProps={columnProps}
									fields={fields}
									rowProps={rowProps}
									hideNavColumn={hideNavColumn}
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
				rowComponent = <VStack>
									<HStack>
										<ExpandButton
											isExpanded={isExpanded}
											onToggle={() => setIsExpanded(index, !isExpanded)}
											_icon={{
												size: 'sm',
											}}
											py={0}
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
					dragRecord = Repository.getByIx(dragIx);
					dropRecord = Repository.getByIx(dropIx);
					if (dropRecord) {
						Repository.reorder(dragRecord, dropRecord, useBottom ? DROP_POSITION_AFTER : DROP_POSITION_BEFORE);
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
				height = containerHeight - headerHeight - footerHeight,
				rowsPerContainer = Math.floor(height / defaultRowHeight);
			let pageSize = rowsPerContainer;
			if (showHeaders) {
				pageSize--;
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
			let id = selectorSelected?.id;
			if (_.isEmpty(selectorSelected)) {
				id = noSelectorMeansNoResults ? 'NO_MATCHES' : null;
			}
			Repository.filter(selectorId, id, false); // so it doesn't clear existing filters
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
		};

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

			// calculate localColumnsConfig
			let localColumnsConfig = [];
			let savedLocalColumnsConfig;
			if (localColumnsConfigKey && !hasFunctionColumn && !UiGlobals.disableSavedColumnsConfig) {
				savedLocalColumnsConfig = await getSaved(localColumnsConfigKey);
			}
			if (savedLocalColumnsConfig) {
				// use saved
				localColumnsConfig = savedLocalColumnsConfig;
			} else {
				// calculate new

				// convert json config into actual elements
				if (_.isEmpty(columnsConfig)) {
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
					_.each(columnsConfig, (columnConfig) => {
						if (!_.isPlainObject(columnConfig)) {
							localColumnsConfig.push(columnConfig);
							return;
						}

						const
							defaults = {
								columnId: uuid(),
								isEditable: false,
								reorderable: true,
								resizable: true,
								sortable: true,
								isHidden: false,
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

		if ((Repository.isRemote && !Repository.isLoaded) || forceLoadOnRender) {
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

	}, [selectorSelected]);

	if (self) {
		self.ref = containerRef;
		self.gridRef = gridRef;
	}

	isAddingRef.current = isAdding;

	const footerToolbarItemComponents = useMemo(() => getFooterToolbarItems(), [Repository?.hash, additionalToolbarButtons, isReorderMode]);

	if (!isInited) {
		// first time through, render a placeholder so we can get container dimensions
		return <VStack
					flex={1}
					w="100%"
					onLayout={(e) => {
						adjustPageSizeToHeight(e);
						setIsInited(true);
					}}
				/>;
	}
	if (!isReady) {
		// second time through, render nothing, as we are still setting up the Repository
		return null;
	}

	// Actual data to show in the grid
	const entities = Repository ? (Repository.isRemote ? Repository.entities : Repository.getEntitiesOnPage()) : data;
	let rowData = _.clone(entities); // don't use the original array, make a new one so alterations to it are temporary
	if (showHeaders) {
		rowData.unshift({ id: 'headerRow' });
	}
	if (inlineEditor) {
		rowData.push({ id: 'inlineEditor' }); // make editor the last row so it can scroll with all other rows
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
									/>;
		} else if (footerToolbarItemComponents.length) {
			listFooterComponent = <Toolbar>{footerToolbarItemComponents}</Toolbar>;
		}
	}
	
	const sizeProps = {};
	if (!_.isNil(h)) {
		sizeProps.h = h;
	} else {
		sizeProps.flex = flex ?? 1;
	}

	let grid = <FlatList
					testID="flatlist"
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
					bg="trueGray.100"
					{...flatListProps}
				/>
	
	if (CURRENT_MODE === UI_MODE_WEB) {
		grid = <ScrollView horizontal={false}>{grid}</ScrollView>; // fix scrolling bug on nested FlatLists
	} else
	if (CURRENT_MODE === UI_MODE_REACT_NATIVE) {
		grid = <ScrollView flex={1} w="100%">{grid}</ScrollView>
	}

	// placeholders in case no entities yet
	if (!entities?.length) {
		if (Repository?.isLoading) {
			grid = <Loading isScreen={true} />;
		} else {
			grid = <NoRecordsFound text={noneFoundText} onRefresh={onRefresh} />;
		}
	}

	const gridContainerBorderProps = {};
	if (isReorderMode) {
		gridContainerBorderProps.borderWidth = styles.REORDER_BORDER_WIDTH;
		gridContainerBorderProps.borderColor = styles.REORDER_BORDER_COLOR;
		gridContainerBorderProps.borderStyle = styles.REORDER_BORDER_STYLE;
		gridContainerBorderProps.borderTopWidth = null;
		if (isLoading) {
			gridContainerBorderProps.borderTopColor = '#f00';
		} else {
			gridContainerBorderProps.borderTopColor = null;
		}
	} else if (isLoading) {
		gridContainerBorderProps.borderTopWidth = 4;
		gridContainerBorderProps.borderTopColor = '#f00';
	} else {
		gridContainerBorderProps.borderTopWidth = 1;
		gridContainerBorderProps.borderTopColor = 'trueGray.300';
	}

	let columnSelector = null;
	if (isColumnSelectorShown) {
		const onCloseColumnSelector = () => {
			setIsColumnSelectorShown(false);
		};
		columnSelector = <Modal
							isOpen={true}
							onClose={onCloseColumnSelector}
						>
							<ColumnSelectorWindow
								onClose={onCloseColumnSelector}
								columnsConfig={localColumnsConfig}
								setColumnsConfig={setLocalColumnsConfig}
							/>
						</Modal>;
	}

	grid = <VStack
				{...testProps('Grid')}
				testID="outerContainer"
				ref={containerRef}
				tabIndex={0}
				onKeyDown={onGridKeyDown}
				w="100%"
				bg={bg}
				borderWidth={styles.GRID_BORDER_WIDTH}
				borderColor={styles.GRID_BORDER_COLOR}
				onLayout={(e) => debouncedAdjustPageSizeToHeight(e)}
				{...sizeProps}
			>
				{topToolbar}

				<VStack
					testID="gridContainer"
					ref={gridContainerRef}
					w="100%"
					flex={1}
					minHeight={40}
					{...gridContainerBorderProps}
					onClick={() => {
						if (!isReorderMode && !isInlineEditorShown && deselectAll) {
							deselectAll();
						}
					}}
				>
					{grid}
				</VStack>

				{listFooterComponent}

				{columnSelector}

			</VStack>

	if (isDropTarget) {
		grid = <Box
					ref={dropTargetRef}
					borderWidth={canDrop && isOver ? 4 : 0}
					borderColor="#0ff"
					w="100%"
					{...sizeProps}
				>{grid}</Box>
	}
	return grid;

}

export const Grid = withComponent(
						withAlert(
							withEvents(
								withData(
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
					);

export const SideGridEditor = withComponent(
									withAlert(
										withEvents(
											withData(
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
								);

export const WindowedGridEditor = withComponent(
									withAlert(
										withEvents(
											withData(
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
								);

export const InlineGridEditor = withComponent(
									withAlert(
										withEvents(
											withData(
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
								);

// export const InlineSideGridEditor = withComponent(
// 									withAlert(
// 										withEvents(
// 											withData(
// 												withDropTarget(
// 													withMultiSelection(
// 														withSelection(
// 															withInlineSideEditor(
// 																withFilters(
// 																	withPresetButtons(
// 																		withContextMenu(
// 																			GridComponent
// 																		)
// 																	),
// 																	true // isGrid
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
