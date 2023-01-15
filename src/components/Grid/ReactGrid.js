import { useState, useEffect, } from 'react';
import {
	Column as Col,
	Text,
} from 'native-base';
import {
	ReactGrid,
} from '@silevis/reactgrid';
// import {
// 	// Undocumented API
// 	getCalculatedScrollLeftValueToLeft,
// 	getCalculatedScrollLeftValueToRight,
// 	getDerivedStateFromProps,
// 	getLocationFromClient,
// 	getReactGridOffsets,
// 	getScrollLeft,
// 	getSizeOfElement,
// 	getVisibleColumns,
// 	getVisibleScrollAreaWidth,
// 	getVisibleSizeOfReactGrid,
// 	recalcVisibleRange,
// 	setStyles,
// 	VS_PAGE_WIDTH,
// 	stateDeriver,
// 	updateStateProps,
// } from '@silevis/reactgrid';
import '@silevis/reactgrid/Styles.css';
import './reactgrid.css';
// import * as Silevis from '@silevis/reactgrid';
// debugger;
// import { useReactGridState } from '@silevis/reactgrid/src/lib/Components/StateProvider';
import oneHatData from '@onehat/data';
import testProps from '../../Functions/testProps';
import inArray from '../../Functions/inArray';
import useForceUpdate from '../../Hooks/useForceUpdate';
import Loading from '../Messages/Loading';
import Toolbar from '../Toolbar/Toolbar';
import PaginationToolbar from '../Toolbar/PaginationToolbar';
import NoRecordsFound from './NoRecordsFound';
import AngleRight from '../Icons/AngleRight';
import _ from 'lodash';

// This grid makes @silevis/reactgrid a UI for @onehat/data
// If you want a simple grid for static data, just use <ReactGrid /> directly.

// helper fn from https://reactgrid.com/docs/4.0/2-implementing-core-features/3-column-and-row-reordering/
const reorderArray = (arr, idxs, to) => {
	const
		movedElements = arr.filter((_, idx) => idxs.includes(idx)),
		targetIdx = Math.min(...idxs) < to ? to += 1 : to -= idxs.filter(idx => idx < to).length,
		leftSide = arr.filter((_, idx) => idx < targetIdx && !idxs.includes(idx)),
		rightSide = arr.filter((_, idx) => idx >= targetIdx && !idxs.includes(idx));
	return [...leftSide, ...movedElements, ...rightSide];
}

