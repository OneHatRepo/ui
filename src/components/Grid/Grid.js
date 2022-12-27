import React, { useState, useEffect, useRef, } from 'react';
import {
	Box,
	Column,
	FlatList,
	Icon,
	Modal,
	Pressable,
	Row,
	Spacer,
	Text,
} from 'native-base';
import {
	ROW_HEADER_ID,
	SORT_ASCENDING,
	SORT_DESCENDING,
} from '../../constants/Grid';
import {
	SELECTION_MODE_SINGLE,
	SELECTION_MODE_MULTI,
} from '../../constants/Selection';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../constants/Directions';
import {
	v4 as uuid,
} from 'uuid';
import oneHatData from '@onehat/data';
import useBlocking from '../../hooks/useBlocking';
import useForceUpdate from '../../hooks/useForceUpdate';
import emptyFn from '../../functions/emptyFn';
import inArray from '../../functions/inArray';
import testProps from '../../functions/testProps';
import HeaderDragHandle from './HeaderDragHandle';
import HeaderResizeHandle from './HeaderResizeHandle';
import IconButton from '../Buttons/IconButton';
import Loading from '../Messages/Loading';
import PaginationToolbar from '../Toolbar/PaginationToolbar';
import NoRecordsFound from './NoRecordsFound';
import Toolbar from '../Toolbar/Toolbar';
import AngleRight from '../Icons/AngleRight';
import SortDown from '../Icons/SortDown';
import SortUp from '../Icons/SortUp';
import _ from 'lodash';

// Grid requires the use of HOC withSelection() whenever it's used.
// This is the *raw* component that can be combined with many HOCs
// for various functionality.

	// Desired features: ---------
	// Header cells
		// √ sticky at top
		// √ formatted differently
		// √ click header to sort by column
	// selection
		// √ single or multi selection mode
		// √ state to keep track of selection
		// √ Shift-click to add/subtract selection
		// √ Range selection 
		// √ Copy current selection
		// Draggable selection (not super important)
	// context menu
		// √ onRightClick handler
		// √ menu options
	// Rows
		// Drag/drop reordering (Used primarily to change sort order in OneBuild apps)
			// state to keep track of current ordering
			// √ handler for drag/drop
			// target column configurable for reorder or not
	// Columns
		// Allow for column content to fill beyond the size of panel, and scroll to see more
		// Drag/drop reordering
			// [ ] Drag on middle of header to new location
			// state to keep track of current ordering
			// √ handler for drag/drop
			// column configurable for reorder or not
		// Resizing
			// √ Drag handles on column sides
			// state to keep track of current column sizes
			// √ handler for resizing
			// column configurable for resizable or not
	// custom cell types
		// Most would use text, and depend on @onehat/data for formatting
	// editor
		// √ double-click to enter edit mode (NativeBase doesn't have a double-click hander--can it be added manually to DOM?). Currently using longPress
		// Show inline editor for selected row
		// windowed editor for selected row
			// form panel for multiple editing of selected rows
	// Display tree data

