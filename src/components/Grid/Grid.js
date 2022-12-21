import { useState, useEffect, } from 'react';
import {
	Column,
	Pressable,
	Row,
	Text,
} from 'native-base';
import oneHatData from '@onehat/data';
import testProps from '../../functions/testProps';
import inArray from '../../functions/inArray';
import useForceUpdate from '../../hooks/useForceUpdate';
import Loading from '../Messages/Loading';
import Toolbar from '../Toolbar/Toolbar';
import PaginationToolbar from '../Toolbar/PaginationToolbar';
import NoRecordsFound from './NoRecordsFound';
import AngleRight from '../Icons/AngleRight';
import {
	v4 as uuid,
} from 'uuid';
import _ from 'lodash';

// This grid is a raw NativeBase UI for @onehat/data


	// Desired features: ---------
	// Header cells
		// sticky at top
		// formatted differently
		// menu options
	// selection
		// single or multi selection mode
		// state to keep track of selection
		// Shift-click to add/subtract selection
		// Range selection (not super important)
	// context menu
		// menu options
		// onRightClick handler
	// Rows
		// Reordering
			// state to keep track of current ordering
			// handler for drag/drop
			// column configurable for reorder or not
			// Used primarily to change sort order in OneBuild apps
	// Columns
		// Resizing
			// state to keep track of current column sizes
			// handler for resizing
			// column configurable for resizable or not
		// Reordering
			// state to keep track of current ordering
			// handler for drag/drop
			// column configurable for reorder or not
	// custom cell types
		// Most would use text, and depend on @onehat/data for formatting
	// editor
		// double-click to enter edit mode (NativeBase doesn't have a double-click hander--can it be added manually to DOM?). Currently using longPress
		// Show inline editor for selected row
	// Display tree data
	// Copy current selection


// helper fn from https://reactgrid.com/docs/4.0/2-implementing-core-features/3-column-and-row-reordering/
// const reorderArray = (arr, idxs, to) => {
// 	const
// 		movedElements = arr.filter((_, idx) => idxs.includes(idx)),
// 		targetIdx = Math.min(...idxs) < to ? to += 1 : to -= idxs.filter(idx => idx < to).length,
// 		leftSide = arr.filter((_, idx) => idx < targetIdx && !idxs.includes(idx)),
// 		rightSide = arr.filter((_, idx) => idx >= targetIdx && !idxs.includes(idx));
// 	return [...leftSide, ...movedElements, ...rightSide];
// }


const
	ROW_HEADER_ID = 'ROW_HEADER_ID',
	ROW_TYPE_HEADER = 'ROW_TYPE_HEADER';

