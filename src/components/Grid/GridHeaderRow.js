import { useState, useEffect, useMemo, } from 'react';
import {
	Icon,
	Pressable,
	Row,
	Text,
} from 'native-base';
import {
	SORT_ASCENDING,
	SORT_DESCENDING,
} from '../../Constants/Grid.js';
import {
	HORIZONTAL,
} from '../../Constants/Directions.js';
import {
	UI_MODE_WEB,
} from '../../Constants/UiModes.js';
import UiGlobals from '../../UiGlobals.js';
import useBlocking from '../../Hooks/useBlocking.js';
import AngleRight from '../Icons/AngleRight.js';
import HeaderReorderHandle from './HeaderReorderHandle.js';
import HeaderResizeHandle from './HeaderResizeHandle.js';
import SortDown from '../Icons/SortDown.js';
import SortUp from '../Icons/SortUp.js';
import _ from 'lodash';

// This was broken out from Grid simply so we can memoize it

export default function GridHeaderRow(props) {
	let {
			canColumnsReorder,
			canColumnsResize,
		} = props;
	const {
			Repository,
			columnsConfig,
			setColumnsConfig,
			hideNavColumn,
			canColumnsSort,
			setSelection,
			gridRef,
			isHovered,
			isInlineEditorShown,
		} = props,
		styles = UiGlobals.styles,
		sortFn = Repository && Repository.getSortFn(),
		sortField = Repository && Repository.getSortField(),
		{ isBlocked } = useBlocking(),
		[dragColumnSlot, setDragColumnSlot] = useState(null),
		[isDragging, setIsDragging] = useState(false),
		[isSortDirectionAsc, setIsSortDirectionAsc] = useState(Repository && Repository.getSortDirection() === SORT_ASCENDING),
		[localColumnsConfig, setLocalColumnsConfig] = useState(columnsConfig),
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
			if (setSelection) {
				setSelection([]);
			}
		},
		onHeaderMouseEnter = (e, ix) => {
			if (isDragging) {
				return;
			}
			const columnsConfig = _.clone(localColumnsConfig); // work with a copy, so that setter forces rerender
			columnsConfig[ix].showDragHandles = true;
			setLocalColumnsConfig(columnsConfig);
		},
		onHeaderMouseLeave = (e, ix) => {
			if (isDragging) {
				return;
			}
			const columnsConfig = _.clone(localColumnsConfig); // work with a copy, so that setter forces rerender
			columnsConfig[ix].showDragHandles = false;
			setLocalColumnsConfig(columnsConfig);
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

			// Stick the column at the new ix (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
			columnsConfig.splice(dragColumnSlot.ix, 0, config);

			setLocalColumnsConfig(columnsConfig);
			setColumnsConfig(columnsConfig);

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
			setColumnsConfig(columnsConfig);
		};

	useEffect(() => {
		// Make localColumnsConfig match what was supplied
		if (columnsConfig !== localColumnsConfig) {
			setLocalColumnsConfig(columnsConfig);
		}
	}, [columnsConfig]);
	
	if (UiGlobals.mode !== UI_MODE_WEB) {
		canColumnsReorder = false;
		canColumnsResize = false;
	}

	return useMemo(() => {
		const renderHeaders = () => {
				const
					sorters = Repository && Repository.sorters,
					sorter = sorters && sorters.length === 1 ? sorters[0] : null,
					sortField = sorter && sorter.name,
					isSortDirectionAsc = sorter && sorter.direction === 'ASC';

				// These header Components should match the columns exactly
				// so we can drag/drop them to control the columns.
				const headerColumns = _.map(localColumnsConfig, (config, ix, all) => {
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

					if (all.length === 1) {
						propsToPass.w = '100%';
						isReorderable = false;
						isResizable = false;
					} else {
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
					}

					if (isInlineEditorShown) {
						propsToPass.minWidth = styles.INLINE_EDITOR_MIN_WIDTH;
					}

					const textProps = {};
					if (UiGlobals.mode === UI_MODE_WEB) {
						textProps.textOverflow = 'ellipsis';
					}
					return <Pressable
								key={ix}
								onPress={(e) => {
									if (e.preventDefault) {
										e.preventDefault();
									}
									if (isBlocked.current) { // withDraggable initiates block
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
								{isReorderable && showDragHandles && 
										<HeaderReorderHandle
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
									flex={1}
									h="100%"
									px={styles.GRID_HEADER_CELL_PX}
									py={styles.GRID_HEADER_CELL_PY}
									alignItems="center"
									justifyContent="center"
									numberOfLines={1}
									ellipsizeMode="head"
									{...textProps}
								>{header}</Text>
								
								{isSorter && <Icon key="Icon" as={isSortDirectionAsc ? SortUp : SortDown} textAlign="center" size="sm" mt={3} mr={2} color="trueGray.500" />}
								
								{isResizable && showDragHandles && 
										<HeaderResizeHandle
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
			};

		return <Row
					w="100%"
					bg="trueGray.200"
					style={{
						scrollbarWidth: 'none',
					}}
				> 
					{renderHeaders()}
				</Row>;

	}, [
		Repository,
		localColumnsConfig,
		hideNavColumn,
		canColumnsSort,
		canColumnsReorder,
		canColumnsResize,
		isHovered,
		dragColumnSlot,
		isDragging,
		isSortDirectionAsc,
		sortFn,
		sortField,
		isInlineEditorShown,
	]);
}

