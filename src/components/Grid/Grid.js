import React, { useState, useEffect, useRef, } from 'react';
import {
	Column,
	FlatList,
	Icon,
	Modal,
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
import getComponentFromType from '../../Functions/getComponentFromType';
import useBlocking from '../../Hooks/useBlocking';
import useForceUpdate from '../../Hooks/useForceUpdate';
import withData from '../Hoc/withData';
import withSelection from '../Hoc/withSelection';
import withMultiSelection from '../Hoc/withMultiSelection';
import inArray from '../../Functions/inArray';
import testProps from '../../Functions/testProps';
import FormPanel from '../Panel/FormPanel';
import HeaderDragHandle from './HeaderDragHandle';
import HeaderResizeHandle from './HeaderResizeHandle';
import IconButton from '../Buttons/IconButton';
import Loading from '../Messages/Loading';
import PaginationToolbar from '../Toolbar/PaginationToolbar';
import NoRecordsFound from './NoRecordsFound';
import Toolbar from '../Toolbar/Toolbar';
import AngleRight from '../Icons/AngleRight';
import Gear from '../Icons/Gear';
import SortDown from '../Icons/SortDown';
import SortUp from '../Icons/SortUp';
import _ from 'lodash';

// Grid requires the use of HOC withSelection() whenever it's used.
// The default export is *with* the HOC. A separate *raw* component is
// exported which can be combined with many HOCs for various functionality.

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
		// ARIA navigation (activeRow state, which can switch with key nav)
		// ARIA enter/esc to select/deselect
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
	// Filters
		// Set them
		// Button to select others
		// Some way to show all possibilities in modal (equivalent of ModelFilters in old system)
		// way to swap filters and have it affect Repository
	// custom cell types
		// Most would use text, and depend on @onehat/data for formatting
	// editor
		// √ double-click to enter edit mode (NativeBase doesn't have a double-click hander--can it be added manually to DOM?). Currently using longPress
		// Show inline editor for selected row
		// windowed editor for selected row
			// form panel for multiple editing of selected rows
	// Display tree data

export function Grid(props) {
	const {

			columnsConfig = [], // json configurations for each column

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
			flatListProps = {},
			// enableEditors = false,
			pullToRefresh = true,
			hideNavColumn = true,
			noneFoundText,
			disableLoadingIndicator = false,
			disableReloadOnChangeFilters = false,
			showRowExpander = false,
			rowExpanderTpl = '',
			showHeaders = true,
			showHovers = true,
			showFilters = false,
			canColumnsSort = true,
			canColumnsReorder = true,
			canColumnsResize = true,
			allowToggleSelection = true, // i.e. single click with no shift key toggles the selection of the item clicked on
			disablePaging = false,
			bottomToolbar = 'pagination',
			additionalToolbarButtons = [],

			// editor
			onAdd,
			onEdit,
			onRemove,
			onView,
			onDuplicate,
			onReset,
			onContextMenu,

			// data source
			Repository,
			data,
			fields,
			idField,
			displayField,
			idIx,
			displayIx,

			// selection
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

			// filters
			filter1StartingField = '',
			filter2StartingField = '',
			filter3StartingField = '',
			filter4StartingField = '',
			filter5StartingField = '',
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
		[isFilterSelectorShown, setIsFilterSelectorShown] = useState(false),
		[dragColumnSlot, setDragColumnSlot] = useState(null),
		[headerWidth, setHeaderWidth] = useState('100%'),
		[localColumnsConfig, setLocalColumnsConfig] = useState([]),
		[filter1Field, setFilter1Field] = useState(filter1StartingField || Repository?.getSchema().model.defaultFilters?.[0]),
		[filter2Field, setFilter2Field] = useState(filter2StartingField || Repository?.getSchema().model.defaultFilters?.[1]),
		[filter3Field, setFilter3Field] = useState(filter3StartingField || Repository?.getSchema().model.defaultFilters?.[2]),
		[filter4Field, setFilter4Field] = useState(filter4StartingField || Repository?.getSchema().model.defaultFilters?.[3]),
		[filter5Field, setFilter5Field] = useState(filter5StartingField || Repository?.getSchema().model.defaultFilters?.[4]),
		[filter1FieldForSelector, setFilter1FieldForSelector] = useState(filter1Field),
		[filter2FieldForSelector, setFilter2FieldForSelector] = useState(filter2Field),
		[filter3FieldForSelector, setFilter3FieldForSelector] = useState(filter3Field),
		[filter4FieldForSelector, setFilter4FieldForSelector] = useState(filter4Field),
		[filter5FieldForSelector, setFilter5FieldForSelector] = useState(filter5Field),
		
		onRowClick = (item, index, e) => {
			const
				shiftKey = e.shiftKey,
				metaKey = e.metaKey;
				
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
				marker.styles.position = 'absolute';
				marker.styles.height = gridRowsContainerRect.height + columnHeaderRect.height + 'px';
				marker.styles.width = '4px';
				marker.styles.top = columnHeaderRect.top + 'px';
				// marker.styles.right = 0;
				marker.styles.backgroundColor = '#ccc';

				document.body.appendChild(marker);
			}
			marker.styles.left = left + 'px';

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
		getFilterField = (ix) => {
			let value;
			switch(ix) {
				case 0:
					value = filter1Field;
					break;
				case 1:
					value = filter2Field;
					break;
				case 2:
					value = filter3Field;
					break;
				case 3:
					value = filter4Field;
					break;
				case 4:
					value = filter5Field;
					break;
				default:
			}
			return value;
		},
		renderFilters = () => {
			if (!Repository) {
				return null;
			}

			const
				{
					titles,
					defaultFilters,
					filterTypes,
					virtualFields,
					excludeFields,
				} = Repository.getSchema().model,
				filterProps = {
					mx: 1,
				},
				filterElements = [];
			_.each(defaultFilters, (fieldName, ix) => {
				if (inArray(fieldName, virtualFields) || inArray(fieldName, excludeFields)) {
					return; // skip
				}
				const
					filterType = filterTypes[fieldName];
				let Element,
					modelProps = {};
				if (_.isString(filterType)) {
					Element = getComponentFromType(filterType);
				} else if (_.isPlainObject(filterType)) {
					const {
							type,
							...p
						} = filterType;
					modelProps = p;
					Element = getComponentFromType(type);
				}
				filterElements.push(<Element
										key={ix}
										tooltip={titles[fieldName]}
										placeholder={titles[fieldName]}
										value={getFilterField(ix)}
										onChangeValue={(value) => onFilterChange(fieldName, value)}
										{...filterProps}
										{...modelProps}
									/>);
			});
			filterElements.push(<IconButton
									key="gear"
									_icon={{
										as: Gear,
									}}
									ml={1}
									onPress={() => setIsFilterSelectorShown(true)}
								/>)

			return filterElements;
		},
		onFilterChange = (fieldName, value) => {
			// debugger;
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
													
													proxy.styles.top = columnHeaderRect.top + 10 + 'px';
													proxy.styles.left = columnHeaderRect.left + 'px';
													proxy.styles.height = columnHeaderRect.height + 'px';
													proxy.styles.width = columnHeaderRect.width + 'px';
													proxy.styles.display = 'flex';
													proxy.styles.backgroundColor = '#ddd';
													return proxy;
												}}
											/>}
							
							<Text
								key="Text"
								fontSize={styles.GRID_HEADER_FONTSIZE}
								borderBottomWidth={1}
								borderBottomColor="trueGray.300"
								overflow="hidden"
								textOverflow="ellipsis"
								flex={1}
								h="100%"
								px={2}
								pt={2}
								alignItems="center"
								justifyContent="center"
							>{header}</Text>
							
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
													
													verticalLine.styles.position = 'absolute';
													verticalLine.styles.height = gridRowsContainerRect.height + columnHeaderRect.height + 'px';
													verticalLine.styles.width = '1px';
													verticalLine.styles.top = 0;
													verticalLine.styles.right = 0;
													verticalLine.styles.backgroundColor = '#ddd';
													proxy.appendChild(verticalLine);

													proxy.styles.top = nodeRect.top + 'px';
													proxy.styles.left = nodeRect.left + 'px';
													proxy.styles.height = nodeRect.height + 'px';
													proxy.styles.width = nodeRect.width + 'px';
													proxy.styles.display = 'flex';

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
				hoverProps = {};
			if (showHovers) {
				hoverProps._hover = { bg: isSelected ? 'selectedHover' : 'hover', };
			}
			return <Pressable
						// {...testProps(Repository ? Repository.schema.name + '-' + item.id : item.id)}
						onPress={(e) => onRowClick(item, index, e)}
						onLongPress={(e) => onRowClick(item, index, e)}
						bg={isSelected ? styles.GRID_ROW_SELECTED_BG : styles.GRID_ROW_BG}
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
									color={styles.GRID_NAV_COLUMN_COLOR}
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
		if (!Repository || disableSelectorSelected) {
			return () => {};
		}

		let matches = selectorSelected;
		if (_.isEmpty(selectorSelected)) {
			matches = noSelectorMeansNoResults ? 'NO_MATCHES' : null;
		}
		Repository.filter(selectorId, matches, false); // so it doesn't clear existing filters

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
				headerRef.current.scrollLeft = e.target.scrollLeft;
			});
		}
	}, [isRendered]);


	if (!isReady) {
		return null;
	}

	// Filters
	let topToolbar = null,
		filterComboProps = {};
	if (showFilters && Repository?.getSchema().model.titles) {
		filterComboProps.idField = 'id';
		filterComboProps.displayField = 'value';
		filterComboProps.fields = ['id', 'value'];
		filterComboProps.data = [];
		const schemaModel = Repository.getSchema().model;
		_.each(schemaModel.titles, (title, fieldName) => {
			if (!inArray(fieldName, schemaModel.virtualFields) && !inArray(fieldName, schemaModel.excludeFields)) {
				filterComboProps.data.push([fieldName, title]);
			}
		});
		topToolbar = <Toolbar>{renderFilters()}</Toolbar>
	}

	// headers & footers
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
	const footerToolbarItemComponents = getFooterToolbarItems();
	if (Repository && bottomToolbar === 'pagination' && !disablePaging && Repository.isPaginated) {
		listFooterComponent = <PaginationToolbar Repository={Repository} toolbarItems={footerToolbarItemComponents} />;
	} else if (footerToolbarItemComponents.length) {
		listFooterComponent = <Toolbar>{footerToolbarItemComponents}</Toolbar>;
	}

	// Actual data to show in the grid
	const entities = Repository ? Repository.getEntitiesOnPage() : data;
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
					
				}

				{listFooterComponent}

				<Modal
					animationType="fade"
					isOpen={isFilterSelectorShown}
					onClose={() => setIsFilterSelectorShown(false)}
				>

					<Column bg="#fff" w={500}>
						<FormPanel
							title="Filter Selector"
							instructions="Please select which fields to filter by. You may select up to five filters. Leave blank for no filter."
							flex={1}
							startingValues={{
								filter1: filter1Field,
								filter2: filter2Field,
								filter3: filter3Field,
								filter4: filter4Field,
								filter5: filter5Field,
							}}
							items={[
								{
									type: 'Column',
									flex: 1,
									items: [
										{
											type: 'Combo',
											label: 'Filter 1',
											name: 'filter1',
											onChangeValue: (value) => {
												setFilter1FieldForSelector(value);
											},
											...filterComboProps,
										},
										{
											type: 'Combo',
											label: 'Filter 2',
											name: 'filter2',
											onChangeValue: (value) => {
												setFilter2FieldForSelector(value);
											},
											...filterComboProps,
										},
										{
											type: 'Combo',
											label: 'Filter 3',
											name: 'filter3',
											onChangeValue: (value) => {
												setFilter3FieldForSelector(value);
											},
											...filterComboProps,
										},
										{
											type: 'Combo',
											label: 'Filter 4',
											name: 'filter4',
											onChangeValue: (value) => {
												setFilter4FieldForSelector(value);
											},
											...filterComboProps,
										},
										{
											type: 'Combo',
											label: 'Filter 5',
											name: 'filter5',
											onChangeValue: (value) => {
												setFilter5FieldForSelector(value);
											},
											...filterComboProps,
										},
									],
								}, // END Column
							]}
							onCancel={(e) => {
								setFilter1FieldForSelector(filter1Field);
								setFilter2FieldForSelector(filter2Field);
								setFilter3FieldForSelector(filter3Field);
								setFilter4FieldForSelector(filter4Field);
								setFilter5FieldForSelector(filter5Field);
								setIsFilterSelectorShown(false);
							}}
							onSave={(data, e) => {
								setFilter1Field(filter1FieldForSelector);
								setFilter2Field(filter2FieldForSelector);
								setFilter3Field(filter3FieldForSelector);
								setFilter4Field(filter4FieldForSelector);
								setFilter5Field(filter5FieldForSelector);
								setIsFilterSelectorShown(false);
							}}
						/>
					</Column>
				</Modal>
			</Column>;

}

export default withData(withMultiSelection(withSelection(Grid)));