export default function Grid(props) {
	const {
			Repository,
			model, // @onehat/data model name
			columnsConfig = [], // json configurations for each column in format:
			columns = [],
			columnProps = {},
			getRowProps = () => {
				return {
					bg: '#fff',
					py: 1,
					pl: 4,
					pr: 2,
				};
			},
			selectionMode = SELECTION_MODE_MULTI, // SELECTION_MODE_MULTI, SELECTION_MODE_SINGLE
			noSelectorMeansNoResults = false,
			// enableEditors = false,
			flatListProps = {},
			pullToRefresh = true,
			hideNavColumn = true,
			disableLoadingIndicator = false,
			noneFoundText,
			disableReloadOnChangeFilters = false,

			showRowExpander = false,
			rowExpanderTpl = '',
			
			
			topToolbar,
			bottomToolbar = 'pagination',
			additionalToolbarButtons = [],
			showHeaders = true,
			canColumnsSort = true,
			canColumnsReorder = true,
			canColumnsResize = true,
			allowToggleSelection = true, // i.e. single click with no shift key toggles the selection of the item clicked on
			disablePaging = false,
			autoSelectFirstItem = false,
			initialScrollIndex = 0,

			// onColumnResized,
			// onRowsReordered,
			// onColumnsReordered,

			// editor

			onSelect = emptyFn,
			onAdd,
			onEdit,
			onRemove,
			onView,
			onDuplicate,
			onReset,
			onContextMenu,
		} = props,
		// Repository = model && oneHatData.getRepository(model),
		forceUpdate = useForceUpdate(),
		{ blocked } = useBlocking(),
		headerRef = useRef(),
		gridRef = useRef(),
		[isReady, setIsReady] = useState(false),
		[isRendered, setIsRendered] = useState(false),
		[isLoading, setIsLoading] = useState(false),
		[isSortDirectionAsc, setIsSortDirectionAsc] = useState(Repository.getSortDirection() === SORT_ASCENDING),
		[sortField, setSortField] = useState(Repository.getSortField() || null),
		[sortFn, setSortFn] = useState(Repository.getSortFn() || null),
		[dragColumnSlot, setDragColumnSlot] = useState(null),
		[headerWidth, setHeaderWidth] = useState('100%'),
		[selection, setLocalSelection] = useState([]), // array of indices in repository's current page
		[localColumnsConfig, setLocalColumnsConfig] = useState([]),
		[columnsData, setColumnsData] = useState(),

		// grid actions
		onRefresh = () => {
			const promise = Repository.reload();
			if (promise) { // Some repository types don't use promises
				promise.then(() => {
					setIsLoading(false);
					forceUpdate();
				});
			}
		},
		setSelection = (newSelection) => {
			setLocalSelection(newSelection)
			if (onSelect && onSelect !== emptyFn) {
				onSelect(getEntitiesByRowIndices(newSelection));
			}
		},
		onRowSelect = (entity, e) => {
			const
				currentSelectionLength = selection.length,
				shiftKey = e.shiftKey,
				clickedPageIx = Repository.getIxById(entity.id);
			let newSelection = [];
			if (selectionMode === SELECTION_MODE_MULTI) {
				if (shiftKey) {
					if (inArray(clickedPageIx, selection)) {
						// Remove from current selection
						newSelection = _.remove(selection, (sel) => sel !== clickedPageIx);
					} else {
						// Add to current selection
						newSelection = _.clone(selection); // so we get a new object, so component rerenders

						if (currentSelectionLength) {
							// Add a range of items, as the user shift-clicked a row when another was already selected
							const
								max = Math.max(...selection),
								min = Math.min(...selection);
							let i;

							if (max < clickedPageIx) {
								// all other selections are below the current;
								// Range is from max up to clickedPageIx
								for (i = max +1; i < clickedPageIx; i++) {
									newSelection.push(i);
								}

							} else if (min > clickedPageIx) {
								// all other selections are above the current;
								// Range is from min down to clickedPageIx
								for (i = min -1; i > clickedPageIx; i--) {
									newSelection.push(i);
								}
							}
						}
						newSelection.push(clickedPageIx);
					}
				} else {
					if (inArray(clickedPageIx, selection)) {
						// Already selected
						if (allowToggleSelection) {
							// Remove from current selection
							newSelection = _.remove(selection, (sel) => sel !== clickedPageIx);
						} else {
							// Do nothing.
							newSelection = selection;
						}
					} else {
						// Just select it alone
						newSelection = [clickedPageIx];
					}
				}
			} else {
				// selectionMode === SELECTION_MODE_SINGLE

				if (inArray(clickedPageIx, selection)) {
					// Already selected
					if (allowToggleSelection) {
						// Remove from current selection
						newSelection = [];
					} else {
						// Do nothing.
						newSelection = selection;
					}
				} else {
					// Just select it
					newSelection = [clickedPageIx];
				}
			}

			setSelection(newSelection);
		},
		onSort = (cellData, e) => {
			let currentSortField = sortField,
				selectedSortField = cellData.fieldName,
				isCurrentSortDirectionAsc = isSortDirectionAsc;
			if (selectedSortField !== currentSortField) {
				// Change the field, sort Asc
				currentSortField = selectedSortField
				isCurrentSortDirectionAsc = true;
			} else {
				// Toggle direction
				isCurrentSortDirectionAsc = !isCurrentSortDirectionAsc;
			}
			setSortField(currentSortField);
			setIsSortDirectionAsc(isCurrentSortDirectionAsc);

			// Change sorter on OneHatData
			Repository.sort(currentSortField, isCurrentSortDirectionAsc ? SORT_ASCENDING : SORT_DESCENDING, sortFn);

			// clear the selection
			setSelection([]);
		},

		// fns to build elements
		getToolbarItems = () => {
			const
				iconButtonProps = {
					_hover: {
						bg: 'trueGray.400',
					},
					mx: 1,
					px: 3,
				};
			return _.map(additionalToolbarButtons, (config, ix) => {
				let {
						text,
						handler,
						icon = null,
						isDisabled = false,
					} = config;
				if (icon) {
					const iconProps = {
						alignSelf: 'center',
						size: 'sm',
						color: isDisabled ? 'disabled' : 'trueGray.800',
						h: 20,
						w: 20,
					};
					icon = React.cloneElement(icon, {...iconProps});
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
		},

		// helper fns
		getRowIdByEntityId = (entityId) => {
			const row = _.find(rowsData, (rowData) => rowData.entity && rowData.entity.id === entityId);
			return row && row.rowId;
		},
		getRowIxByEntityId = (entityId) => {
			// Get ix on current page for entityId
			const row = _.find(rowsData, (rowData) => rowData.entity && rowData.entity.id === entityId);
			return row && row.rowIx;
		},
		getEntityByRowId = (rowId) => {
			const row = _.find(rowsData, (rowData) => rowData.rowId === rowId);
			return row && row.entity;
		},
		getEntityByRowIx = (rowIx) => {
			// Get entity for rowIx on current page
			const row = _.find(rowsData, (rowData) => rowData.rowIx === rowIx);
			return row && row.entity;
		},
		getEntitiesByRowIndices = (rowIndices) => {
			return _.map(rowIndices, (rowIx) => getEntityByRowIx(rowIx));
		},
		getSelectedEntities = () => {
			return _.filter(rowsData, (rowData) => {
				if (!rowData.entity || !rowData.isSelected) {
					return false;
				}
				return rowData.entity;
			});
		},

		// fns to build the grid columns / rows
		calculateLocalColumnsConfig = () => {
			// convert json config into actual elements
			const localColumnsConfig = [];
			_.each(columnsConfig, (columnConfig) => {
				// destructure so we can set defaults
				const {
						header,
						fieldName, // from @onehat/data model
						type, // specify which column type to use (custom or built-in)
						editable = false,
						editor,
						format,
						renderer, // React component will render the output
						reorderable = true,
						resizable = true,
						sortable = true,
						w,
						flex,
					} = columnConfig,

					config = {
						columnId: uuid(),
						header,
						fieldName,
						type,
						editable,
						editor,
						format,
						renderer,
						reorderable,
						resizable,
						sortable,
						w,
						flex,
					};

				if (!config.w && !config.flex) {
					// Neither is set
					config.w = 100; // default
				} else if (config.flex && config.width) {
					// Both are set. Width overrules flex.
					delete config.flex;
				}

				localColumnsConfig.push(config);
			});
			return localColumnsConfig;
		},
		getColumnConfigByColumnId = (columnId) => {
			// gets columnConfig for a single column, based on columnId
			return _.find(localColumnsConfig, (columnConfig) => {
				return columnConfig.columnId === columnId;
			});	
		},
		getRowsData = () => {
			const
				entities = Repository.getEntitiesOnPage(),
				rowsData = [];
			
			// Build header row
			if (showHeaders) {
				const headerCells = [];
				_.each(columnsData, (columnData) => {
					// These columns may have been reordered, so match them with columnConfig setting, but user ordering of columns
					const columnConfig = getColumnConfigByColumnId(columnData.columnId);
					if (!columnConfig) { // e.g nav cell
						return;
					}
					headerCells.push(columnConfig);
				});
				rowsData.push({
					rowId: ROW_HEADER_ID,
					cellsData: headerCells,
				});
			}
	
			// Build the data rows
			_.each(entities, (entity) => {
				// Build the cells for this row
				const
					rowIx = Repository.getIxById(entity.id), // index in repository's current page
					cellsData = [];
				_.each(columnsData, (columnData) => {
					// These columns may have been reordered, so match them with columnConfig setting, but user ordering of columns
					const columnConfig = getColumnConfigByColumnId(columnData.columnId);
					if (!columnConfig) { // e.g nav cell
						return;
					}
					const {
							type = 'text',
							fieldName,
							placeholder,
							// validator,
							renderer,
							// checkedText,
							// uncheckedText,
							format,
							width,
							flex,
						} = columnConfig,
						property = entity.properties[fieldName],
						propsToPass = {
							columnConfig,
							type,
						},
						propsToCheck = {
							placeholder,
							// validator,
							renderer,
							// checkedText,
							// uncheckedText,
							// date,
							format,
							// text,
							width,
							flex,
						};
					_.each(propsToCheck, (prop, name) => {
						if (!_.isEmpty(prop) || prop) {
							propsToPass[name] = prop;
						}
					});
	
					// Determine value for this cell
					switch(type) {
						case 'text':
							propsToPass.text = property.displayValue;
							break;
						default:
					}
					cellsData.push(propsToPass);
				}); // end each(columnsData)
	
				if (!hideNavColumn) {
					cellsData.push({
						type: 'nav',
						renderer: () => <AngleRight
							color="#aaa"
							variant="ghost"
							alignSelf="center"
							ml={1}
						/>,
					});
				}
				
				let isSelected = false;
				if (inArray(rowIx, selection)) {
					isSelected = true;
				}
				rowsData.push({
					rowId: entity.id,
					rowIx,
					entity,
					cellsData,
					isSelected,
				});
			});
			return rowsData;
		},
		getRowComponents = () => {
			return _.map(rowsData, (rowData, ix) => {
				const {
						rowId,
						entity,
						cellsData,
						isSelected,
					} = rowData,
					cellComponents = [];
				_.each(cellsData, (cellData, ix) => {
					let cell;
					const cellProps = {};
					cellProps.key = (rowId === ROW_HEADER_ID ? 'header' : rowId) + '-' + ix;
					cellProps.py = 1;
					cellProps.px = 3;
					if (cellData.flex) {
						cellProps.flex = cellData.flex;
					}
					if (cellData.width) {
						cellProps.width = cellData.width;
					}
					if (rowId === ROW_HEADER_ID) {
						const isCellSorter = canColumnsSort && sortField === cellData.fieldName;
						cell = <Pressable
									onPress={(e) => {
										if (canColumnsSort) {
											onSort(cellData, e);
										}
									}}
									{...cellProps}
									bg="#eee"
									_hover={{
										bg: '#bbb',
									}}
									flexDirection="row"
									borderLeftWidth={1}
									borderLeftColor="trueGray.100"
									borderRightWidth={1}
									borderRightColor="trueGray.300"
								>
									<Text flex={1}>{cellData.header}</Text>
									{isCellSorter && <Icon as={isSortDirectionAsc ? SortDown : SortUp} textAlign="center" size="sm" mt={1} color="trueGray.700" />}
								</Pressable>;
					} else {
						switch(cellData.type) {
							case 'text':
								cell = <Text {...cellProps}>{cellData.text}</Text>;
								break;
							default:
						}
					}
					cellComponents.push(cell);
				});
				return <Pressable
							key={'row' + ix}
							onPress={(e) => {
								if (rowId === ROW_HEADER_ID) {
									return false;
								}
								onRowSelect(entity, e);
							}}
							onLongPress={(e) => {
								if (rowId === ROW_HEADER_ID) {
									return false;
								}
								onRowSelect(entity, e);
							}}
							borderBottomWidth={1}
							borderBottomColor="#eee"
							bg={isSelected ? 'selected' : '#fff'}
						>
							<div
								onClick={(e) => {
									if (e.detail === 2) { // double-click
										onEdit(e);
									}
								}}
								onContextMenu={(e) => {
									e.preventDefault();
									if (onContextMenu) {
										onContextMenu(entity, rowId, e);
									}
								}}
							>
								<Row style={{ userSelect: 'none', }}>{cellComponents}</Row>
							</div>
						</Pressable>;
			});
		},
		renderColumn = (entity) => {
			if (_.isArray(localColumnsConfig)) {
				return _.map(localColumnsConfig, (config, key) => {
					let value;

					if (_.isObject(config)) {
						if (config.renderer) {
							return config.renderer(entity, key);
						}
						if (config.fieldName && entity.properties[config.fieldName]) {
							const property = entity.properties[config.fieldName];
							// debugger;


							value = property.displayValue;
						}
						if (entity[config.fieldName]) {
	
						}
					}
					if (_.isString(config)) {
						value = entity[config];
					}
					if (_.isFunction(config)) {
						value = config(entity);
					}
					if (_.isFunction(value)) {
						return value(key);
					}


					const propsToPass = columnProps[key] || {};
					propsToPass.key = key;
					propsToPass.overflow = 'hidden';
					propsToPass.textOverflow = 'ellipsis';
					propsToPass.alignSelf = 'center';
					propsToPass.fontSize = 18;

					if (config.w) {
						propsToPass.w = config.w;
					} else if (config.flex) {
						propsToPass.flex = config.flex;
						propsToPass.minWidth = 100;
					}
					
					return <Text {...propsToPass}>{value}</Text>;
				});
			} else {
				// TODO: if 'localColumnsConfig' is an object, parse its contents
				throw new Error('Non-array localColumnsConfig not yet supported');
			}
		},
		renderAllHeaders = () => {
			const
				sorters = Repository.sorters,
				sorter = sorters.length === 1 ? sorters[0] : null,
				sortField = sorter && sorter.name,
				isSortDirectionAsc = sorter && sorter.direction === 'ASC';

			// These header components should match the columns exactly
			// so we can drag/drop them to control the columns.
			const headerColumns = _.map(localColumnsConfig, (config, ix) => {
				const {
						columnId,
						header,
						fieldName,
						reorderable,
						resizable,
						sortable,
						w,
						flex,
					} = config,
					isSorter = sortable && canColumnsSort && sortField === fieldName,
					isReorderable = canColumnsReorder && reorderable,
					isResizable = canColumnsResize && resizable,
					propsToPass = {
						borderRightWidth: 2,
						borderRightColor: '#fff',
					}

				if (w) {
					propsToPass.w = w;
				} else if (flex) {
					propsToPass.flex = flex;
					propsToPass.minWidth = 100;
				}

				return <Pressable
							key={ix}
							onPress={(e) => {
								if (blocked.current) {
									return;
								}
								if (canColumnsSort) {
									onSort(config, e);
								}
							}}
							flexDirection="row"
							h="100%"
							bg="#eee"
							_hover={{
								bg: '#bbb',
							}}
							p={0}
							style={{ userSelect: 'none', }}
							{...propsToPass}
						>
							{isReorderable && <HeaderDragHandle
												key="HeaderDragHandle"
												mode={HORIZONTAL}
												onDragStop={(delta, e) => onColumnReorder(delta, e, config)}
												onDrag={onColumnDrag}
												getProxy={(node) => {
													const
														columnHeader = node.parentElement,
														columnHeaderRect = columnHeader.getBoundingClientRect(),
														proxy = columnHeader.cloneNode(true);
													
													proxy.style.top = columnHeaderRect.top + 10 + 'px';
													proxy.style.left = columnHeaderRect.left + 'px';
													proxy.style.height = columnHeaderRect.height + 'px';
													proxy.style.width = columnHeaderRect.width + 'px';
													proxy.style.display = 'flex';
													proxy.style.backgroundColor = '#ddd';
													return proxy;
												}}
											/>}
							
							<Text key="Text" overflow="hidden" textOverflow="ellipsis" flex={1} h="100%" px={2} pt={2} alignItems="center" justifyContent="center">{header}</Text>
							
							{isSorter && <Icon key="Icon" as={isSortDirectionAsc ? SortDown : SortUp} textAlign="center" size="sm" mt={3} mr={2} color="trueGray.500" />}
							
							{isResizable && <HeaderResizeHandle
												key="HeaderResizeHandle"
												mode={HORIZONTAL}
												onDragStop={(delta, e, node) => onColumnResize(delta, e, node, config)}
												getProxy={(node) => {
													const
														columnHeader = node.parentElement,
														columnHeaderRect = columnHeader.getBoundingClientRect(),
														nodeRect = node.getBoundingClientRect(),
														gridRowsContainer = gridRef.current._listRef._scrollRef.childNodes[0],
														gridRowsContainerRect = gridRowsContainer.getBoundingClientRect(),
														proxy = node.cloneNode(true),
														verticalLine = document.createElement('div');
													
													verticalLine.style.position = 'absolute';
													verticalLine.style.height = gridRowsContainerRect.height + columnHeaderRect.height + 'px';
													verticalLine.style.width = '1px';
													verticalLine.style.top = 0;
													verticalLine.style.right = 0;
													verticalLine.style.backgroundColor = '#ddd';
													proxy.appendChild(verticalLine);

													proxy.style.top = nodeRect.top + 'px';
													proxy.style.left = nodeRect.left + 'px';
													proxy.style.height = nodeRect.height + 'px';
													proxy.style.width = nodeRect.width + 'px';
													proxy.style.display = 'flex';

													return proxy;
												}}
											/>}
						</Pressable>;
			});
			if (!hideNavColumn) {
				headerColumns.push(<AngleRight
										key="AngleRight"
										color="#aaa"
										variant="ghost"
										w={30}
										alignSelf="center"
										ml={3}
									/>);
			}
			return headerColumns;
		},
		onColumnDrag = (info, e, proxy, node) => {
			const
				proxyRect = proxy.getBoundingClientRect(),
				columnHeader = node.parentElement,
				columnHeaders = _.filter(columnHeader.parentElement.children, (childNode) => {
					return childNode.getBoundingClientRect().width !== 0; // Skip zero-width children
				}),
				currentX = proxyRect.left; // left position of pointer
		
			// Figure out which index the user wants
			let newIx = 0;
			_.each(columnHeaders, (child, ix, all) => {
				const
					rect = child.getBoundingClientRect(), // rect of the columnHeader of this iteration
					{
						left,
						right,
						width,
					} = rect,
					halfWidth = width /2;

				if (ix === 0) {
					// first column
					if (currentX < left + halfWidth) {
						newIx = 0;
						return false;
					} else if (currentX < right) {
						newIx = 1;
						return false;
					}
				} else if (ix === all.length -1) {
					// last column
					if (currentX < left + halfWidth) {
						newIx = ix;
						return false;
					}
					newIx = ix +1;
					return false;
				}
				
				// all other columns
				if (left <= currentX && currentX < left + halfWidth) {
					newIx = ix;
					return false;
				} else if (currentX < right) {
					newIx = ix +1;
					return false;
				}
			});

			// Verify index can actually be used
			if (typeof localColumnsConfig[newIx] === 'undefined' || !localColumnsConfig[newIx].reorderable) {
				return;
			}

			// Render marker showing destination location (can't use regular render cycle because this div is absolutely positioned on page)
			const
				columnHeaderRect = columnHeaders[newIx].getBoundingClientRect(),
				left = columnHeaderRect.left;
			let marker = dragColumnSlot && dragColumnSlot.marker;
			if (!marker) {
				const
					gridRowsContainer = gridRef.current._listRef._scrollRef.childNodes[0],
					gridRowsContainerRect = gridRowsContainer.getBoundingClientRect();

				marker = document.createElement('div');
				marker.style.position = 'absolute';
				marker.style.height = gridRowsContainerRect.height + columnHeaderRect.height + 'px';
				marker.style.width = '4px';
				marker.style.top = columnHeaderRect.top + 'px';
				// marker.style.right = 0;
				marker.style.backgroundColor = '#ccc';

				document.body.appendChild(marker);
			}
			marker.style.left = left + 'px';

			setDragColumnSlot({ ix: newIx, marker, });
		},
		onColumnReorder = (delta, e, config) => {
			const columnsConfig = _.clone(localColumnsConfig); // work with a copy, so that setter forces rerender

			 _.pull(columnsConfig, config);

			// Stick the column at the new ix  (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
			columnsConfig.splice(dragColumnSlot.ix, 0, config);

			setLocalColumnsConfig(columnsConfig);

			if (dragColumnSlot) {
				dragColumnSlot.marker.remove();
			}
			setDragColumnSlot(null);
		},
		onColumnResize = (delta, e, node, config) => {
			const columnsConfig = _.clone(localColumnsConfig); // work with a copy, so that setter forces rerender
			if (config.w) {
				config.w = Math.round(config.w + delta);
			} else if (config.flex) {
				// Figure out the previous width
				// Add it as 'w' here and delete flex
				const 
					columnHeader = node.parentElement,
					previousWidth = columnHeader.getBoundingClientRect().width;
				delete config.flex;
				config.w = Math.round(previousWidth + delta);
			}

			setLocalColumnsConfig(columnsConfig);
		};
		
	useEffect(() => {
		const
			setTrue = () => setIsLoading(true),
			setFalse = () => setIsLoading(false),
			resetSelection = () => {
				setSelection([]);
			},
			onChangeFilters = () => {
				if (!Repository.autoLoad && Repository.isLoaded && !disableReloadOnChangeFilters) {
					Repository.reload();
				}
			};

		Repository.on('beforeLoad', setTrue);
		Repository.on('load', setFalse);
		Repository.ons(['changePage', 'changePageSize',], resetSelection);
		Repository.ons(['changeData', 'change'], forceUpdate);
		Repository.on('changeFilters', onChangeFilters);

		setLocalColumnsConfig(calculateLocalColumnsConfig());
		if (autoSelectFirstItem) {
			setSelection([0]);
		}
		setIsReady(true);
		
		return () => {
			Repository.off('beforeLoad', setTrue);
			Repository.off('load', setFalse);
			Repository.offs(['changePage', 'changePageSize',], resetSelection);
			Repository.offs(['changeData', 'change'], forceUpdate);
			Repository.off('changeFilters', onChangeFilters);
		};
	}, []);

	useEffect(() => {
		// Need to assign DOM scroll event handlers onto the grid, so scrolling the rows
		// will also scroll the header
		if (gridRef && gridRef.current && headerRef && headerRef.current) {
			const scroller = gridRef.current._listRef._scrollRef.childNodes[0];
			scroller.addEventListener('scroll', (e) => {
				headerRef.current.scrollLeft = e.target.scrollLeft;
			});
		}
	}, [isRendered]);


	if (!isReady) {
		return null;
	}
	
	const
		entities = Repository.getEntitiesOnPage(),
		toolbarItemComponents = getToolbarItems();

	let listHeaderComponent = null,
		listFooterComponent = null,
		headerColumns = showHeaders ? renderAllHeaders() : [];

	if (!_.isEmpty(headerColumns)) {
		listHeaderComponent = <Row
								w="100%"
								h="36px"
								bg="trueGray.200"
								overflow="scroll"
								ref={headerRef} onScroll={(e) => gridRef.current._listRef._scrollRef.childNodes[0].scrollLeft = e.target.scrollLeft}
								style={{
									scrollbarWidth: 'none',
								}}
								onLayout={(e) => {
									const width = e.nativeEvent.layout.width;
									setHeaderWidth(width + 'px');
								}}
							> 
									{headerColumns}
							</Row>;
	}
	if (bottomToolbar === 'pagination' && !disablePaging) {
		listFooterComponent = <PaginationToolbar Repository={Repository} toolbarItems={toolbarItemComponents} />;
	} else if (toolbarItemComponents.length) {
		listFooterComponent = <Toolbar>{toolbarItemComponents}</Toolbar>;
	}
	
	return <Column
				{...testProps('Grid')}
				flex={1}
				w="100%"
				onLayout = {() => setIsRendered(true)}
			>
				{topToolbar && <Toolbar>{topToolbar}</Toolbar>}

				{listHeaderComponent}

				{isLoading && <Column flex={1}><Loading /></Column>}
				{!isLoading && 
					
					<Column w="100%" flex={1} 
						// overflow="scroll" ref={gridRef} onScroll={(e) => headerRef.current.scrollLeft = e.target.scrollLeft}
					>
						<FlatList
							ref={gridRef}
							width={headerWidth}
							// ListHeaderComponent={listHeaderComponent}
							// ListFooterComponent={listFooterComponent}
							ListEmptyComponent={<NoRecordsFound text={noneFoundText} onRefresh={onRefresh} />}
							scrollEnabled={true}
							nestedScrollEnabled={true}
							contentContainerStyle={{
								overflow: 'scroll',
							}}
							refreshing={isLoading}
							onRefresh={pullToRefresh ? onRefresh : null}
							progressViewOffset={100}
							data={entities}
							keyExtractor={(entity) => {
								return String(entity.id);
							}}
							// getItemLayout={(data, index) => ( // an optional optimization that allows skipping the measurement of dynamic content if you know the size (height or width) of items ahead of time. getItemLayout is efficient if you have fixed size items
							// 	{length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index}
							// )}
							// numColumns={1}
							initialNumToRender={entities.length}
							initialScrollIndex={initialScrollIndex}
							renderItem={(row) => {
								const entity = row.item,
									rowProps = getRowProps ? getRowProps(entity) : {};

								return <Pressable
											{...testProps(Repository.schema.name + '-' + entity.id)}
											onPress={() => onSelect(entity)}
											onLongPress={() => onSelect(entity)}
											bg="#fff"
											w="100%"
										>
											<div
												onClick={(e) => {
													if (onEdit && e.detail === 2) {
														// double-click
														onEdit(e);
													}
												}}
												onContextMenu={(e) => {
													e.preventDefault();
													if (onContextMenu) {
														const rowIx = getRowIxByEntityId(entity.id);
														onContextMenu(entity, rowIx, e, selection, setSelection);
													}
												}}
												style={{
													display: 'flex',
													flex: 1,
													width: '100%',
												}}
											>
												<Row
													alignItems="center"
													borderBottomWidth={1}
													borderBottomColor="trueGray.500"
													flexGrow={1}
													{...rowProps}
												>
													{renderColumn(entity)}
													{!hideNavColumn && <AngleRight
														color="#aaa"
														variant="ghost"
														w={30}
														alignSelf="center"
														ml={3}
													/>}
												</Row>
											</div>
										</Pressable>;
							}}
							bg="trueGray.200"
							{...flatListProps}
						/>

					</Column>
					
				}

			{listFooterComponent}

			</Column>;

}
