import React, { useState, useEffect, } from 'react';
import {
	Column,
	Icon,
	Modal,
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
import IconButton from '../Buttons/IconButton';
import AngleRight from '../Icons/AngleRight';
import Clipboard from '../Icons/Clipboard';
import Duplicate from '../Icons/Duplicate';
import Edit from '../Icons/Edit';
import Eye from '../Icons/Eye';
import Trash from '../Icons/Trash';
import Plus from '../Icons/Plus';
import Print from '../Icons/Print';
import SortDown from '../Icons/SortDown';
import SortUp from '../Icons/SortUp';
import {
	v4 as uuid,
} from 'uuid';
import _ from 'lodash';

// This grid is a raw NativeBase UI for @onehat/data


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
		// double-click to enter edit mode (NativeBase doesn't have a double-click hander--can it be added manually to DOM?). Currently using longPress
		// Show inline editor for selected row
		// windowed editor for selected row
			// form panel for multiple editing of selected rows
	// Display tree data

const
	ROW_HEADER_ID = 'ROW_HEADER_ID',
	SORT_ASCENDING = 'ASC',
	SORT_DESCENDING = 'DESC';

export default function Grid(props) {
	const
		{
			model, // @onehat/data model name
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
			selectionMode = 'multi', // multi, single
			enableEditors = false,
			editorType = 'inline', // inline, windowed
			gridProps = {},
			pullToRefresh = true,
			hideNavColumn = true,
			disableReloadOnChangeFilters = false,
			noneFoundText,

			showRowExpander = false,
			rowExpanderTpl = '',
			
			
			// Note: A 'button' will create both a context menu item and a toolbar button that match in text label, icon, and handler.
			// The 'presets' are defined by Grid. The 'additionals' are user-defined. 
			presetButtons = [
				'add',
				'edit',
				'delete',
				'copy',
				// 'view',
				'duplicate',
				'print',
			],
			additionalButtons = [],
			contextMenuItems = [],
			topToolbar,
			bottomToolbar = 'pagination',
			additionalToolbarItems = [],
			showHeaders = true,
			enableSorting = true,
			allowToggleSelection = true, // i.e. single click with no shift key toggles the selection of the item clicked on
			disablePaging = false,
			disableContextMenu = false,
			autoSelectFirstItem = false,

			onSelection,
			// onColumnResized,
			// onRowsReordered,
			// onColumnsReordered,
			// onContextMenu,
		} = props,
		Repository = model && oneHatData.getRepository(model),
		forceUpdate = useForceUpdate(),
		[isReady, setIsReady] = useState(false),
		[isLoading, setIsLoading] = useState(false),
		[isContextMenuShown, setIsContextMenuShown] = useState(false),
		[isEditorShown, setIsEditorShown] = useState(false),
		[currentEntity, setCurrentEntity] = useState(), // for editor
		[contextMenuX, setContextMenuX] = useState(0),
		[contextMenuY, setContextMenuY] = useState(0),
		[isSortDirectionAsc, setIsSortDirectionAsc] = useState(Repository.getSortDirection() === SORT_ASCENDING),
		[sortField, setSortField] = useState(Repository.getSortField() || null),
		[sortFn, setSortFn] = useState(Repository.getSortFn() || null),
		[selection, setSelection] = useState([]), // array of indices in repository's current page
		[columnsData, setColumnsData] = useState(),
		onRefresh = () => Repository.load(),
		onSelect = (entity, e) => {
			const
				currentSelectionLength = selection.length,
				shiftKey = e.shiftKey,
				clickedPageIx = Repository.getIxById(entity.id);
			let newSelection = [];
			if (selectionMode === 'multi') {
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
				// selectionMode === 'single'

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
			if (onSelection) {
				onSelection(getEntitiesByRowIndices(newSelection));
			}
		},
		onAdd = () => {
			debugger;
			const entity = Repository.add({
				// defaults are where??
			});

			setCurrentEntity(entity);
			setIsEditorShown(true);
		},
		onEdit = (e, rowId) => {
			const entity = getEntityByRowIx(selection[0]);

			setCurrentEntity(entity);
			setIsEditorShown(true);
		},
		onView = () => {},
		onDelete = () => {
			debugger;
		},
		onCopyToClipboard = () => {
			// Get text of all selected rows
			const selectedRows = _.filter(rowsData, (rowData) => {
				if (!rowData.entity || !rowData.isSelected) {
					return false;
				}
				return rowData;
			});
			let text;
			if (selectedRows.length) {
				const
					headerText = _.map(rowsData[0].cellsData, (cellData) => cellData.header).join("\t"),
					rowTexts = _.map(selectedRows, (rowData) => {
						const {
								entity,
								cellsData,
							} = rowData,
							rowValues = _.map(cellsData, (cellData) => {
										if (!cellData.columnConfig) {
											return null;
										}
										const fieldName = cellData.columnConfig.fieldName;
										return entity[fieldName];
									});
							return rowValues.join("\t");
					});
				text = [headerText, ...rowTexts].join("\n");
			} else {
				text = 'Nothing selected to copy!';
			}

			// Send it to clipboard
			navigator.clipboard.writeText(text);
		},
		onDuplicate = () => {
			debugger;
		},
		onPrint = () => {
			debugger;
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
		onContextMenu = (entity, rowId, e) => {
			if (!selection.length && entity) {
				// No current selections, so select this row so operations apply to it
				setSelection([getRowIxByEntityId(entity.id)]);
			}
			
			setIsContextMenuShown(true);
			setContextMenuX(e.pageX);
			setContextMenuY(e.pageY);
		},
		getSelectedEntities = () => {
			return _.filter(rowsData, (rowData) => {
				if (!rowData.entity || !rowData.isSelected) {
					return false;
				}
				return rowData.entity;
			});
		},
		getPresetButtonProps = (type) => {
			let text,
				handler,
				icon = null,
				isDisabled = false;
			switch(type) {
				case 'add':
					text = 'Add';
					handler = onAdd;
					icon = <Plus />;
					break;
				case 'edit':
					text = 'Edit';
					handler = onEdit;
					icon = <Edit />;
					isDisabled = !selection.length || selection.length !== 1;
					break;
				case 'delete':
					text = 'Delete';
					handler = onDelete;
					icon = <Trash />;
					isDisabled = !selection.length || selection.length !== 1;
					break;
				case 'view':
					text = 'View';
					handler = onView;
					icon = <Eye />;
					isDisabled = !selection.length || selection.length !== 1;
					break;
				case 'copy':
					text = 'Copy';
					handler = onCopyToClipboard;
					icon = <Clipboard />;
					isDisabled = !selection.length;
					break;
				case 'duplicate':
					text = 'Duplicate';
					handler = onDuplicate;
					icon = <Duplicate />;
					isDisabled = !selection.length || selection.length !== 1;
					break;
				case 'print':
					text = 'Print';
					handler = onPrint;
					icon = <Print />;
					break;
				default:
			}
			return {
				text,
				handler,
				icon,
				isDisabled,
			};
		},
		getContextMenuItems = () => {
			if (disableContextMenu) {
				return;
			}
			const presetButtonConfigs = _.map(presetButtons, (presetButton) => {
				return getPresetButtonProps(presetButton);
			});
			return _.map([...presetButtonConfigs, ...additionalButtons, ...contextMenuItems], (config, ix) => {
				let {
						text,
						handler,
						icon = null,
						isDisabled = false,
					} = config;
				const iconProps = {
					alignSelf: 'center',
					size: 'sm',
					color: isDisabled ? 'disabled' : 'trueGray.800',
					h: 20,
					w: 20,
					mr: 2,
				};
				if (icon) {
					icon = React.cloneElement(icon, {...iconProps});
				}
				return <Pressable
							key={ix}
							onPress={() => {
								setIsContextMenuShown(false);
								handler(getSelectedEntities());
							}}
							flexDirection="row"
							borderBottomWidth={1}
							borderBottomColor="trueGray.200"
							py={2}
							px={4}
							_hover={{
								bg: '#ffc',
							}}
							isDisabled={isDisabled}
						>
							{icon}
							<Text flex={1} color={isDisabled ? 'disabled' : 'trueGray.800'}>{text}</Text>
						</Pressable>;
			});
		},
		getToolbarItems = () => {
			if (disableContextMenu) {
				return;
			}
			const
				iconButtonProps = {
					mx: 1,
					_hover: {
						bg: 'trueGray.400',
					},
					px: 3,
				},
				presetButtonConfigs = _.map(presetButtons, (presetButton) => {
					return getPresetButtonProps(presetButton);
				});
			return _.map([...presetButtonConfigs, ...additionalButtons, ...additionalToolbarItems], (config, ix) => {
				let {
						text,
						handler,
						icon = null,
						isDisabled = false,
					} = config,
					iconProps = {
						alignSelf: 'center',
						size: 'sm',
						color: isDisabled ? 'disabled' : 'trueGray.800',
						h: 20,
						w: 20,
					};
				if (icon) {
					icon = React.cloneElement(icon, {...iconProps});
				}
				return <IconButton
							key={ix}
							{...iconButtonProps}
							onPress={() => {
								setIsContextMenuShown(false);
								handler(getSelectedEntities());
							}}
							icon={icon}
							isDisabled={isDisabled}
							tooltip={text}
						/>;
			});
		},
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
					rowIx = Repository.getIxById(entity.id), // index in repository's current page
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
						const isCellSorter = enableSorting && sortField === cellData.fieldName;
						cell = <Pressable
									onPress={(e) => {
										if (enableSorting) {
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
								onSelect(entity, e);
							}}
							onLongPress={(e) => {
								if (rowId === ROW_HEADER_ID) {
									return false;
								}
								onSelect(entity, e);
							}}
							borderBottomWidth={1}
							borderBottomColor="#eee"
							bg={isSelected ? 'selected' : '#fff'}
						>
							<div
								className="mouseClickInterceptor"
								onClick={(e) => {
									if (e.detail === 2) {
										// double-click
										onEdit(e);
									}
								}}
								onContextMenu={(e) => {
									e.preventDefault();
									if (!disableContextMenu && onContextMenu) {
										onContextMenu(entity, rowId, e);
									}
								}}
							>
								<Row style={{ userSelect: 'none', }}>{cellComponents}</Row>
							</div>
						</Pressable>;
			});
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

		setColumnsData(getColumnsData());
		if (!isReady) {
			if (autoSelectFirstItem) {
				setSelection([0]);
			}
			setIsReady(true);
		}
		
		return () => {
			Repository.off('beforeLoad', setTrue);
			Repository.off('load', setFalse);
			Repository.offs(['changePage', 'changePageSize',], resetSelection);
			Repository.offs(['changeData', 'change'], forceUpdate);
			Repository.off('changeFilters', onChangeFilters);
		};
	}, [Repository, disableReloadOnChangeFilters, forceUpdate, isReady]);

	if (!isReady) {
		return null;
	}
	
	const
		rowsData = getRowsData(),
		rowComponents = getRowComponents(),
		contextMenuItemComponents = getContextMenuItems(),
		toolbarItemComponents = getToolbarItems();

	let bbar = null;
	if (bottomToolbar === 'pagination' && !disablePaging) {
		bbar = <PaginationToolbar Repository={Repository} toolbarItems={toolbarItemComponents} />;
	} else if (toolbarItemComponents.length) {
		bbar = <Toolbar>{toolbarItemComponents}</Toolbar>;
	}
	
	return <Column
				{...testProps('GridPanelContainer')}
				flex={1}
				w="100%"
			>
				{topToolbar && <Toolbar>{topToolbar}</Toolbar>}

				{isLoading && <Column flex={1}><Loading /></Column>}

				{!isLoading && (!Repository.getEntitiesOnPage().length ? <NoRecordsFound text={noneFoundText} onRefresh={onRefresh} /> : 
					
					<Pressable
						onPress={() => {
							setSelection([]);
						}}
						flex={1}
						w="100%"
					>
						<div
							className="mouseClickInterceptor"
							onContextMenu={(e) => {
								e.preventDefault();
								if (!disableContextMenu && onContextMenu) {
									onContextMenu(null, null, e);
								}
							}}
							style={{
								flex: 1,
								width: '100%',
							}}
						>
							<Column
								{...testProps('Grid')}
								flex={1}
								w="100%"
								overflow="scroll"
							>
								{rowComponents}
							</Column>
						</div>
					</Pressable>
				)}

				{bbar}

				<Modal
					animationType="fade"
					isOpen={isContextMenuShown && !disableContextMenu}
					onClose={() => setIsContextMenuShown(false)}
				>
					<Column bg="#fff" w={160} position="absolute" top={contextMenuY} left={contextMenuX}>
						{contextMenuItemComponents}
					</Column>
				</Modal>
				<Modal
					animationType="fade"
					isOpen={isEditorShown}
					onClose={() => setIsEditorShown(false)}
				>
					<Column bg="#fff" w={500} h={400}>
						<Text>Editor here!</Text>
					</Column>
				</Modal>
			</Column>;

}
