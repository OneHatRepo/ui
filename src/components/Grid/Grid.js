import React, { useState, useEffect, } from 'react';
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
	SELECTION_MODE_SINGLE,
	SELECTION_MODE_MULTI,
} from '../../constants/Grid';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../constants/Directions';
import {
	v4 as uuid,
} from 'uuid';
import oneHatData from '@onehat/data';
import useBlocking from '../../hooks/useBlocking';
import testProps from '../../functions/testProps';
import inArray from '../../functions/inArray';
import emptyFn from '../../functions/emptyFn';
import useForceUpdate from '../../hooks/useForceUpdate';
import Splitter from '../Container/Splitter';
import Loading from '../Messages/Loading';
import Toolbar from '../Toolbar/Toolbar';
import PaginationToolbar from '../Toolbar/PaginationToolbar';
import NoRecordsFound from './NoRecordsFound';
import IconButton from '../Buttons/IconButton';
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
			// handler for drag/drop
			// target column configurable for reorder or not
	// Columns
		// Drag/drop reordering
			// Drag on middle of header to new location
			// state to keep track of current ordering
			// handler for drag/drop
			// column configurable for reorder or not
		// Resizing
			// Drag handles on column sides
			// state to keep track of current column sizes
			// handler for resizing
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
	const
		{
			model, // @onehat/data model name
			columnsConfig = [], // json configurations for each column in format:
			columns = [],
			columnProps = {},
			getRowProps = () => {
				return {
					bg: '#fff',
					py: 1,
					px: 2,
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
		Repository = model && oneHatData.getRepository(model),
		forceUpdate = useForceUpdate(),
		{ blocked } = useBlocking(),
		[isReady, setIsReady] = useState(false),
		[isLoading, setIsLoading] = useState(false),
		[isSortDirectionAsc, setIsSortDirectionAsc] = useState(Repository.getSortDirection() === SORT_ASCENDING),
		[sortField, setSortField] = useState(Repository.getSortField() || null),
		[sortFn, setSortFn] = useState(Repository.getSortFn() || null),
		[selection, setLocalSelection] = useState([]), // array of indices in repository's current page
		[localColumnsConfig, setLocalColumnsConfig] = useState([]),
		[columnsData, setColumnsData] = useState(),

		// grid actions
		onRefresh = () => Repository.reload().then(() => {
			setIsLoading(false);
			forceUpdate();
		}),
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
		columnRenderer = (entity) => {
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

					if (config.w) {
						propsToPass.w = config.w;
					} else if (config.flex) {
						propsToPass.flex = config.flex;
					}
					// return <Text
					// 			key={key}
					// 			alignSelf="center"
					// 			pl={3}
					// 			fontSize={18}
					// 		>{entity[fieldName]}</Text>;
					
					return <Text key={key} {...propsToPass}>{value}</Text>;
				});
			} else {
				// TODO: if 'localColumnsConfig' is an object, parse its contents
				throw new Error('Non-array localColumnsConfig not yet supported');
			}
		},
		renderHeaders = () => {
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
						resizable,
						sortable,
						w,
						flex,
					} = config,
					isSorter = sortable && canColumnsSort && sortField === fieldName,
					isReorderable = canColumnsReorder,
					isResizable = canColumnsResize && resizable,
					propsToPass = {
						borderRightWidth: 2,
						borderRightColor: '#fff',
						px: 2,
					}

				if (w) {
					propsToPass.w = w;
				} else if (flex) {
					propsToPass.flex = flex;
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
							bg="#eee"
							p={0}
							_hover={{
								bg: '#bbb',
							}}
							flexDirection="row"
							borderLeftWidth={1}
							borderLeftColor="trueGray.100"
							borderRightWidth={1}
							borderRightColor="trueGray.300"
							{...propsToPass}
						>
							<Text flex={1}>{header}</Text>
							{isSorter && <Icon as={isSortDirectionAsc ? SortDown : SortUp} textAlign="center" size="sm" mt={1} mr={1} color="trueGray.700" />}
							{isResizable && <Splitter mode={HORIZONTAL} left="5px" onResize={(delta, e) => onColumnResize(delta, e, config)} />}
						</Pressable>
			});
			if (!hideNavColumn) {
				headerColumns.push(<AngleRight
										key="navcol"
										color="#aaa"
										variant="ghost"
										w={30}
										alignSelf="center"
										ml={3}
									/>);
			}
			return <Row w="100%" h="40px" bg="trueGray.100">
						{headerColumns}
					</Row>
		},
		onColumnResize = (delta, e, config) => {

			// Figure out a way to keep track of the column widths
			// and also simultaneously figure out a way to reorder
			// the columns.
			// When you adjust the width of a column, does that simply
			// change the one column's width? What happens to all other
			// column widths?
			// Still don't know if the view will scroll to the right 
			// if more columns than screen space exist.
debugger;
			const 
				oldWidth = getColumnWidth(config.columnId),
				newWidth = oldWidth + delta;
			setColumnWidth(config.columnId, newWidth);
		};
		// onColumnsReordered = (targetColumnId, columnIds) => {
		// 	const
		// 		to = columnsData.findIndex((column) => column.columnId === targetColumnId),
		// 		columnIdxs = columnIds.map((columnId) => columnsData.findIndex((c) => c.columnId === columnId)),
		// 		reorderedColumns = reorderArray(columnsData, columnIdxs, to);
		// 	setColumns(reorderedColumns);
		// },
		// onRowsReordered = () => {},
		// onColumnResized = (targetColumnId, newWidth, arr) => {
		// 	const column = _.find(columnsData, (column) => column.columnId === targetColumnId);
		// 	column.width = newWidth;
		// 	forceUpdate();
		// },
		// canReorderColumns = (targetColumnId, columnIds, beforeAfter) => {
		// 	// Verify that *all* columns in selection can be reordered
		// 	let canReorder = true;
		// 	_.each(columnsData, (column) => {
		// 		if (inArray(column.columnId, columnIds) && !column.sortable) {
		// 			canReorder = false;
		// 			return false;
		// 		}
		// 	});

		// 	// Verify that targetColumn can be reordered
		// 	const targetColumn = _.find(columnsData, (column) => column.columnId === targetColumnId);
		// 	if (!targetColumn.sortable) {
		// 		canReorder = false;
		// 	}

		// 	return canReorder;
		// },
		// getCellType = (fieldName) => {
		// 	const
		// 		schema = Repository.schema,
		// 		propertyDefinition = schema.getPropertyDefinition(fieldName);
		// 	switch(propertyDefinition.type) {
		// 		case 'base64':
		// 			propsToPass[type] = 'text';
		// 			break;
		// 		case 'boolean':
		// 			break;
		// 		case 'currency':
		// 			break;
		// 		case 'date':
		// 			propsToPass[type] = 'date';
		// 			break;
		// 		case 'dateTime':
		// 			break;
		// 		case 'file':
		// 			propsToPass[type] = 'text';
		// 			break;
		// 		case 'float':
		// 			break;
		// 		case 'integer':
		// 			break;
		// 		case 'json':
		// 			propsToPass[type] = 'text';
		// 			break;
		// 		case 'oercent':
		// 			break;
		// 		case 'oercentInt':
		// 			break;
		// 		case 'string':
		// 			propsToPass[type] = 'text';
		// 			break;
		// 		case 'time':
		// 			break;
		// 		case 'uuid':
		// 			propsToPass[type] = 'text';
		// 			break;
		// 		default:
		// 			propsToPass[type] = 'text';
		// 	}
		// }
		
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

	if (!isReady) {
		return null;
	}
	
	const
		// rowsData = getRowsData(),
		toolbarItemComponents = getToolbarItems();

	let bbar = null;
	if (bottomToolbar === 'pagination' && !disablePaging) {
		bbar = <PaginationToolbar Repository={Repository} toolbarItems={toolbarItemComponents} />;
	} else if (toolbarItemComponents.length) {
		bbar = <Toolbar>{toolbarItemComponents}</Toolbar>;
	}

	const entities = Repository.getEntitiesOnPage();

	return <Column
				{...testProps('Grid')}
				flex={1}
				w="100%"
			>
				{topToolbar && <Toolbar>{topToolbar}</Toolbar>}

				{isLoading && <Column flex={1}><Loading /></Column>}

				{renderHeaders()}
				{!isLoading && (!Repository.getEntitiesOnPage().length ? <NoRecordsFound text={noneFoundText} onRefresh={onRefresh} /> : 
					
					<FlatList
						refreshing={isLoading}
						onRefresh={pullToRefresh ? onRefresh : null}
						progressViewOffset={100}
						data={entities}
						keyExtractor={(entity) => {
							return String(entity.id);
						}}
						initialNumToRender={entities.length}
						initialScrollIndex={initialScrollIndex}
						renderItem={(row) => {
							const entity = row.item,
								rowProps = getRowProps ? getRowProps(entity) : {};
							
							return <Pressable
										{...testProps(Repository.schema.name + '-' + entity.id)}
										onPress={() => onSelect(entity)}
										onLongPress={() => onSelect(entity)}
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
												flex: 1,
												width: '100%',
											}}
										>
											<Row
												alignItems="center"
												borderBottomWidth={1}
												borderBottomColor="trueGray.500"
												{...rowProps}
												>
													{columnRenderer(entity)}
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
				)}

				{bbar}

			</Column>;

}
