import { useMemo, } from 'react';
import {
	Box,
	HStack,
	HStackNative,
	Icon,
	TextNative,
} from '@project-components/Gluestack';
import {
	UI_MODE_WEB,
} from '../../Constants/UiModes.js';
import * as colourMixer from '@k-renwick/colour-mixer';
import getComponentFromType from '../../Functions/getComponentFromType.js';
import UiGlobals from '../../UiGlobals.js';
import { withDragSource, withDropTarget } from '../Hoc/withDnd.js';
import testProps from '../../Functions/testProps.js';
import AngleRight from '../Icons/AngleRight.js';
import RowDragHandle from './RowDragHandle.js';
import _ from 'lodash';

// This was broken out from Grid simply so we can memoize it

function GridRow(props) {
	const {
			columnsConfig,
			columnProps,
			fields,
			rowProps,
			hideNavColumn,
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
			dragSourceRef,
			dropTargetRef,
		} = props,
		styles = UiGlobals.styles;

	if (item.isDestroyed) {
		return null;
	}

	const
		isPhantom = item.isPhantom,
		hash = item?.hash || item;
	return useMemo(() => {

		let bg = props.bg || styles.GRID_ROW_BG,
			mixWith;
		if (isSelected) {
			if (showHovers && isHovered) {
				mixWith = styles.GRID_ROW_SELECTED_BG_HOVER;
			} else {
				mixWith = styles.GRID_ROW_SELECTED_BG;
			}
		} else if (showHovers && isHovered) {
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
						return null;
					}
					const propsToPass = columnProps[key] || {};
					const colStyle = {};
					let colClassName = `
						GridRow-column
						p-1
						justify-center
						border-r-black-100
						mr-1
					`;
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
						return config(item, key);
					}
					if (_.isPlainObject(config)) {
						if (config.renderer) {
							const extraProps = _.omit(config, [
								'header',
								'fieldName',
								'type',
								'isEditable',
								'editor',
								'format',
								'renderer',
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
								userSelect: 'none',
							};

							return <HStackNative
										key={key}
										{...testProps('rendererCol-' + key)}
										className={colClassName}
										{...propsToPass}
										{...extraProps}
										style={colStyle}
									>{config.renderer(item)}</HStackNative>;
						}
						if (config.fieldName) {

							if (item?.properties && item.properties[config.fieldName]) {
								const property = item.properties[config.fieldName];
								value = property.displayValue;
								const type = property?.viewerType?.type;

								if (type) {
									const Element = getComponentFromType(type);
									const elementProps = {};
									if (type.match(/(Tag|TagEditor|Json)$/)) {
										elementProps.isViewOnly = true; // TODO: this won't work for InlineGridEditor, bc that Grid can't use isViewOnly when actually editing
									}
									if (config.getCellProps) {
										_.assign(elementProps, config.getCellProps(item));
									}
									return <Element
												{...testProps('cell-' + config.fieldName)}
												value={value}
												key={key}
												overflow="hidden"
												style={{
													userSelect: 'none',
													...colStyle,
												}}
												minimizeForRow={true}
												className={`
													GridRow-Element
													self-center
													text-ellipsis
													${colClassName}
													${styles.GRID_CELL_FONTSIZE}
													${styles.GRID_CELL_PX}
													${styles.GRID_CELL_PY}
												`}
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
						return value(key);
					}
					const elementProps = {};
					if (config.getCellProps) {
						_.assign(elementProps, config.getCellProps(item));
					}
					return <TextNative
								{...testProps('cell-' + config.fieldName)}
								key={key}
								style={{
									userSelect: 'none',
									...colStyle,
								}}
								numberOfLines={1}
								ellipsizeMode="head"
								className={`
									GridRow-TextNative
									self-center
									overflow-hidden
									text-ellipsis
									${colClassName}
									${styles.GRID_CELL_FONTSIZE} 
									${styles.GRID_CELL_PX} 
									${styles.GRID_CELL_PY} 
								`}
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
							{(isDragSource || isDraggable) && <RowDragHandle />}
							{isPhantom && 
								<Box
									className={`
										GridRow-phantom
										absolute
										h-[2px]
										w-[2px]
										top-0
										left-0
										bg-[#f00]
									`}
								/>}
							
							{renderColumns(item)}

							{!hideNavColumn &&
								<Icon
									as={AngleRight}
									variant="outline"
									className={`
										GridRow-Icon
										w-30
										self-center
										mx-3
										${styles.GRID_NAV_COLUMN_COLOR}
									`}
								/>}
						</>;

		if (dragSourceRef) {
			rowContents = <HStack
								ref={dragSourceRef}
								className={`
									dragSourceRef
									w-full
									flex-1
									grow-1
								`}
								style={{
									backgroundColor: bg,
								}}
							>{rowContents}</HStack>;
		}
		if (dropTargetRef) {
			rowContents = <HStack
								ref={dropTargetRef}
								className={`
									dropTargetRef
									w-full
									flex-1
									grow-1
								`}
								style={{
									backgroundColor: bg,
								}}
							>{rowContents}</HStack>;
		}

		let rowClassName = `
			GridRow-HStackNative
			items-center
		`;
		if (isOnlyOneVisibleColumn) {
			rowClassName += ' w-full';
		}
		if (isOver) {
			rowClassName += ' border-4 border-[#0ff]';
		} else {
			rowClassName += ' border-b border-b-grey-100';
		}
		if (rowProps?.className) {
			rowClassName += ' ' + rowProps.className;
		}
		return <HStackNative
					{...testProps('row' + (isSelected ? '-selected' : ''))}
					{...rowProps}
					key={hash}
					className={rowClassName}
					style={{
						backgroundColor: bg,
					}}
				>{rowContents}</HStackNative>;
	}, [
		columnsConfig,
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
		index,
		dragSourceRef,
		dropTargetRef,
	]);
}

// export default withDraggable(withDragSource(withDropTarget(GridRow)));
export default GridRow;

export const DragSourceGridRow = withDragSource(GridRow);
export const DropTargetGridRow = withDropTarget(GridRow);
export const DragSourceDropTargetGridRow = withDragSource(withDropTarget(GridRow));
