import { useMemo, } from 'react';
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
import withDraggable from '../Hoc/withDraggable.js';
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
			bg,
			item,
			isInlineEditorShown,
			isDraggable = false, // withDraggable
			isDragSource = false, // withDnd
			isOver = false,
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
								'columnId',
								'header',
								'fieldName',
								'type',
								'isEditable',
								'editor',
								'format',
								'renderer',
								'reorderable',
								'resizable',
								'sortable',
								'w',
								'flex',
								'showDragHandles',
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

							return <Row key={key} {...propsToPass} {...extraProps}>{config.renderer(item)}</Row>;
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
									if (type.match(/(Tag|TagEditor)$/)) {
										elementProps.isViewOnly = true; // TODO: this won't work for InlineGridEditor, bc that Grid can't use isViewOnly when actually editing
									}
									return <Element
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
					return <Text
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

		if (props.dragSourceRef) {
			rowContents = <Row flexGrow={1} flex={1} w="100%" bg={bg} ref={props.dragSourceRef}>{rowContents}</Row>;
		}
		if (props.dropTargetRef) {
			rowContents = <Row flexGrow={1} flex={1} w="100%" bg={bg} ref={props.dropTargetRef}>{rowContents}</Row>;
		}

		return <Row
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
	]);
}

export default withDraggable(withDragSource(withDropTarget(GridRow)));
