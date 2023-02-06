import { useState, useMemo, } from 'react';
import {
	Box,
	Row,
	Text,
} from 'native-base';
import {
	VERTICAL,
} from '../../Constants/Directions';
import {
	UI_MODE_WEB,
} from '../../Constants/UiModes';
import UiConfig from '../../UiConfig';
import styles from '../../Constants/Styles';
import AngleRight from '../Icons/AngleRight';
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
			canReorder = false,
		} = props,
		isPhantom = item.isPhantom,
		hash = item.hash || item,
		[dragRowSlot, setDragRowSlot] = useState(null),
		[isDragging, setIsDragging] = useState(false),
		onRowReorderDragStart = (info, e, proxy, node) => {
			// const
			// 	proxyRect = proxy.getBoundingClientRect(),
			// 	columnHeader = node.parentElement,
			// 	columnHeaders = _.filter(columnHeader.parentElement.children, (childNode) => {
			// 		return childNode.getBoundingClientRect().width !== 0; // Skip zero-width children
			// 	}),
			// 	currentX = proxyRect.left; // left position of pointer
		
			// // Figure out which index the user wants
			// let newIx = 0;
			// _.each(columnHeaders, (child, ix, all) => {
			// 	const
			// 		rect = child.getBoundingClientRect(), // rect of the columnHeader of this iteration
			// 		{
			// 			left,
			// 			right,
			// 			width,
			// 		} = rect,
			// 		halfWidth = width /2;

			// 	if (ix === 0) {
			// 		// first column
			// 		if (currentX < left + halfWidth) {
			// 			newIx = 0;
			// 			return false;
			// 		} else if (currentX < right) {
			// 			newIx = 1;
			// 			return false;
			// 		}
			// 	} else if (ix === all.length -1) {
			// 		// last column
			// 		if (currentX < left + halfWidth) {
			// 			newIx = ix;
			// 			return false;
			// 		}
			// 		newIx = ix +1;
			// 		return false;
			// 	}
				
			// 	// all other columns
			// 	if (left <= currentX && currentX < left + halfWidth) {
			// 		newIx = ix;
			// 		return false;
			// 	} else if (currentX < right) {
			// 		newIx = ix +1;
			// 		return false;
			// 	}
			// });

			// // Verify index can actually be used
			// if (typeof localColumnsConfig[newIx] === 'undefined' || !localColumnsConfig[newIx].reorderable) {
			// 	return;
			// }

			// // Render marker showing destination location (can't use regular render cycle because this div is absolutely positioned on page)
			// const
			// 	columnHeaderRect = columnHeaders[newIx].getBoundingClientRect(),
			// 	left = columnHeaderRect.left,
			// 	gridRowsContainer = gridRef.current._listRef._scrollRef.childNodes[0],
			// 	gridRowsContainerRect = gridRowsContainer.getBoundingClientRect(),
			// 	marker = document.createElement('div');

			// marker.style.position = 'absolute';
			// marker.style.height = gridRowsContainerRect.height + columnHeaderRect.height + 'px';
			// marker.style.width = '4px';
			// marker.style.top = columnHeaderRect.top + 'px';
			// // marker.style.right = 0;
			// marker.style.backgroundColor = '#ccc';

			// document.body.appendChild(marker);
			// marker.style.left = left + 'px';

			setDragRowSlot({ ix: newIx, marker, });
		},
		onRowReorderDrag = (info, e, proxy, node) => {
			// const
			// 	proxyRect = proxy.getBoundingClientRect(),
			// 	columnHeader = node.parentElement,
			// 	columnHeaders = _.filter(columnHeader.parentElement.children, (childNode) => {
			// 		return childNode.getBoundingClientRect().width !== 0; // Skip zero-width children
			// 	}),
			// 	currentX = proxyRect.left; // left position of pointer
		
			// // Figure out which index the user wants
			// let newIx = 0;
			// _.each(columnHeaders, (child, ix, all) => {
			// 	const
			// 		rect = child.getBoundingClientRect(), // rect of the columnHeader of this iteration
			// 		{
			// 			left,
			// 			right,
			// 			width,
			// 		} = rect,
			// 		halfWidth = width /2;

			// 	if (ix === 0) {
			// 		// first column
			// 		if (currentX < left + halfWidth) {
			// 			newIx = 0;
			// 			return false;
			// 		} else if (currentX < right) {
			// 			newIx = 1;
			// 			return false;
			// 		}
			// 	} else if (ix === all.length -1) {
			// 		// last column
			// 		if (currentX < left + halfWidth) {
			// 			newIx = ix;
			// 			return false;
			// 		}
			// 		newIx = ix +1;
			// 		return false;
			// 	}
				
			// 	// all other columns
			// 	if (left <= currentX && currentX < left + halfWidth) {
			// 		newIx = ix;
			// 		return false;
			// 	} else if (currentX < right) {
			// 		newIx = ix +1;
			// 		return false;
			// 	}
			// });

			// // Verify index can actually be used
			// if (typeof localColumnsConfig[newIx] === 'undefined' || !localColumnsConfig[newIx].reorderable) {
			// 	return;
			// }

			// // Render marker showing destination location (can't use regular render cycle because this div is absolutely positioned on page)
			// const
			// 	columnHeaderRect = columnHeaders[newIx].getBoundingClientRect(),
			// 	left = columnHeaderRect.left;
			// let marker = dragRowSlot && dragRowSlot.marker;
			// if (marker) {
			// 	marker.style.left = left + 'px';
			// }

			setDragRowSlot({ ix: newIx, marker, });
		},
		onRowReorderDragStop = (delta, e, config) => {
			// const columnsConfig = _.clone(localColumnsConfig); // work with a copy, so that setter forces rerender

			//  _.pull(columnsConfig, config);

			// // Stick the column at the new ix  (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
			// columnsConfig.splice(dragRowSlot.ix, 0, config);

			// setLocalColumnsConfig(columnsConfig);
			// setColumnsConfig(columnsConfig);

			// if (dragRowSlot) {
			// 	dragRowSlot.marker.remove();
			// }
			setDragRowSlot(null);
		};

		return useMemo(() => {
			const renderColumns = (item) => {
				if (_.isArray(columnsConfig)) {
					return _.map(columnsConfig, (config, key) => {
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
		]);
}

