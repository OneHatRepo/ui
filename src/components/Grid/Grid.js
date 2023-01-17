import React, { useState, useEffect, useRef, } from 'react';
import {
	Box,
	Column,
	FlatList,
	Icon,
	Pressable,
	Row,
	Text,
} from 'native-base';
import {
	SORT_ASCENDING,
	SORT_DESCENDING,
} from '../../Constants/Grid';
import {
	SELECTION_MODE_SINGLE,
	SELECTION_MODE_MULTI,
} from '../../Constants/Selection';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../Constants/Directions';
import styles from '../../Constants/Styles';
import {
	v4 as uuid,
} from 'uuid';
import useBlocking from '../../Hooks/useBlocking';
import useForceUpdate from '../../Hooks/useForceUpdate';
import withContextMenu from '../Hoc/withContextMenu';
import withAlert from '../Hoc/withAlert';
import withData from '../Hoc/withData';
import withEvents from '../Hoc/withEvents';
import withFilters from '../Hoc/withFilters';
import withPresetButtons from '../Hoc/withPresetButtons';
import withMultiSelection from '../Hoc/withMultiSelection';
import withSelection from '../Hoc/withSelection';
import withWindowedEditor from '../Hoc/withWindowedEditor';
import withInlineEditor from '../Hoc/withInlineEditor';
import testProps from '../../Functions/testProps';
import HeaderReorderHandle from './HeaderReorderHandle';
import HeaderResizeHandle from './HeaderResizeHandle';
import IconButton from '../Buttons/IconButton';
import PaginationToolbar from '../Toolbar/PaginationToolbar';
import NoRecordsFound from './NoRecordsFound';
import Toolbar from '../Toolbar/Toolbar';
import AngleRight from '../Icons/AngleRight';
import SortDown from '../Icons/SortDown';
import SortUp from '../Icons/SortUp';
import _ from 'lodash';

// Grid requires the use of HOC withSelection() whenever it's used.
// The default export is *with* the HOC. A separate *raw* component is
// exported which can be combined with many HOCs for various functionality.

	// Desired features: ---------
	// √ Loading indicator
	// √ Header cells
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
	// √ context menu
		// √ onRightClick handler
		// √ menu options
	// √ Columns
		// √ Allow for column content to fill beyond the size of panel, and scroll to see more
		// √ Drag/drop reordering
			// √ Drag on middle of header to new location
			// √ state to keep track of current ordering
			// √ handler for drag/drop
			// √ column configurable for reorder or not
		// √ Resizing
			// √ Drag handles on column sides
			// √ state to keep track of current column sizes
			// √ handler for resizing
			// √ column configurable for resizable or not
	// √ Filters
		// √ Set them
		// √ Button to select others
		// √ Some way to show all possibilities in modal (equivalent of ModelFilters in old system)
		// √ way to swap filters and have it affect Repository
	// editor
		// √ double-click to enter edit mode (NativeBase doesn't have a double-click hander--can it be added manually to DOM?). Currently using longPress
		// √ windowed editor for selected row
		// √ form panel for editing of multiple selected rows
		// [ ] Show inline editor for selected row
		// Dragging of window (see withWindowedEditor)
	// Rows
		// Drag/drop reordering (Used primarily to change sort order in OneBuild apps)
			// state to keep track of current ordering
			// √ handler for drag/drop
			// If it's reorderable, add reorder drag handle column
	// custom cell types
		// Most would use text, and depend on @onehat/data for formatting
	// Display tree data

