import React, { useState, useEffect, useRef, } from 'react';
import {
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
			// Needs one of the following:
			Repository, // @onehat/data Repository
			model, // @onehat/data bound schema name
			data, // raw data array

			// For raw data array
			fields,
			idField,
			displayField,


			columnsConfig = [], // json configurations for each column in format:

			columnProps = {},
			getRowProps = () => {
				return {
					borderBottomWidth: 1,
					borderBottomColor: 'trueGray.500',
					py: 1,
					pl: 4,
					pr: 2,
				};
			},

			selection, // from withSelection() HOC, which is an array of selected entities
			setSelection, // from withSelection() HOC, which sets the array of selected entities
			selectionMode,
			noSelectorMeansNoResults = false,
			// enableEditors = false,
			flatListProps = {},
			pullToRefresh = true,
			hideNavColumn = true,
			noneFoundText,
			disableLoadingIndicator = false,
			disableReloadOnChangeFilters = false,

			showRowExpander = false,
			rowExpanderTpl = '',
			
			topToolbar,
			bottomToolbar = 'pagination',
			additionalToolbarButtons = [],
			showHeaders = true,
			showHovers = true,
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
		{ isBlocked } = useBlocking(),
		headerRef = useRef(),
		gridRef = useRef(),
		sortFn = Repository && Repository.getSortFn(),
		sortField = Repository && Repository.getSortField(),
		[isSortDirectionAsc, setIsSortDirectionAsc] = useState(Repository && Repository.getSortDirection() === SORT_ASCENDING),
		[isReady, setIsReady] = useState(false),
		[isRendered, setIsRendered] = useState(false),
		[isLoading, setIsLoading] = useState(false),
		[dragColumnSlot, setDragColumnSlot] = useState(null),
		[headerWidth, setHeaderWidth] = useState('100%'),
		[LocalRepository, setLocalRepository] = useState(),
		[localColumnsConfig, setLocalColumnsConfig] = useState([]),
	
		isInSelection = (item) => {
			if (oneHatData.isEntity(item)) {
				return inArray(item, selection);
			}
			// Have to compare by contents, since array items aren't getting stored by reference!
			const
				ix = fields.indexOf(idField),
				found = _.find(selection, (selectedItem) => {
					return selectedItem[ix] === item[ix];
				});
			return !!found;
		},
		onRowClick = (item, index, e) => {
			const
				currentSelectionLength = selection.length,
				shiftKey = e.shiftKey;
			let newSelection = [];
			if (selectionMode === SELECTION_MODE_MULTI) {
				if (shiftKey) {
					if (isInSelection(item)) {
						// Remove from current selection
						if (oneHatData.isEntity(item)) {
							newSelection = _.remove(selection, (sel) => sel !== item);
						} else {
							const ix = fields.indexOf(idField);
							newSelection = _.remove(selection, (sel) => sel[ix] !== item[ix]);
						}
					} else {
						// Add to current selection
						newSelection = _.clone(selection); // so we get a new object, so component rerenders

						if (currentSelectionLength) {
							// Add a range of items, as the user shift-clicked a row when another was already selected
							let items,
								currentlySelectedRowIndices = [];
							if (LocalRepository) {
								items = LocalRepository.getEntitiesOnPage();
							} else {
								items = data;
							}
							_.each(items, (item, ix) => {
								if (isInSelection(item)) {
									currentlySelectedRowIndices.push(ix);
								}
							});
							const
								max = Math.max(...currentlySelectedRowIndices),
								min = Math.min(...currentlySelectedRowIndices);
							let i,
								itemAtIx;
							if (max < index) {
								// all other selections are below the current;
								// Range is from max+1 up to index
								for (i = max +1; i < index; i++) {
									itemAtIx = items[i];
									newSelection.push(itemAtIx);
								}

							} else if (min > index) {
								// all other selections are above the current;
								// Range is from min-1 down to index
								for (i = min -1; i > index; i--) {
									itemAtIx = items[i];
									newSelection.push(itemAtIx);
								}
							}
						}
						newSelection.push(item);
					}
				} else {
					if (isInSelection(item)) {
						// Already selected
						if (allowToggleSelection) {
							// Remove from current selection
							if (oneHatData.isEntity(item)) {
								newSelection = _.remove(selection, (sel) => sel !== item);
							} else {
								const ix = fields.indexOf(idField);
								newSelection = _.remove(selection, (sel) => sel[ix] !== item[ix]);
							}
						} else {
							// Do nothing.
							newSelection = selection;
						}
					} else {
						// Just select it alone
						newSelection = [item];
					}
				}
			} else {
				// selectionMode is SELECTION_MODE_SINGLE
				if (isInSelection(item)) {
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
					newSelection = [item];
				}
			}

			setSelection(newSelection);
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
			setSortField(currentSortField);
			setIsSortDirectionAsc(isCurrentSortDirectionAsc);

			// Change sorter on OneHatData
			Repository.sort(currentSortField, isCurrentSortDirectionAsc ? SORT_ASCENDING : SORT_DESCENDING, sortFn);

			// clear the selection
			setSelection([]);
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
		calculateLocalColumnsConfig = () => {
			// convert json config into actual elements
			const localColumnsConfig = [];
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
		renderHeaders = () => {
			const
				sorters = Repository && Repository.sorters,
				sorter = sorters && sorters.length === 1 ? sorters[0] : null,
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
								if (isBlocked.current) {
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
								bg: '#ddd',
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
					} else {
						propsToPass.flex = 1;
					}
					
					return <Text style={{ userSelect: 'none', }} {...propsToPass}>{value}</Text>;
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
				hoverProps = {};
			if (showHovers) {
				hoverProps._hover = { bg: isSelected ? 'selectedHover' : 'hover', };
			}
			return <Pressable
						// {...testProps(Repository ? Repository.schema.name + '-' + item.id : item.id)}
						onPress={(e) => onRowClick(item, index, e)}
						onLongPress={(e) => onRowClick(item, index, e)}
						bg={isSelected ? 'selected' : '#fff'}
						w="100%"
						{...hoverProps}
					>
						<div
							onClick={(e) => {
								if (onEdit && e.detail === 2) {
									// double-click
									onEdit(item, index, e);
								}
							}}
							onContextMenu={(e) => {
								e.preventDefault();
								if (onContextMenu) {
									onContextMenu(item, index, e, selection, setSelection);
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
								flexGrow={1}
								// bg={isSelected ? 'selected' : '#fff'}
								{...rowProps}
							>
								{renderColumns(item)}
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
		};
		
	useEffect(() => {

		let LocalRepository = Repository;
		if (model) {
			LocalRepository = oneHatData.getRepository(model);
		}

		setLocalColumnsConfig(calculateLocalColumnsConfig());

		if (!LocalRepository) {
			// set up plain data
			if (_.isEmpty(selection) && autoSelectFirstItem) {
				const selected = data[0] ? [data[0]] : [];
				setSelection(selected);
			}
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
				if (!LocalRepository.autoLoad && LocalRepository.isLoaded && !disableReloadOnChangeFilters) {
					LocalRepository.reload();
				}
			};

		LocalRepository.on('beforeLoad', setTrue);
		LocalRepository.on('load', setFalse);
		LocalRepository.ons(['changePage', 'changePageSize',], resetSelection);
		LocalRepository.ons(['changeData', 'change'], forceUpdate);
		LocalRepository.on('changeFilters', onChangeFilters);
		if (_.isEmpty(selection) && autoSelectFirstItem) {
			const
				entitiesOnPage = LocalRepository.getEntitiesOnPage(),
				selected = entitiesOnPage[0] ? [entitiesOnPage[0]] : [];
			setSelection(selected);
		}
		setLocalRepository(LocalRepository);
		setIsReady(true);

		return () => {
			LocalRepository.off('beforeLoad', setTrue);
			LocalRepository.off('load', setFalse);
			LocalRepository.offs(['changePage', 'changePageSize',], resetSelection);
			LocalRepository.offs(['changeData', 'change'], forceUpdate);
			LocalRepository.off('changeFilters', onChangeFilters);
		};
	}, []);

	useEffect(() => {
		if (!showHeaders) {
			return () => {};
		}

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
	
	let listHeaderComponent = null,
		listFooterComponent = null;
	if (showHeaders) {
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
									{renderHeaders()}
							</Row>;
	}

	const toolbarItemComponents = getToolbarItems();
	if (Repository && bottomToolbar === 'pagination' && !disablePaging) {
		listFooterComponent = <PaginationToolbar Repository={Repository} toolbarItems={toolbarItemComponents} />;
	} else if (toolbarItemComponents.length) {
		listFooterComponent = <Toolbar>{toolbarItemComponents}</Toolbar>;
	}

	const entities = LocalRepository ? LocalRepository.getEntitiesOnPage() : data;
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
				{topToolbar && <Toolbar>{topToolbar}</Toolbar>}

				{listHeaderComponent}

				{isLoading && <Column flex={1}><Loading /></Column>}
				{!isLoading && 
					
					<Column w="100%" flex={1}>
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
									const ix = fields.indexOf('id');
									id = item[ix];
								}
								return String(id);
							}}
							// getItemLayout={(data, index) => ( // an optional optimization that allows skipping the measurement of dynamic content if you know the size (height or width) of items ahead of time. getItemLayout is efficient if you have fixed size items
							// 	{length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index}
							// )}
							// numColumns={1}
							initialNumToRender={initialNumToRender}
							initialScrollIndex={initialScrollIndex}
							renderItem={renderRow}
							bg="trueGray.100"
							{...flatListProps}
						/>
					</Column>
					
				}

			{listFooterComponent}

			</Column>;

}
