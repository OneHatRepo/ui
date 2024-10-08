import { useEffect, useMemo, useRef, } from 'react';
import {
	Box,
	Row,
	Text,
} from 'native-base';
import {
	UI_MODE_WEB,
} from '../../Constants/UiModes.js';
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
			bg,
			item,
			isInlineEditorShown,
			isDraggable = false, // withDraggable
			isDragSource = false, // withDnd
			isOver = false,
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
		const renderColumns = (item) => {
			if (_.isArray(columnsConfig)) {
				return _.map(columnsConfig, (config, key, all) => {
					if (config.isHidden) {
						return null;
					}
					const propsToPass = columnProps[key] || {};
					if (all.length === 1) {
						propsToPass.w = '100%';
					} else {
						if (config.w) {
							propsToPass.w = config.w;
						} else if (config.flex) {
							propsToPass.flex = config.flex;
							propsToPass.minWidth = 100;
						} else {
							propsToPass.flex = 1;
						}
					}
					propsToPass.p = 1;
					propsToPass.justifyContent = 'center';

					if (isInlineEditorShown) {
						propsToPass.minWidth = styles.INLINE_EDITOR_MIN_WIDTH;
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

							return <Row
										key={key}
										{...testProps('rendererCol-' + key)}
										{...propsToPass}
										{...extraProps}
									>{config.renderer(item)}</Row>;
						}
						if (config.fieldName) {
							if (item?.properties && item.properties[config.fieldName]) {
								const property = item.properties[config.fieldName];
								value = property.displayValue;
								const type = property?.viewerType?.type;

								if (type) {
									const Element = getComponentFromType(type);
									const elementProps = {};
									if (UiGlobals.mode === UI_MODE_WEB) {
										elementProps.textOverflow = 'ellipsis';
									}
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
												alignSelf="center"
												style={{
													userSelect: 'none',
												}}
												fontSize={styles.GRID_CELL_FONTSIZE}
												px={styles.GRID_CELL_PX}
												py={styles.GRID_CELL_PY}
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
					if (UiGlobals.mode === UI_MODE_WEB) {
						elementProps.textOverflow = 'ellipsis';
					}
					if (config.getCellProps) {
						_.assign(elementProps, config.getCellProps(item));
					}
					return <Text
								{...testProps('cell-' + config.fieldName)}
								key={key}
								overflow="hidden"
								alignSelf="center"
								style={{
									userSelect: 'none',
								}}
								fontSize={styles.GRID_CELL_FONTSIZE}
								px={styles.GRID_CELL_PX}
								py={styles.GRID_CELL_PY}
								numberOfLines={1}
								ellipsizeMode="head"
								{...elementProps}
								{...propsToPass}
							>{value}</Text>;
				});
			} else {
				// TODO: if 'columnsConfig' is an object, parse its contents
				throw new Error('Non-array columnsConfig not yet supported');
			}
		};
		if (isOver) {
			rowProps.borderWidth = 4;
			rowProps.borderColor = '#0ff';
		} else {
			rowProps.borderWidth = 0;
			rowProps.borderColor = null;
		}

		let rowContents = <>
							{(isDragSource || isDraggable) && <RowDragHandle />}
							{isPhantom && <Box position="absolute" bg="#f00" h={2} w={2} t={0} l={0} />}
							
							{renderColumns(item)}

							{!hideNavColumn && <AngleRight
													color={styles.GRID_NAV_COLUMN_COLOR}
													variant="ghost"
													w={30}
													alignSelf="center"
													mx={3}
												/>}
						</>;

		if (dragSourceRef) {
			rowContents = <Row flexGrow={1} flex={1} w="100%" bg={bg} ref={dragSourceRef}>{rowContents}</Row>;
		}
		if (dropTargetRef) {
			rowContents = <Row flexGrow={1} flex={1} w="100%" bg={bg} ref={dropTargetRef}>{rowContents}</Row>;
		}

		return <Row
					{...testProps('row' + (isSelected ? '-selected' : ''))}
					alignItems="center"
					flexGrow={1}
					{...rowProps}
					bg={bg}
					key={hash}
				>{rowContents}</Row>;
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
		isOver,
		dragSourceRef,
		dropTargetRef,
	]);
}

// export default withDraggable(withDragSource(withDropTarget(GridRow)));
export default GridRow;

export const DragSourceGridRow = withDragSource(GridRow);
export const DropTargetGridRow = withDropTarget(GridRow);
export const DragSourceDropTargetGridRow = withDragSource(withDropTarget(GridRow));
