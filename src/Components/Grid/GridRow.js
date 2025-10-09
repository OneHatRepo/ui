import { useMemo, useState, useEffect, forwardRef, isValidElement, cloneElement, } from 'react';
import {
	Box,
	HStack,
	HStackNative,
	Icon,
	Text,
	TextNative,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import {
	UI_MODE_WEB,
	UI_MODE_NATIVE,
	CURRENT_MODE,
} from '../../Constants/UiModes.js';
import * as colourMixer from '@k-renwick/colour-mixer';
import getComponentFromType from '../../Functions/getComponentFromType.js';
import UiGlobals from '../../UiGlobals.js';
import { withDragSource, withDropTarget } from '../Hoc/withDnd.js';
import testProps from '../../Functions/testProps.js';
import Loading from '../Messages/Loading.js';
import AngleRight from '../Icons/AngleRight.js';
import RowHandle from './RowHandle.js';
import useAsyncRenderers from './useAsyncRenderers.js';
import _ from 'lodash';

// Conditional import for web only
let getEmptyImage = null;

// This was broken out from Grid simply so we can memoize it

const GridRow = forwardRef((props, ref) => {
	const {
			columnsConfig,
			columnProps,
			fields,
			rowProps,
			hideNavColumn,
			showRowHandle,
			rowCanSelect,
			rowCanDrag,
			isRowHoverable,
			isSelected,
			isHovered,
			bg,
			showHovers,
			index,
			alternatingInterval,
			alternateRowBackgrounds,
			item,
			isInlineEditorShown,
			isDraggable = false, // withDraggable
			isDragSource = false, // withDnd
			isOver = false, // drop target
			canDrop,
			draggedItem,
			validateDrop, // same as canDrop (for visual feedback)
			getDragProxy,
			dragSourceRef,
			dragPreviewRef,
			dropTargetRef,
			...propsToPass
		} = props,
		styles = UiGlobals.styles,
		{
			results: asyncResults,
			loading: asyncLoading,
		} = useAsyncRenderers(columnsConfig, item);

	if (item.isDestroyed) {
		return null;
	}
	
	// Hide the default drag preview only when using custom drag proxy (and only on web)
	useEffect(() => {
		if (dragPreviewRef && typeof dragPreviewRef === 'function' && getDragProxy && CURRENT_MODE === UI_MODE_WEB) {
			// Load getEmptyImage dynamically and apply it
			import('react-dnd-html5-backend').then((module) => {
				const getEmptyImage = module.getEmptyImage;
				if (getEmptyImage) {
					dragPreviewRef(getEmptyImage(), { captureDraggingState: true });
				}
			}).catch((error) => {
				console.warn('Failed to load react-dnd-html5-backend:', error);
			});
		}
	}, [dragPreviewRef, getDragProxy]);

	const
		isPhantom = item.isPhantom,
		hash = item?.hash || item;
	return useMemo(() => {

		let bg = rowProps.bg || props.bg || styles.GRID_ROW_BG,
			mixWith;

		// TODO: Finish Drop styling

		// Use custom validation for enhanced visual feedback, fallback to React DnD's canDrop
		let actualCanDrop = canDrop;
		if (isOver && draggedItem && validateDrop) {
			actualCanDrop = validateDrop(draggedItem);
		}

		if (isSelected) {
			if (showHovers && isHovered) {
				mixWith = styles.GRID_ROW_SELECTED_BG_HOVER;
			} else {
				mixWith = styles.GRID_ROW_SELECTED_BG;
			}
		} else if (isRowHoverable && showHovers && isHovered) {
			mixWith = styles.GRID_ROW_BG_HOVER;
		} else if (alternateRowBackgrounds && index % alternatingInterval === 0) { // i.e. every second line, or every third line
			mixWith = styles.GRID_ROW_ALTERNATE_BG;
		}
		if (mixWith) {
			// const
			// 	mixWithObj = gsToHex(mixWith),
			// 	ratio = mixWithObj.alpha ? 1 - mixWithObj.alpha : 0.5;
			// bg = colourMixer.blend(bg, ratio, mixWithObj.color);
			bg = colourMixer.blend(bg, 0.5, mixWith);
		}
		const
			visibleColumns = _.filter(columnsConfig, (config) => !config.isHidden),
			isOnlyOneVisibleColumn = visibleColumns.length === 1;

		const renderColumns = (item) => {
			if (_.isArray(columnsConfig)) {
				return _.map(columnsConfig, (config, key, all) => {
					if (config.isHidden) {
						// every element needs a key, so return an empty element with a key
						return <Box key={key} style={{ display: 'none' }} />;
					}
					const
						propsToPass = columnProps[key] || {},
						colStyle = {},
						whichCursor = showRowHandle ? 'cursor-text' : 'cursor-pointer'; // when using rowSelectHandle, indicate that the row text is selectable, otherwise indicate that the row itself is selectable
					let colClassName = clsx(
						'GridRow-column',
						'p-1',
						'justify-center',
						'border-r-black-100',
						'block',
						'overflow-auto',
						whichCursor,
						styles.GRID_ROW_MAX_HEIGHT_EXTRA,
					);
					if (isOnlyOneVisibleColumn) {
						colClassName = ' w-full';
					} else {
						if (config.w) {
							colStyle.width = config.w;
						} else if (config.flex) {
							colStyle.flex = config.flex;
							colClassName = ' min-w-[100px]';
						} else {
							colClassName = ' flex-1';
						}
					}

					if (isInlineEditorShown) {
						colClassName += ' ' + styles.INLINE_EDITOR_MIN_WIDTH;
					}

					let value;
					if (_.isFunction(config)) {
						const element = config(item, key);
						if (isValidElement(element)) {
							// ensure element has a key
							return element.key != null ? element : cloneElement(element, { key });
						}
						return <Box key={key}>{element}</Box>; // create a box (with key) to wrap non-elements
					}
					if (_.isPlainObject(config)) {
						if (config.renderer) {
							const
								asyncResult = asyncResults.get(key),
								isLoading = asyncLoading.has(key),
								extraProps = _.omit(config, [
									'header',
									'fieldName',
									'type',
									'isEditable',
									'editor',
									'format',
									'renderer',
									'isAsync',
									'isReorderable',
									'isResizable',
									'isSortable',
									'w',
									'flex',
									'isOver',
								]);

							if (!extraProps._web) {
								extraProps._web = {};
							}
							if (!extraProps._web.style) {
								extraProps._web.style = {};
							}
							extraProps._web.style = {
								// userSelect: 'none',
							};

							let content = null;
							let textClassName = clsx(
								'GridRow-TextNative',
								'self-center',
								'overflow-hidden',
								colClassName,
								styles.GRID_CELL_CLASSNAME,
								styles.GRID_ROW_MAX_HEIGHT_EXTRA,
							);
							if (config.className) {
								textClassName += ' ' + config.className;
							}
							const rendererProps = {
								...testProps('rendererCol-' + (config.fieldName || config.id || key)),
								className: textClassName,
								...propsToPass,
								...extraProps,
								style: colStyle,
							};
							if (config.isAsync) {
								// TODO: Figure out how to pass the rendererProps to the async renderer function
								throw Error('Not yet working correctly!');
								// Async renderer
								if (isLoading) {
									content = <Loading key={key} />;
								} else if (asyncResult) {
									if (asyncResult.error) {
										content = <Text key={key}>Render Error: {asyncResult.error.message || String(asyncResult.error)}</Text>;
									} else {
										content = asyncResult.result;
									}
								}
							} else {
								// Synchronous renderer
								try {
									const result = config.renderer(item, config.fieldName, rendererProps, key);
									if (result && typeof result.then === 'function') {
										content = <Text key={key}>Error: Async renderer not properly configured</Text>;
									} else {
										content = result;
									}
								} catch (error) {
									content = <Text key={key}>Render Error: {error}</Text>;
								}
							}
							
							
							
							// Ensure content has a key prop
							if (isValidElement(content)) {
								// ensure element has a key
								return content.key != null ? content : cloneElement(content, { key });
							}
							return <Box key={key}>{content}</Box>; // create a box (with key) to wrap non-elements
						}
						if (config.fieldName) {

							if (item?.properties && item.properties[config.fieldName]) {
								const
									property = item.properties[config.fieldName],
									type = property?.viewerType?.type;
								value = property.displayValue;

								if (type) {
									const Element = getComponentFromType(type);
									const elementProps = {};
									if (type.match(/(Tag|TagEditor|Json)$/)) {
										elementProps.isViewOnly = true; // TODO: this won't work for InlineGridEditor, bc that Grid can't use isViewOnly when actually editing
									}
									let cellProps = {};
									if (config.getCellProps) {
										_.assign(cellProps, config.getCellProps(item));
									}
									let elementClassName = clsx(
										'GridRow-Element',
										'self-center',
										'text-ellipsis',
										'px-2',
										'py-3',
										'block',
										'overflow-scroll',
										colClassName,
										styles.GRID_CELL_CLASSNAME,
										styles.GRID_ROW_MAX_HEIGHT_NORMAL,
									);
									if (config.className) {
										elementClassName += ' ' + config.className;
									}
									if (cellProps.className) {
										elementClassName += ' ' + cellProps.className;
									}
									if (type.match(/(Tag|TagEditor)$/)) {
										elementClassName += ' ' + styles.GRID_ROW_MAX_HEIGHT_EXTRA;
									}
									return <Element
												{...testProps('cell-' + config.fieldName)}
												value={value}
												key={key}
												overflow="hidden"
												style={{
													// userSelect: 'none',
													...colStyle,
												}}
												minimizeForRow={true}
												className={elementClassName}
												numberOfLines={1}
												ellipsizeMode="head"
												{...propsToPass}
												{...elementProps}
											/>;
								}
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
					if (_.isFunction(value)) {
						const result = value(key);
						// Ensure the result has a key prop
						if (isValidElement(result)) {
							// Only clone if the result doesn't already have a key
							return result.key != null ? result : cloneElement(result, { key });
						}
						return <Box key={key}>{result}</Box>;
					}
					const elementProps = {};
					if (config.getCellProps) {
						_.assign(elementProps, config.getCellProps(item));
					}
					let textClassName = clsx(
						'GridRow-TextNative',
						'self-center',
						'overflow-hidden',
						colClassName,
						styles.GRID_CELL_CLASSNAME,
						styles.GRID_ROW_MAX_HEIGHT_EXTRA,
					);
					if (config.className) {
						textClassName += ' ' + config.className;
					}
					return <TextNative
								{...testProps('cell-' + config.fieldName)}
								key={key}
								style={{
									// userSelect: 'none',
									...colStyle,
								}}
								numberOfLines={1}
								ellipsizeMode="head"
								className={textClassName}
								{...elementProps}
								{...propsToPass}
							>{value}</TextNative>;
				});
			} else {
				// TODO: if 'columnsConfig' is an object, parse its contents
				throw new Error('Non-array columnsConfig not yet supported');
			}
		};

		let rowContents = <>
							{showRowHandle &&
								<RowHandle
									ref={dragSourceRef}
									isDragSource={isDragSource}
									isDraggable={isDraggable}
									canSelect={rowCanSelect}
									canDrag={rowCanDrag}
								/>}
							
							{isPhantom && 
								<Box
									className={clsx(
										'GridRow-phantom',
										'absolute',
										'h-2',
										'w-2',
										'top-0',
										'left-0',
										'bg-[#f00]',
									)}
								/>}
							
							{renderColumns(item)}

							{!hideNavColumn &&
								<Icon
									as={AngleRight}
									variant="outline"
									className={clsx(
										'GridRow-Icon',
										'w-30',
										'self-center',
										'mx-3',
										styles.GRID_NAV_COLUMN_COLOR,
									)}
								/>}
						</>;
		if (dropTargetRef) {
			rowContents = <HStack
								ref={dropTargetRef}
								className={clsx(
									'GridRow-dropTargetRef',
									'w-full',
									'flex-1',
									'grow-1',
								)}
								style={{
									backgroundColor: bg,
								}}
							>{rowContents}</HStack>;
		}

		let rowClassName = clsx(
			'GridRow-HStackNative',
			'items-center',
		);
		if (isOnlyOneVisibleColumn) {
			rowClassName += ' w-full';
		}
		if (rowProps?.className) {
			rowClassName += ' ' + rowProps.className;
		}
		if (isOver) {
			rowClassName += ' border-4 border-[#0ff]';
		}
		return <HStackNative
					ref={ref}
					{...testProps('Row ' + (isSelected ? 'row-selected' : ''))}
					{...rowProps}
					key={hash}
					className={rowClassName}
					style={{
						backgroundColor: bg,
					}}
				>{rowContents}</HStackNative>;
	}, [
		columnsConfig,
		asyncResults,
		asyncLoading,
		columnProps,
		fields,
		rowProps,
		hideNavColumn,
		bg,
		item,
		isPhantom,
		hash, // this is an easy way to determine if the data has changed and the item needs to be rerendered
		isInlineEditorShown,
		isSelected,
		isHovered,
		isOver,
		index,
		canDrop,
		draggedItem,
		validateDrop,
		dragSourceRef,
		dragPreviewRef,
		dropTargetRef,
		showRowHandle,
		rowCanSelect,
		rowCanDrag,
	]);
});

// export default withDraggable(withDragSource(withDropTarget(GridRow)));
export default GridRow;

export const DragSourceGridRow = withDragSource(GridRow);
export const DropTargetGridRow = withDropTarget(GridRow);
export const DragSourceDropTargetGridRow = withDragSource(withDropTarget(GridRow));
