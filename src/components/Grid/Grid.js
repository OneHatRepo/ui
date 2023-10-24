import React, { useState, useEffect, useRef, useMemo, useCallback, } from 'react';
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
	v4 as uuid,
} from 'uuid';
import {
	VERTICAL,
} from '../../Constants/Directions.js';
import {
	DROP_POSITION_BEFORE,
	DROP_POSITION_AFTER,
} from '../../Constants/Grid.js';
import {
	UI_MODE_WEB,
	UI_MODE_REACT_NATIVE,
	CURRENT_MODE,
} from '../../Constants/UiModes.js';
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
import withPresetButtons from '../Hoc/withPresetButtons.js';
import withMultiSelection from '../Hoc/withMultiSelection.js';
import withSelection from '../Hoc/withSelection.js';
import withWindowedEditor from '../Hoc/withWindowedEditor.js';
import withInlineEditor from '../Hoc/withInlineEditor.js';
import getIconButtonFromConfig from '../../Functions/getIconButtonFromConfig.js';
import testProps from '../../Functions/testProps.js';
import nbToRgb from '../../Functions/nbToRgb.js';
import GridHeaderRow from './GridHeaderRow.js';
import GridRow, { ReorderableGridRow } from './GridRow.js';
import IconButton from '../Buttons/IconButton.js';
import PaginationToolbar from '../Toolbar/PaginationToolbar.js';
import NoRecordsFound from './NoRecordsFound.js';
import Toolbar from '../Toolbar/Toolbar.js';
import NoReorderRows from '../Icons/NoReorderRows.js';
import ReorderRows from '../Icons/ReorderRows.js';
import _ from 'lodash';


