import { useState, useEffect, useMemo, forwardRef, } from 'react';
import {
	Box,
	HStack,
	Icon,
	Pressable,
	TextNative,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import {
	SORT_ASCENDING,
	SORT_DESCENDING,
} from '../../Constants/Grid.js';
import {
	HORIZONTAL,
} from '../../Constants/Directions.js';
import {
	CURRENT_MODE,
	UI_MODE_WEB,
} from '../../Constants/UiModes.js';
import UiGlobals from '../../UiGlobals.js';
import useBlocking from '../../Hooks/useBlocking.js';
import testProps from '../../Functions/testProps.js';
import AngleRight from '../Icons/AngleRight.js';
import Arcs from '../Icons/Arcs.js';
import HeaderReorderHandle from './HeaderReorderHandle.js';
import HeaderResizeHandle from './HeaderResizeHandle.js';
import HeaderColumnSelectorHandle from './HeaderColumnSelectorHandle.js';
import SortDown from '../Icons/SortDown.js';
import SortUp from '../Icons/SortUp.js';
import _ from 'lodash';

export default forwardRef(function GridHeaderRow(props, ref) {
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
			areRowsDragSource,
			showColumnsSelector,
			showRowHandle,
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
			const columnsConfig = [...localColumnsConfig]; // work with a copy, so that setter forces rerender
			columnsConfig[ix].isOver = true;
			setLocalColumnsConfig(columnsConfig);
		},
		onHeaderMouseLeave = (e, ix) => {
			if (isDragging) {
				return;
			}
			const columnsConfig = [...localColumnsConfig]; // work with a copy, so that setter forces rerender
			columnsConfig[ix].isOver = false;
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
			if (typeof localColumnsConfig[newIx] === 'undefined' || !localColumnsConfig[newIx].isReorderable) {
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
			if (typeof localColumnsConfig[newIx] === 'undefined' || !localColumnsConfig[newIx].isReorderable) {
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
			const columnsConfig = [...localColumnsConfig]; // work with a copy, so that setter forces rerender

			 _.pull(columnsConfig, config);

			// Stick the column at the new ix (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
			columnsConfig.splice(dragColumnSlot.ix, 0, config);

			setLocalColumnsConfig(columnsConfig);
			setColumnsConfig(columnsConfig);

			if (dragColumnSlot) {
				dragColumnSlot.marker?.remove();
			}
			setDragColumnSlot(null);
		},
		onColumnResize = (delta, e, node, config) => {
			const columnsConfig = [...localColumnsConfig]; // work with a copy, so that setter forces rerender
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
	
	if (CURRENT_MODE !== UI_MODE_WEB) {
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
							fieldName,
							header = _.upperFirst(fieldName),
							isReorderable: configIsReorderable,
							isResizable: configIsResizable,
							isSortable,
							w,
							flex,
							isOver = false,
							isHidden = false,
						} = config,
						isSorter = isSortable && canColumnsSort && sortField === fieldName,
						isReorderable = canColumnsReorder && configIsReorderable,
						isResizable = canColumnsResize && configIsResizable,
						rowClassName = clsx(
							'border-r-2',
							'border-r-white',
						);
					if (isHidden) {
						return null;
					}

					const rowStyle = {};
					if (all.length === 1) {
						rowClassName += ' w-full';
						isReorderable = false;
						isResizable = false;
					} else {
						if (w) {
							rowStyle.width = w;
						} else if (flex) {
							rowStyle.flex = flex;
							rowClassName += ' min-w-[100px]';
						} else if (localColumnsConfig.length === 1) {
							// Only one column and flex is not set
							rowClassName += ' flex-1';
							if (!header) {
							}
						}
					}
					rowStyle.userSelect = 'none';

					if (isInlineEditorShown) {
						rowClassName = ' ' + styles.INLINE_EDITOR_MIN_WIDTH;
					}

					return <Pressable
								{...testProps('Header-' + fieldName)}
								key={ix}
								onPress={(e) => {
									if (e.preventDefault) {
										e.preventDefault();
									}
									if (isBlocked.current) { // withDraggable initiates block
										return;
									}
									if (isSortable && canColumnsSort) {
										onSort(config, e);
									}
								}}
								onMouseEnter={(e) => onHeaderMouseEnter(e, ix)}
								onMouseLeave={(e) => onHeaderMouseLeave(e, ix)}
								className={clsx(
									'GridHeaderRow-Pressable',
									'h-full',
									'flex-row',
									'p-0',
									'items-center',
									'justify-center',
									rowClassName,
									styles.GRID_HEADER_PRESSABLE_CLASSNAME,
								)}
								style={rowStyle}
							>
								{isReorderable && isOver && 
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
								<TextNative
									key="Text"
									numberOfLines={1}
									className={clsx(
										'GridHeaderRow-TextNative',
										'h-auto',
										'flex-1',
										'items-center',
										'justify-center',
										'leading-tight',
										'text-center',
										'overflow-hidden',
										'text-ellipsis',
										'px-2',
										'py-3',
										styles.GRID_HEADER_CLASSNAME,
									)}
								>{header}</TextNative>
								
								{isSorter && 
									<Icon
										key="Icon"
										as={isSortDirectionAsc ? SortUp : SortDown}
										size={styles.GRID_HEADER_ICON_SIZE}
										className={clsx(
											'GridHeaderRow-Icon',
											'text-center',
											'text-grey-500',
											styles.GRID_HEADER_ICON_CLASSNAME,
										)}
									/>}
								
								{isOver && CURRENT_MODE === UI_MODE_WEB && // only works for web for now 
										<HeaderColumnSelectorHandle
											key="HeaderColumnSelectorHandle"
											showColumnsSelector={showColumnsSelector}
										/>}
								
								{isResizable && isOver && 
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
				if (showRowHandle) {
					headerColumns.unshift(<Box
						key="RowHandleSpacer"
						className={clsx(
							'Spacer-RowHandle',
							'w-[40px]',
							'flex-none',
							styles.ROW_HANDLE_CLASSNAME,
						)}
					/>);
				}
				if (!hideNavColumn) {
					headerColumns.push(<Icon as={AngleRight} className={`AngleRight text-[#aaa] w-[30px] self-center ml-3`} />);
				}
				return headerColumns;
			};

		return <HStack
					ref={ref}
					style={{
						scrollbarWidth: 'none',
					}}
					className={clsx(
						'GridHeaderRow-HStack',
						'w-full',
						'h-[40px]',
						'bg-grey-200',
					)}
				> 
					{renderHeaders()}
				</HStack>;

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
		areRowsDragSource,
		showRowHandle,
	]);
});
