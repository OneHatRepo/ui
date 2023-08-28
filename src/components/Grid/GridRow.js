import { useState, useMemo, } from 'react';
import {
	Box,
	Row,
	Text,
} from 'native-base';
import {
	VERTICAL,
} from '../../Constants/Directions.js';
import UiGlobals from '../../UiGlobals.js';
import withDraggable from '../Hoc/withDraggable.js';
import AngleRight from '../Icons/AngleRight.js';
import _ from 'lodash';

// This was broken out from Grid simply so we can memoize it

export default function GridRow(props) {
	const {
			columnsConfig,
			columnProps,
			fields,
			rowProps,
			hideNavColumn,
			bg,
			item,
			isInlineEditorShown,
		} = props,
		styles = UiGlobals.styles,
		isPhantom = item.isPhantom,
		hash = item?.hash || item;

		return useMemo(() => {
			const renderColumns = (item) => {
				if (_.isArray(columnsConfig)) {
					return _.map(columnsConfig, (config, key) => {
						const propsToPass = columnProps[key] || {};
						if (config.w) {
							propsToPass.w = config.w;
						} else if (config.flex) {
							propsToPass.flex = config.flex;
							propsToPass.minWidth = 100;
						} else {
							propsToPass.flex = 1;
						}
						propsToPass.p = 1;
						propsToPass.justifyContent = 'center';

						if (isInlineEditorShown) {
							propsToPass.minWidth = styles.INLINE_EDITOR_MIN_WIDTH;
						}

						let value;
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
						
						return <Text
									key={key}
									overflow="hidden"
									textOverflow="ellipsis"
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
								>{value}</Text>;
					});
				} else {
					// TODO: if 'columnsConfig' is an object, parse its contents
					throw new Error('Non-array columnsConfig not yet supported');
				}
			};
			return <Row
						alignItems="center"
						flexGrow={1}
						{...rowProps}
						bg={bg}
						key={hash}
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
		]);
}

function withAdditionalProps(WrappedComponent) {
	return (props) => {
		return <WrappedComponent
					mode={VERTICAL}
					{...props}
				/>;
	};
}

export const ReorderableGridRow = withAdditionalProps(withDraggable(GridRow));