// Grid requires the use of HOC withSelection() whenever it's used.
// The default export is *with* the HOC. A separate *raw* component is
// exported which can be combined with many HOCs for various functionality.

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
			// enableEditors = false,
			loadOnRender = true,
			pullToRefresh = true,
			hideNavColumn = true,
			noneFoundText,
			autoAdjustPageSizeToHeight = true,
			disableLoadingIndicator = false,
			disableSelectorSelected = false,
			showRowExpander = false,
			rowExpanderTpl = '',
			showHeaders = true,
			showHovers = true,
			canColumnsSort = true,
			canColumnsReorder = true,
			canColumnsResize = true,
			canRowsReorder = false,
			allowToggleSelection = false, // i.e. single click with no shift key toggles the selection of the item clicked on
			disableBottomToolbar = false,
			disablePagination = false,
			bottomToolbar = 'pagination',
			topToolbar = null,
			additionalToolbarButtons = [],
			h,
			flex,
			bg,

			// withComponent
			self,

			// withEditor
			onAdd,
			onEdit,
			onDelete,
			onView,
			onDuplicate,
			onReset,
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

			// withPresetButtons
			onChangeColumnsConfig,

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

			// withInlineEditor
			inlineEditor = null,
			isInlineEditorShown = false,
			onEditorRowClick,

		} = props,
		styles = UiGlobals.styles,
		forceUpdate = useForceUpdate(),
		containerRef = useRef(),
		gridRef = useRef(),
		gridContainerRef = useRef(),
		isAddingRef = useRef(),
		isRenderedRef = useRef(),
		[isReady, setIsReady] = useState(false),
		[isLoading, setIsLoading] = useState(false),
		[localColumnsConfig, setLocalColumnsConfigRaw] = useState([]),
		[isDragMode, setIsDragMode] = useState(false),
		[dragRowSlot, setDragRowSlot] = useState(null),
		[dragRowIx, setDragRowIx] = useState(),
		setLocalColumnsConfig = (config) => {
			setLocalColumnsConfigRaw(config);
			if (onChangeColumnsConfig) {
				onChangeColumnsConfig(config);
			}
		},
		onRowClick = (item, e) => {
			if (isInlineEditorShown) {
				return;
			}
			const
				{
					shiftKey,
					metaKey,
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

			if (canRowsReorder) {
				items.unshift(<IconButton
					key="reorderBtn"
					parent={self}
					reference="reorderBtn"
					onPress={() => setIsDragMode(!isDragMode)}
					icon={<Icon as={isDragMode ? NoReorderRows : ReorderRows} color={styles.GRID_TOOLBAR_ITEMS_COLOR} />}
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
				isSelected = !isHeaderRow && isInSelection(item);

			return <Pressable
						// {...testProps(Repository ? Repository.schema.name + '-' + item.id : item.id)}
						onPress={(e) => {
							if (e.preventDefault && e.cancelable) {
								e.preventDefault();
							}
							if (isHeaderRow || isDragMode) {
								return
							}
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
							if (isHeaderRow || isDragMode) {
								return
							}
							
							// context menu
							const selection = [item];
							setSelection(selection);
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
							}
							if (mixWith) {
								const
									mixWithObj = nbToRgb(mixWith),
									ratio = mixWithObj.alpha ? 1 - mixWithObj.alpha : 0.5;
								bg = colourMixer.blend(bg, ratio, mixWithObj.color);
							}
							let WhichGridRow = GridRow,
								rowReorderProps = {};
							if (canRowsReorder && isDragMode) {
								WhichGridRow = ReorderableGridRow;
								rowReorderProps = {
									mode: VERTICAL,
									onDragStart: onRowReorderDragStart,
									onDrag: onRowReorderDrag,
									onDragStop: onRowReorderDragStop,
									proxyParent: gridRef.current?.getScrollableNode().children[0],
									proxyPositionRelativeToParent: true,
									getParentNode: (node) => node.parentElement.parentElement.parentElement,
									getProxy: getReorderProxy,
								};
							}
							
							return <WhichGridRow
										columnsConfig={localColumnsConfig}
										columnProps={columnProps}
										fields={fields}
										rowProps={rowProps}
										hideNavColumn={hideNavColumn}
										bg={bg}
										item={item}
										isInlineEditorShown={isInlineEditorShown}
										{...rowReorderProps}
									/>;
						}}
					</Pressable>;
		},
		getReorderProxy = (node) => {
			const
				row = node.parentElement.parentElement,
				rowRect = row.getBoundingClientRect(),
				parent = row.parentElement,
				parentRect = parent.getBoundingClientRect(),
				proxy = row.cloneNode(true),
				top = rowRect.top - parentRect.top,
				dragRowIx = Array.from(parent.children).indexOf(row)
			
			setDragRowIx(dragRowIx); // the ix of which record is being dragged

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
		onRowReorderDragStart = (info, e, proxy, node) => {
			// console.log('onRowReorderDragStart', info, e, proxy, node);
			const
				proxyRect = proxy.getBoundingClientRect(),
				row = node.parentElement.parentElement,
				parent = row.parentElement,
				parentRect = parent.getBoundingClientRect(),
				rows = _.filter(parent.children, (childNode) => {
					return childNode.getBoundingClientRect().height !== 0; // Skip zero-height children
				}),
				currentY = proxyRect.top - parentRect.top, // top position of pointer, relative to page
				headerRowIx = showHeaders ? 0 : null,
				firstActualRowIx = showHeaders ? 1 : 0;

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

				if (ix === headerRowIx || child === proxy) {
					return;
				}
				if (ix === firstActualRowIx) {
					// first row
					if (currentY < compensatedTop + halfHeight) {
						newIx = firstActualRowIx;
						return false;
					} else if (currentY < compensatedBottom) {
						newIx = firstActualRowIx + 1;
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
				gridRowsContainer = gridRef.current._listRef._scrollRef.childNodes[0],
				gridRowsContainerRect = gridRowsContainer.getBoundingClientRect(),
				marker = document.createElement('div');

			marker.style.position = 'absolute';
			marker.style.top = top -4 + 'px'; // -4 so it's always visible
			marker.style.height = '4px';
			marker.style.width = gridRowsContainerRect.width + 'px';
			marker.style.backgroundColor = '#f00';

			gridRowsContainer.appendChild(marker);

			setDragRowSlot({ ix: newIx, marker, useBottom, });
		},
		onRowReorderDrag = (info, e, proxy, node) => {
			// console.log('onRowReorderDrag', info, e, proxy, node);
			const
				proxyRect = proxy.getBoundingClientRect(),
				row = node.parentElement.parentElement,
				parent = row.parentElement,
				parentRect = parent.getBoundingClientRect(),
				rows = _.filter(parent.children, (childNode) => {
					return childNode.getBoundingClientRect().height !== 0; // Skip zero-height children
				}),
				currentY = proxyRect.top - parentRect.top, // top position of pointer, relative to page
				headerRowIx = showHeaders ? 0 : null,
				firstActualRowIx = showHeaders ? 1 : 0;

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

				if (ix === headerRowIx || child === proxy) {
					return;
				}
				if (ix === firstActualRowIx) {
					// first row
					if (currentY < compensatedTop + halfHeight) {
						newIx = firstActualRowIx;
						return false;
					} else if (currentY < compensatedBottom) {
						newIx = firstActualRowIx + 1;
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
			let marker = dragRowSlot?.marker;
			if (marker) {
				marker.style.top = top -4 + 'px'; // -4 so it's always visible
			}

			setDragRowSlot({ ix: newIx, marker, useBottom, });
			// console.log('onRowReorderDrag', newIx);

		},
		onRowReorderDragStop = (delta, e, config) => {
			// console.log('onRowReorderDragStop', delta, e, config);
			const
				dropIx = dragRowSlot.ix,
				compensatedDragIx = showHeaders ? dragRowIx -1 : dragRowIx, // ix, without taking header row into account
				compensatedDropIx = showHeaders ? dropIx -1 : dropIx, // // ix, without taking header row into account
				dropPosition = dragRowSlot.useBottom ? DROP_POSITION_AFTER : DROP_POSITION_BEFORE;

			let shouldMove = true,
				finalDropIx = compensatedDropIx;
			
			if (dropPosition === DROP_POSITION_BEFORE) {
				if (dragRowIx === dropIx || dragRowIx === dropIx -1) { // basically before or after the drag row's origin
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
				if (dragRowIx === dropIx) {
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

			if (dragRowSlot) {
				dragRowSlot.marker.remove();
			}
			setDragRowSlot(null);
		},
		adjustPageSizeToHeight = (e) => {
			let doLoad = false;
			if (!isRenderedRef.current) {
				isRenderedRef.current = true;
				if (loadOnRender && Repository && !Repository.isLoaded && !Repository.isLoading && !Repository.isAutoLoad) {
					doLoad = true; // first time in onLayout only!
				}
			}

			let adjustPageSizeToHeight = autoAdjustPageSizeToHeight;
			if (!Repository || (!_.isNil(UiGlobals.autoAdjustPageSizeToHeight) && !UiGlobals.autoAdjustPageSizeToHeight)) {
				adjustPageSizeToHeight = false;
			}
			if (adjustPageSizeToHeight) {
				const
					containerHeight = e.nativeEvent.layout.height,
					headerHeight = showHeaders ? 50 : 0,
					footerHeight = !disablePagination ? 50 : 0,
					height = containerHeight - headerHeight - footerHeight,
					rowHeight = 48,
					rowsPerContainer = Math.floor(height / rowHeight);
				let pageSize = rowsPerContainer;
				if (showHeaders) {
					pageSize--;
				}
				if (pageSize !== Repository.pageSize) {
					Repository.setPageSize(pageSize);
				}
			}
			if (doLoad) {
				Repository.load();
			}
		},
		debouncedAdjustPageSizeToHeight = useCallback(_.debounce(adjustPageSizeToHeight, 200), []),
		onLayout = (e) => {
			if (!isRenderedRef.current) {
				// first time, call this immediately
				adjustPageSizeToHeight(e);
			} else {
				// debounce all subsequent calls
				debouncedAdjustPageSizeToHeight(e);
			}
		};

	useEffect(() => {

		const calculateLocalColumnsConfig = () => {
			// convert json config into actual elements
			const localColumnsConfig = [];
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

					// destructure so we can set defaults
					const {
							header,
							fieldName, // from @onehat/data model
							type, // specify which column type to use (custom or built-in)
							isEditable = false,
							editor,
							format,
							renderer, // React component will render the output
							reorderable = true,
							resizable = true,
							sortable = true,
							w,
							flex,
							...propsToPass
						} = columnConfig,

						config = {
							columnId: uuid(),
							header,
							fieldName,
							type,
							isEditable,
							editor,
							format,
							renderer,
							reorderable,
							resizable,
							sortable,
							w,
							flex,
							showDragHandles: false,
							...propsToPass,
						};

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
			return localColumnsConfig;
		};

		if (!isReady) {
			setLocalColumnsConfig(calculateLocalColumnsConfig());
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
		Repository.ons(['changeData', 'change'], forceUpdate);
		Repository.on('changeFilters', onChangeFilters);
		Repository.on('changeSorters', onChangeSorters);


		return () => {
			Repository.off('beforeLoad', setTrue);
			Repository.off('load', setFalse);
			Repository.offs(['changePage', 'changePageSize',], deselectAll);
			Repository.offs(['changeData', 'change'], forceUpdate);
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

	if (self) {
		self.ref = containerRef;
	}

	isAddingRef.current = isAdding;

	const footerToolbarItemComponents = useMemo(() => getFooterToolbarItems(), [additionalToolbarButtons, isDragMode]);

	if (!isReady) {
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

	return <Column
				{...testProps('Grid')}
				ref={containerRef}
				w="100%"
				bg={bg}
				borderWidth={styles.GRID_BORDER_WIDTH}
				borderColor={styles.GRID_BORDER_COLOR}
				onLayout={onLayout}
				{...sizeProps}
			>
				{topToolbar}

				<Column ref={gridContainerRef} w="100%" flex={1} minHeight={40} borderTopWidth={isLoading ? 2 : 1} borderTopColor={isLoading ? '#f00' : 'trueGray.300'} onClick={() => {
					if (!isDragMode && !isInlineEditorShown) {
						deselectAll();
					}
				}}>
					{!entities?.length ? <NoRecordsFound text={noneFoundText} onRefresh={onRefresh} /> :
						<FlatList
							ref={gridRef}
							// ListHeaderComponent={listHeaderComponent}
							// ListFooterComponent={listFooterComponent}
							scrollEnabled={true}
							nestedScrollEnabled={true}
							contentContainerStyle={{
								overflow: 'auto',
								borderWidth: isDragMode ? styles.REORDER_BORDER_WIDTH : 0,
								borderColor: isDragMode ? styles.REORDER_BORDER_COLOR : null,
								borderStyle: styles.REORDER_BORDER_STYLE,
								flex: 1,
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
							// getItemLayout={(data, index) => ( // an optional optimization that allows skipping the measurement of dynamic content if you know the size (height or width) of items ahead of time. getItemLayout is efficient if you have fixed size items
							// 	{length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index}
							// )}
							// numColumns={1}
							initialNumToRender={initialNumToRender}
							initialScrollIndex={0}
							renderItem={renderRow}
							bg="trueGray.100"
							{...flatListProps}
						/>}
				</Column>

				{listFooterComponent}

			</Column>;

}

export const Grid = withComponent(
						withAlert(
							withEvents(
								withData(
									withMultiSelection(
										withSelection(
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
					);

export const SideGridEditor = withComponent(
									withAlert(
										withEvents(
											withData(
												withMultiSelection(
													withSelection(
														withSideEditor(
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
								);

export const WindowedGridEditor = withComponent(
									withAlert(
										withEvents(
											withData(
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
								);

export const InlineGridEditor = withComponent(
									withAlert(
										withEvents(
											withData(
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
								);

export default Grid;