export default function Grid(props) {
	const
		{
			// #### General grid configuration ####
			model, // @onehat/data model name
			topToolbar,
			bottomToolbar = 'pagination',
			columnsConfig = [], // json configurations for each column in format:
				// [{
				// 	text, // header
				// 	field, // field name from @onehat/data model
				// 	type, // specify which column type to use (custom or built-in)
				// 	editable = false,
				// 	editor,
				// 	format,
				// 	renderer, // React component will render the output
				// 	resizable = true,
				// 	sortable = true,
				// 	width = 150, // default of ReactGrid
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
			enableFullWidthHeader = false,
			enableGroupIdRender = false,
			horizontalStickyBreakpoint,
			verticalStickyBreakpoint,
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
		onRefresh = () => Repository.load(),
		onColumnsReordered = (targetColumnId, columnIds) => {
			const
				to = columns.findIndex((column) => column.columnId === targetColumnId),
				columnIdxs = columnIds.map((columnId) => columns.findIndex((c) => c.columnId === columnId)),
				reorderedColumns = reorderArray(columns, columnIdxs, to);
			setColumns(reorderedColumns);
		},
		onRowsReordered = () => {},
		onColumnResized = (targetColumnId, newWidth, arr) => {
			const column = _.find(columns, (column) => column.columnId === targetColumnId);
			column.width = newWidth;
			forceUpdate();
		},
		canReorderColumns = (targetColumnId, columnIds, beforeAfter) => {
			// Verify that *all* columns in selection can be reordered
			let canReorder = true;
			_.each(columns, (column) => {
				if (inArray(column.columnId, columnIds) && !column.reorderable) {
					canReorder = false;
					return false;
				}
			});

			// Verify that targetColumn can be reordered
			const targetColumn = _.find(columns, (column) => column.columnId === targetColumnId);
			if (!targetColumn.reorderable) {
				canReorder = false;
			}

			return canReorder;
		},
		canReorderRows = (targetRowId, rowIds) => {
			return targetRowId !== 'header'; // Prevent reordering rows to be above header
		},
		getCellType = (field) => {
			const
				schema = Repository.schema,
				propertyDefinition = schema.getPropertyDefinition(field);
			switch(propertyDefinition.type) {
				case 'base64':
					propsToPass[type] = 'text';
					break;
				case 'boolean':
					break;
				case 'currency':
					break;
				case 'date':
					propsToPass[type] = 'date';
					break;
				case 'dateTime':
					break;
				case 'file':
					propsToPass[type] = 'text';
					break;
				case 'float':
					break;
				case 'integer':
					break;
				case 'json':
					propsToPass[type] = 'text';
					break;
				case 'oercent':
					break;
				case 'oercentInt':
					break;
				case 'string':
					propsToPass[type] = 'text';
					break;
				case 'time':
					break;
				case 'uuid':
					propsToPass[type] = 'text';
					break;
				default:
					propsToPass[type] = 'text';
			}
		},
		getColumns = () => {
			const columns = _.map(columnsConfig, (columnConfig) => {
					const {
							field,
							resizable = true,
							sortable = true,
							width = 150, // default of ReactGrid
						} = columnConfig;
					return {
						columnId: field,
						reorderable: sortable,
						resizable,
						width,
					};
				});
			if (!hideNavColumn) {
				columns.push({
					columnId: 'nav',
					reorderable: false,
					resizable: false,
					width: 10,
				});
			}

			// Try to simulate 'flex' width for a single column
			// const flexColumnConfig = _.find(columnsConfig, (columnConfig) => !!columnConfig.flex);
			// if (flexColumnConfig) {
			// 	const flexColumn = _.find(columns, (column) => column.columnId === flexColumnConfig.field);
			// 	const r = ref;
			// 	debugger;
			// }
			return columns;
		},
		getRows = () => {
			const
				entities = Repository.getEntitiesOnPage(),
				rows = [];
			
			if (showHeaders) {
				// Build header row
				const headerCells = [];
				_.each(columns, (column) => {
					// These columns may have been reordered, so match them with columnConfig setting, but user ordering of columns
					const columnConfig = _.find(columnsConfig, (columnConfig) => {
						return columnConfig.field === column.columnId;
					});
					if (!columnConfig) { // e.g rightColumn (nav) cell
						return;
					}
					headerCells.push({
						type: 'header',
						text: columnConfig.text,
					});
				});
				if (!hideNavColumn) {
					headerCells.push({
						type: 'header',
						text: '',
					});
				}
				rows.push({ rowId: 'header', cells: headerCells, });
			}
				
			_.each(entities, (entity, ix) => {
				// Build the cells for this row, based on previously defined columns
				const cells = [];
				_.each(columns, (column) => {
					// These columns may have been reordered, so match them with columnConfig setting, but user ordering of columns
					const columnConfig = _.find(columnsConfig, (columnConfig) => {
						return columnConfig.field === column.columnId;
					});
					if (!columnConfig) { // e.g rightColumn (nav) cell
						return;
					}
					const {
							type = 'text', // specify which Column type to use for this cell (custom or built-in)
							field,
							placeholder,
							validator,
							renderer,
							checkedText,
							uncheckedText,
							format,
						} = columnConfig,
						property = entity.properties[field],
						propsToPass = {
							type,
						},
						propsToCheck = {
							placeholder,
							validator,
							renderer,
							checkedText,
							uncheckedText,
							// date,
							format,
							// text,
						};
					_.each(propsToCheck, (prop, name) => {
						if (!_.isEmpty(prop)) {
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

					cells.push(propsToPass);
				}); // end each(columns)

				if (!hideNavColumn) {
					cells.push({
						type: 'text',
						text: '',
						renderer: () => <AngleRight
							color="#aaa"
							variant="ghost"
							alignSelf="center"
							ml={1}
						/>,
					});
				}
				
				rows.push({
					rowId: entity.id,
					cells,
				});
			});
			return rows;
		},
		[columns, setColumns] = useState(getColumns());

	useEffect(() => {
		const
			setTrue = () => setIsLoading(true),
			setFalse = () => setIsLoading(false),
			onChangeFilters = () => {
				if (!Repository.isAutoLoad && Repository.isLoaded && !disableReloadOnChangeFilters) {
					Repository.reload();
				}
			};

		Repository.on('beforeLoad', setTrue);
		Repository.on('load', setFalse);
		Repository.ons(['changePage', 'changePageSize', 'changeData', 'change'], forceUpdate);
		Repository.on('changeFilters', onChangeFilters);

		setIsReady(true);
		
		return () => {
			Repository.off('beforeLoad', setTrue);
			Repository.off('load', setFalse);
			Repository.offs(['changePage', 'changePageSize', 'changeData', 'change'], forceUpdate);
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
			enableRowSelection,
			enableColumnSelection,
			enableFullWidthHeader,
			enableGroupIdRender,
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
			horizontalStickyBreakpoint,
			verticalStickyBreakpoint,
			
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
		if (!_.isEmpty(prop)) {
			propsToPass[name] = prop;
		}
	});

	propsToPass.onColumnsReordered = onColumnsReordered;
	propsToPass.onColumnResized = onColumnResized;
	propsToPass.canReorderColumns = canReorderColumns;
	propsToPass.canReorderRows = canReorderRows;
	propsToPass.columns = columns;
	propsToPass.rows = getRows();


	propsToPass.onContextMenu = (selectedRowIds, selectedColIds, selectionMode, menuOptions) => {
		debugger;
	};
	propsToPass.onCellsChanged = (a,b,c,d,e) => {
		debugger;
	};
	propsToPass.onFocusLocationChanged = (pos) => {
		debugger;
	};
	propsToPass.onFocusLocationChanging = (pos) => {
		return true;
	};
	//	special props
	// data,
	// treeData,

	return <Col
				{...testProps('GridPanelContainer')}
				flex={1}
				w="100%"
			>
				{topToolbar && <Toolbar>{topToolbar}</Toolbar>}

				{isLoading && <Col flex={1}><Loading /></Col>}

				{!isLoading && (!Repository.getEntitiesOnPage().length ? <NoRecordsFound text={noneFoundText} onRefresh={onRefresh} /> : 
				
					<ReactGrid
						{...propsToPass}
						{...gridProps}
					/>)}

				{bottomToolbar && (bottomToolbar === 'pagination' ?
					<PaginationToolbar Repository={Repository} />:
						<Toolbar>{bottomToolbar}</Toolbar>)}
			</Col>;

}