export default function Grid(props) {
	const
		{
			// #### General grid configuration ####
			model, // @onehat/data model name
			topToolbar,
			bottomToolbar = 'pagination',
			columnsConfig = [], // json configurations for each column in format:
				// [{
				// 	header,
				// 	fieldName, // from @onehat/data model
				// 	type, // specify which column type to use (custom or built-in)
				// 	editable = false,
				// 	editor,
				// 	format,
				// 	renderer, // React component will render the output
				// 	resizable = true,
				// 	sortable = true,
				// 	width = 150,
				// }]
			showHeaders = true,
			showRowExpander = false,
			enableEditors = false,
			cellEditing = false,
			rowEditing = false,
			contextMenuOptions = [], // json configurations for each menu option in format:
				// [{
				// 	id;
				// 	label;
				// 	handler: (selectedRowIds, selectedColIds, selectionMode, selectedRanges) => {},
				// }]
			// columnProps = {},
			// getRowProps = () => {
			// 	return {
			// 		bg: '#fff',
			// 		p: 2,
			// 	};
			// },
			gridProps = {},
			pullToRefresh = true,
			hideNavColumn = true,
			disableReloadOnChangeFilters = false,
			noneFoundText,

			// #### ReactGrid overrides #### 
			// properties
			customCellTemplates,
			focusLocation,
			initialFocusLocation,
			highlights,
			stickyTopRows = 0,
			stickyBottomRows = 0,
			stickyLeftColumns = 0,
			stickyRightColumns = 0,
			enableFillHandle,
			enableRangeSelection = true,
			enableRowSelection = false,
			enableColumnSelection = false,
			labels,
			disableVirtualScrolling = false,

			// ReactGrid events
			onCellsChanged,
			onFocusLocationChanged,
			onFocusLocationChanging,
			// onColumnResized,
			// onRowsReordered,
			// onColumnsReordered,
			onContextMenu,
			// canReorderColumns,
			// canReorderRows,
		} = props,
		Repository = model && oneHatData.getRepository(model),
		forceUpdate = useForceUpdate(),
		[isReady, setIsReady] = useState(false),
		[isLoading, setIsLoading] = useState(false),
		[selection, setSelection] = useState([]), // array of indices in repository's current page
		onRefresh = () => Repository.load(),
		onSelect = (entity, e, rowId) => {
			const
				shiftKey = e.shiftKey,
				clickedPageIx = Repository.getIxById(entity.id);
			let newSelection = [];
			if (shiftKey) {
				if (inArray(clickedPageIx, selection)) {
					// Remove from current selection
					newSelection = _.remove(selection, (sel) => sel !== clickedPageIx);
				} else {
					// Add to current selection
					newSelection = _.clone(selection); // so we get a new object, so component rerenders

					const currentSelectionLength = selection.length;

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
				newSelection = [clickedPageIx];
			}
			setSelection(newSelection);
		},
		onEdit = (entity, e, rowId) => {
			debugger;
		},
		onSort = (onSort) => {
			debugger;
		},
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
		// canReorderRows = (targetRowId, rowIds) => {
		// 	return targetRowId !== ROW_HEADER_ID; // Prevent reordering rows to be above header
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
		// },
		getColumnsData = () => {
			const columnsData = _.map(columnsConfig, (columnConfig) => {
					if (!columnConfig.width && !columnConfig.flex) {
						// Neither is set. Set default
						columnConfig.width = 100;
					} else if (columnConfig.flex && columnConfig.width) {
						// Both are set. Width overrules flex.
						delete columnConfig.flex;
					}
					if (!columnConfig.columnId) {
						columnConfig.columnId = uuid();
					}
					return columnConfig;
				});
			if (!hideNavColumn) {
				columnsData.push({
					type: 'nav',
					columnId: uuid(),
					resizable: false,
					sortable: false,
					width: 10,
				});
			}
			return columnsData;
		},
		getColumnConfig = (columnId) => {
			// gets columnConfig for a single column, based on columnId
			return _.find(columnsConfig, (columnConfig) => {
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
					const columnConfig = getColumnConfig(columnData.columnId);
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
					pageIx = Repository.getIxById(entity.id), // index in repository's current page
					cellsData = [];
				_.each(columnsData, (columnData) => {
					// These columns may have been reordered, so match them with columnConfig setting, but user ordering of columns
					const columnConfig = getColumnConfig(columnData.columnId);
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
				
				let selected = false;
				if (inArray(pageIx, selection)) {
					selected = true;
				}
				rowsData.push({
					rowId: entity.id,
					pageIx,
					entity,
					cellsData,
					selected,
				});
			});
			return rowsData;
		},
		[columnsData, setColumnsData] = useState(getColumnsData()),
		getRowIxByEntityId = (entityId) => {
			// Get ix on current page for entityId
			const row = _.find(rowsData, (rowData) => rowData.entity && rowData.entity.id === entityId);
			return row && row.rowId;
		},
		getRowIdByEntityId = (entityId) => {
			const row = _.find(rowsData, (rowData) => rowData.entity && rowData.entity.id === entityId);
			return row && row.rowId;
		},
		getEntityByRowId = (rowId) => {
			const row = _.find(rowsData, (rowData) => rowData.rowId === rowId);
			return row && row.entity;
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

		setIsReady(true);
		
		return () => {
			Repository.off('beforeLoad', setTrue);
			Repository.off('load', setFalse);
			Repository.offs(['changePage', 'changePageSize',], resetSelection);
			Repository.offs(['changeData', 'change'], forceUpdate);
			Repository.off('changeFilters', onChangeFilters);
		};
	}, [Repository, disableReloadOnChangeFilters, forceUpdate]);

	if (!Repository) {
		throw Error('No Repository!');
	}

	if (!isReady) {
		return null;
	}
	
	const
		propsToPass = {
			enableRangeSelection,
			stickyTopRows,
			stickyBottomRows,
			stickyLeftColumns,
			stickyRightColumns,
			disableVirtualScrolling,
		},
		propsToCheck = {
			customCellTemplates,
			focusLocation,
			initialFocusLocation,
			highlights,
			enableFillHandle,
			labels,
			
			onCellsChanged,
			onFocusLocationChanged,
			onFocusLocationChanging,
			// onColumnResized,
			// onRowsReordered,
			// onColumnsReordered,
			onContextMenu,
			// canReorderColumns,
			// canReorderRows,
		};
	_.each(propsToCheck, (prop, name) => {
		if (!_.isEmpty(prop) || prop) {
			propsToPass[name] = prop;
		}
	});

	// propsToPass.onColumnsReordered = onColumnsReordered;
	// propsToPass.onColumnResized = onColumnResized;
	// propsToPass.canReorderColumns = canReorderColumns;
	// propsToPass.canReorderRows = canReorderRows;

	// Build Grid components
	const
		rowsData = getRowsData(),
		rowComponents = _.map(rowsData, (rowData, ix) => {
			const {
					rowId,
					entity,
					cellsData,
					selected,
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
					cell = <Pressable
								onPress={(e) => {
									onSort(cellData, e);
								}}
								{...cellProps}
								bg="#eee"
							>
								<Text>{cellData.header}</Text>
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
							onSelect(entity, e, rowId);
						}}
						onLongPress={(e) => {
							if (rowId === ROW_HEADER_ID) {
								return false;
							}
							onSelect(entity, e, rowId);
							// onEdit(entity, e);
						}}
						borderBottomWidth={1}
						borderBottomColor="#eee"
						bg={selected ? '#ffa' : '#fff'}
					>
						<div onClick={(e) => {
								if (e.detail === 2) { // double-clicks only!
									onEdit(entity, e, rowId);
								}
							}}>
							<Row style={{ userSelect: 'none', }}>{cellComponents}</Row>
						</div>
					</Pressable>;
		});
	
	return <Column
				{...testProps('GridPanelContainer')}
				flex={1}
				w="100%"
			>
				{topToolbar && <Toolbar>{topToolbar}</Toolbar>}

				{isLoading && <Column flex={1}><Loading /></Column>}

				{!isLoading && (!Repository.getEntitiesOnPage().length ? <NoRecordsFound text={noneFoundText} onRefresh={onRefresh} /> : 
					<Column
						{...testProps('Grid')}
						flex={1}
						w="100%"
						overflow="scroll"
					>
						{rowComponents}
					</Column>
				)}

				{bottomToolbar && (bottomToolbar === 'pagination' ?
					<PaginationToolbar Repository={Repository} />:
						<Toolbar>{bottomToolbar}</Toolbar>)}
			</Column>;

}