export function Grid(props) {
	const {

			columnsConfig = [], // json configurations for each column

			columnProps = {},
			getRowProps = () => {
				return {
					borderBottomWidth: 1,
					borderBottomColor: 'trueGray.500',
					py: 2,
					pl: 4,
					pr: 2,
				};
			},
			flatListProps = {},
			// enableEditors = false,
			pullToRefresh = true,
			hideNavColumn = true,
			noneFoundText,
			disableLoadingIndicator = false,
			showRowExpander = false,
			loadAfterRender = true,
			rowExpanderTpl = '',
			showHeaders = true,
			showHovers = true,
			canColumnsSort = true,
			canColumnsReorder = true,
			canColumnsResize = true,
			allowToggleSelection = true, // i.e. single click with no shift key toggles the selection of the item clicked on
			disablePagination = false,
			bottomToolbar = 'pagination',
			topToolbar = null,
			additionalToolbarButtons = [],

			// withEditor
			onAdd,
			onEdit,
			onDelete,
			onView,
			onDuplicate,
			onReset,
			onContextMenu,

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
			selectRangeTo,
			isInSelection,
			noSelectorMeansNoResults = false,

			// selectorSelected
			selectorId,
			selectorSelected,
			disableSelectorSelected = false,

			// withInlineEditor
			inlineEditorRef,
			onScrollRow,
			onEditorRowClick,

		} = props,
		forceUpdate = useForceUpdate(),
		{ isBlocked } = useBlocking(),
		headerRef = useRef(),
		gridRef = useRef(),
		sortFn = Repository && Repository.getSortFn(),
		sortField = Repository && Repository.getSortField(),
		[isSortDirectionAsc, setIsSortDirectionAsc] = useState(Repository && Repository.getSortDirection() === SORT_ASCENDING),
		[isReady, setIsReady] = useState(false),
		[isRendered, setIsRendered] = useState(false),
		[isLoading, setIsLoading] = useState(false),
		[isDragging, setIsDragging] = useState(false),
		[dragColumnSlot, setDragColumnSlot] = useState(null),
		[headerWidth, setHeaderWidth] = useState('100%'),
		[localColumnsConfig, setLocalColumnsConfigRaw] = useState([]),
		setLocalColumnsConfig = (config) => {
			setLocalColumnsConfigRaw(config);
			if (onChangeColumnsConfig) {
				onChangeColumnsConfig(config);
			}
		},
		onRowClick = (item, rowIndex, e) => {
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
		onSort = (cellData, e) => {
			if (!Repository) {
				return;
			}
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
			setIsSortDirectionAsc(isCurrentSortDirectionAsc);

			// Change sorter on OneHatData
			Repository.sort(currentSortField, isCurrentSortDirectionAsc ? SORT_ASCENDING : SORT_DESCENDING, sortFn);

			// clear the selection
			setSelection([]);
		},
		onHeaderMouseEnter = (e, ix) => {
			if (isDragging) {
				return;
			}
			localColumnsConfig[ix].showDragHandles = true;
			setLocalColumnsConfig(localColumnsConfig);
			forceUpdate();
		},
		onHeaderMouseLeave = (e, ix) => {
			if (isDragging) {
				return;
			}
			localColumnsConfig[ix].showDragHandles = false;
			setLocalColumnsConfig(localColumnsConfig);
			forceUpdate();
		},
		onColumnReorderDragStart = (info, e, proxy, node) => {
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
				left = columnHeaderRect.left,
				gridRowsContainer = gridRef.current._listRef._scrollRef.childNodes[0],
				gridRowsContainerRect = gridRowsContainer.getBoundingClientRect(),
				marker = document.createElement('div');

			marker.style.position = 'absolute';
			marker.style.height = gridRowsContainerRect.height + columnHeaderRect.height + 'px';
			marker.style.width = '4px';
			marker.style.top = columnHeaderRect.top + 'px';
			// marker.style.right = 0;
			marker.style.backgroundColor = '#ccc';

			document.body.appendChild(marker);
			marker.style.left = left + 'px';

			setDragColumnSlot({ ix: newIx, marker, });

		},
		onColumnReorderDrag = (info, e, proxy, node) => {
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
			if (marker) {
				marker.style.left = left + 'px';
			}

			setDragColumnSlot({ ix: newIx, marker, });
		},
		onColumnReorderDragStop = (delta, e, config) => {
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
						size: styles.GRID_TOOLBAR_ITEMS_ICON_SIZE,
						color: isDisabled ? styles.GRID_TOOLBAR_ITEMS_DISABLED_COLOR : styles.GRID_TOOLBAR_ITEMS_COLOR,
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
		renderHeaders = () => {
			const
				sorters = Repository && Repository.sorters,
				sorter = sorters && sorters.length === 1 ? sorters[0] : null,
				sortField = sorter && sorter.name,
				isSortDirectionAsc = sorter && sorter.direction === 'ASC';

			// These header Components should match the columns exactly
			// so we can drag/drop them to control the columns.
			const headerColumns = _.map(localColumnsConfig, (config, ix) => {
				let {
						columnId,
						fieldName,
						header = _.upperFirst(fieldName),
						reorderable,
						resizable,
						sortable,
						w,
						flex,
						showDragHandles,
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
				} else if (localColumnsConfig.length === 1) {
					// Only one column and flex is not set
					propsToPass.flex = 1;
					if (!header) {
					}
				}

				return <Pressable
							key={ix}
							onPress={(e) => {
								if (isBlocked.current) {
									return;
								}
								if (canColumnsSort) {
									onSort(config, e);
								}
							}}
							flexDirection="row"
							h="100%"
							bg={styles.GRID_HEADER_BG}
							_hover={{
								bg: styles.GRID_HEADER_HOVER_BG,
							}}
							p={0}
							style={{ userSelect: 'none', }}
							onMouseEnter={(e) => onHeaderMouseEnter(e, ix)}
							onMouseLeave={(e) => onHeaderMouseLeave(e, ix)}
							{...propsToPass}
						>
							{isReorderable && showDragHandles && <HeaderReorderHandle
													key="HeaderReorderHandle"
													mode={HORIZONTAL}
													onDragStart={onColumnReorderDragStart}
													onDrag={onColumnReorderDrag}
													onDragStop={(delta, e) => onColumnReorderDragStop(delta, e, config)}
													onChangeIsDragging={setIsDragging}
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
							
							<Text
								key="Text"
								fontSize={styles.GRID_HEADER_FONTSIZE}
								overflow="hidden"
								textOverflow="ellipsis"
								flex={1}
								h="100%"
								px={2}
								py={2}
								alignItems="center"
								justifyContent="center"
								numberOfLines={1}
								ellipsizeMode="head"
							>{header}</Text>
							
							{isSorter && <Icon key="Icon" as={isSortDirectionAsc ? SortDown : SortUp} textAlign="center" size="sm" mt={3} mr={2} color="trueGray.500" />}
							
							{isResizable && showDragHandles && <HeaderResizeHandle
												key="HeaderResizeHandle"
												mode={HORIZONTAL}
												onDragStop={(delta, e, node) => onColumnResize(delta, e, node, config)}
												onChangeIsDragging={setIsDragging}
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
		renderColumns = (item) => {
			if (_.isArray(localColumnsConfig)) {
				return _.map(localColumnsConfig, (config, key) => {
					let value;
					if (_.isPlainObject(config)) {
						if (config.renderer) {
							return config.renderer(item, key);
						}
						if (config.fieldName) {
							if (item.properties && item.properties[config.fieldName]) {
								const property = item.properties[config.fieldName];	
								value = property.displayValue;
							} else if (item[config.fieldName]) {
								value = item[config.fieldName];
							} else if (fields) {
								const ix = fields.indexOf(config.fieldName);
								value = item[ix];
							}
						}
					}
					if (_.isString(config)) {
						if (fields) {
							const ix = fields.indexOf(config);
							value = item[ix];
						} else {
							value = item[config];
						}
					}
					if (_.isFunction(config)) {
						value = config(item);
					}
					if (_.isFunction(value)) {
						return value(key);
					}

					const propsToPass = columnProps[key] || {};
					if (config.w) {
						propsToPass.w = config.w;
					} else if (config.flex) {
						propsToPass.flex = config.flex;
						propsToPass.minWidth = 100;
					} else {
						propsToPass.flex = 1;
					}
					
					return <Text
								key={key}
								overflow="hidden"
								textOverflow="ellipsis"
								alignSelf="center"
								style={{ userSelect: 'none', }}
								fontSize={styles.GRID_CELL_FONTSIZE}
								numberOfLines={1}
								ellipsizeMode="head"
								{...propsToPass}
							>{value}</Text>;
				});
			} else {
				// TODO: if 'localColumnsConfig' is an object, parse its contents
				throw new Error('Non-array localColumnsConfig not yet supported');
			}
		},
		renderRow = (row) => {
			const 
				{
					item,
					index,
				 } = row,
				rowProps = getRowProps ? getRowProps(item) : {},
				isSelected = isInSelection(item),
				isPhantom = item.isPhantom;
			return <Pressable
						// {...testProps(Repository ? Repository.schema.name + '-' + item.id : item.id)}
						onPress={(e) => {
							switch (e.detail) {
								case 1: // single click
									onRowClick(item, index, e); // sets selection
									if (onEditorRowClick) {
										onEditorRowClick(item, index, e);
									}
									break;
								case 2: // double click
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
							// context menu
							const selection = [item];
							setSelection(selection);
							if (onEditorRowClick) { // e.g. inline editor
								onEditorRowClick(item, index, e);
							}
							if (onContextMenu) {
								onContextMenu(item, index, e, selection, setSelection);
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
							
							/* <div
								onClick={(e) => {
									// debugger;
									e.preventDefault();
									if (onEditorRowClick) {
										onEditorRowClick(item, index, e);
									}
									if (e.detail === 1) {
										// onRowClick(item, index, e);
									} else if (onEdit && e.detail === 2) {
										// double-click
										setSelection([item]);
										onEdit(); // TODO: ERROR: has closure of OLD selection, not this new one. Doesn't matter if you delay it with setTimeout. How can we capture new selection?
									}
								}}
								onContextMenu={(e) => {
									e.preventDefault();
									if (onEditorRowClick) {
										onEditorRowClick(item, index, e);
									}
									if (onContextMenu) {
										onContextMenu(item, index, e, selection, setSelection);
									}
								}}
								style={{
									display: 'flex',
									flex: 1,
									width: '100%',
								}}
							></div> */

							let bg = styles.GRID_ROW_BG;
							if (isSelected) {
								if (showHovers && isHovered) {
									bg = styles.GRID_ROW_SELECTED_HOVER_BG;
								} else {
									bg = styles.GRID_ROW_SELECTED_BG;
								}
							} else {
								if (showHovers && isHovered) {
									bg = styles.GRID_ROW_HOVER_BG;
								} else {
									bg = styles.GRID_ROW_BG;
								}
							}
							return <Row
										alignItems="center"
										flexGrow={1}
										{...rowProps}
										bg={bg}
									>
										{isPhantom && <Box position="absolute" bg="#f00" h={2} w={2} t={0} l={0} />}
										
										{renderColumns(item)}

										{!hideNavColumn && <AngleRight
																color={styles.GRID_NAV_COLUMN_COLOR}
																variant="ghost"
																w={30}
																alignSelf="center"
																ml={3}
															/>}
									</Row>;
						}}
					</Pressable>;
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
			}
			return localColumnsConfig;
		};

		if (!Repository) {
			setLocalColumnsConfig(calculateLocalColumnsConfig());
			setIsReady(true);
			return () => {};
		}

		// set up @onehat/data repository
		const
			setTrue = () => setIsLoading(true),
			setFalse = () => setIsLoading(false),
			resetSelection = () => {
				setSelection([]);
			},
			onChangeFilters = () => {
				if (!Repository.isAutoLoad && Repository.isLoaded) {
					Repository.reload();
				}
			},
			onChangeSorters = () => {
				if (!Repository.isAutoLoad && Repository.isLoaded) {
					Repository.reload();
				}
			};

		Repository.on('beforeLoad', setTrue);
		Repository.on('load', setFalse);
		Repository.ons(['changePage', 'changePageSize',], resetSelection);
		Repository.ons(['changeData', 'change'], forceUpdate);
		Repository.on('changeFilters', onChangeFilters);
		Repository.on('changeSorters', onChangeSorters);

		setLocalColumnsConfig(calculateLocalColumnsConfig());
		setIsReady(true);

		return () => {
			Repository.off('beforeLoad', setTrue);
			Repository.off('load', setFalse);
			Repository.offs(['changePage', 'changePageSize',], resetSelection);
			Repository.offs(['changeData', 'change'], forceUpdate);
			Repository.off('changeFilters', onChangeFilters);
			Repository.off('changeSorters', onChangeSorters);
		};
	}, []);

	useEffect(() => {
		if (!Repository) {
			return () => {};
		}
		
		if (!disableSelectorSelected) {
			let matches = selectorSelected?.[0]?.id;
			if (_.isEmpty(selectorSelected)) {
				matches = noSelectorMeansNoResults ? 'NO_MATCHES' : null;
			}
			Repository.filter(selectorId, matches, false); // so it doesn't clear existing filters
		}

		if ((Repository.isRemote && !Repository.isAutoLoad && !Repository.isLoading) ||
			(!Repository.isLoaded && loadAfterRender)) {
			Repository.load();
		}

	}, [selectorId, selectorSelected]);

	useEffect(() => {
		if (!showHeaders) {
			return () => {};
		}

		// Need to assign DOM scroll event handlers onto the grid, so scrolling the rows
		// will also scroll the header
		if (gridRef && gridRef.current && headerRef && headerRef.current) {
			const scroller = gridRef.current._listRef._scrollRef.childNodes[0];
			scroller.addEventListener('scroll', (e) => {
				const scrollLeft = e.target.scrollLeft;
				headerRef.current.scrollLeft = scrollLeft;
				if (inlineEditorRef && inlineEditorRef.current) {
					// Any time the rows scroll, the inline editor scrolls too
					// Don't know precise path to node to scroll
					debugger;
					inlineEditorRef.current.scrollLeft = scrollLeft;
				}
			});
			if (inlineEditorRef && inlineEditorRef.current) {
				inlineEditorRef.current.addEventListener('scroll', (e) => {
					// This is where we assign a scroll event handler
					// so that every time the inline editor scrolls, the row and header also scroll
					// I just don't know if the ref will work at this time in the render cycle.

					debugger;
				});
			}
		}
	}, [isRendered]);


	if (!isReady) {
		return null;
	}

	// headers & footers
	let listHeaderComponent = null,
		listFooterComponent = null;
	if (showHeaders) {
		listHeaderComponent = <Row
									w="100%"
									// h="36px"
									bg="trueGray.200"
									overflow="scroll"
									ref={headerRef}
									onScroll={(e) => {
										const scrollLeft = e.target.scrollLeft;
										gridRef.current._listRef._scrollRef.childNodes[0].scrollLeft = scrollLeft;
										if (inlineEditorRef && inlineEditorRef.current) {
											// Any time the header scrolls, the inline editor scrolls too
											// don't know the precise path to node to scroll
											debugger;


											// inlineEditorRef.current._listRef._scrollRef.childNodes[0].scrollLeft = scrollLeft;
										}
									}}
									style={{
										scrollbarWidth: 'none',
									}}
									onLayout={(e) => {
										const width = e.nativeEvent.layout.width;
										setHeaderWidth(width + 'px');
									}}
								> 
										{renderHeaders()}
								</Row>;
	}
	const footerToolbarItemComponents = getFooterToolbarItems();
	if (Repository && bottomToolbar === 'pagination' && !disablePagination && Repository.isPaginated) {
		listFooterComponent = <PaginationToolbar Repository={Repository} toolbarItems={footerToolbarItemComponents} />;
	} else if (footerToolbarItemComponents.length) {
		listFooterComponent = <Toolbar>{footerToolbarItemComponents}</Toolbar>;
	}

	// Actual data to show in the grid
	const entities = Repository ? (Repository.isRemote ? Repository.entities : Repository.getEntitiesOnPage()) : data;
	let initialNumToRender = 10;
	if (entities && entities.length) {
		initialNumToRender = entities.length;
	} else if (data && data.length) {
		initialNumToRender = data.length;
	}
	
	return <Column
				{...testProps('Grid')}
				flex={1}
				w="100%"
				onLayout = {() => setIsRendered(true)}
			>
				{topToolbar}

				{listHeaderComponent}

				<Column w="100%" flex={1} borderTopWidth={isLoading ? 2 : 1} borderTopColor={isLoading ? '#f00' : 'trueGray.300'} onClick={() => setSelection([])}>
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
					/>
				</Column>

				{listFooterComponent}

			</Column>;

}

export const WindowedGridEditor = withAlert(
									withEvents(
										withData(
											withMultiSelection(
												withSelection(
													withWindowedEditor(
														withPresetButtons(
															withContextMenu(
																withFilters(
																	Grid
																)
															)
														)
													)
												)
											)
										)
									)
								);

export const InlineGridEditor = withAlert(
									withEvents(
										withData(
											withMultiSelection(
												withSelection(
													withInlineEditor(
														withPresetButtons(
															withContextMenu(
																withFilters(
																	Grid
																)
															)
														)
													)
												)
											)
										)
									)
								);

export default WindowedGridEditor;
