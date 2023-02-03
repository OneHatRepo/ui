import React, { useState, useEffect, useRef, useMemo, } from 'react';
import {
	Column,
	FlatList,
	Pressable,
	Row,
	Text,
} from 'native-base';
import {
	SELECTION_MODE_SINGLE,
	SELECTION_MODE_MULTI,
} from '../../Constants/Selection';
import styles from '../../Constants/Styles';
import {
	v4 as uuid,
} from 'uuid';
import useForceUpdate from '../../Hooks/useForceUpdate';
import withContextMenu from '../Hoc/withContextMenu';
import withAlert from '../Hoc/withAlert';
import withData from '../Hoc/withData';
import withEvents from '../Hoc/withEvents';
import withFilters from '../Hoc/withFilters';
import withPresetButtons from '../Hoc/withPresetButtons';
import withMultiSelection from '../Hoc/withMultiSelection';
import withSelection from '../Hoc/withSelection';
import withWindowedEditor from '../Hoc/withWindowedEditor';
import withInlineEditor from '../Hoc/withInlineEditor';
import testProps from '../../Functions/testProps';
import GridHeaderRow from './GridHeaderRow';
import GridRow from './GridRow';
import IconButton from '../Buttons/IconButton';
import PaginationToolbar from '../Toolbar/PaginationToolbar';
import NoRecordsFound from './NoRecordsFound';
import Toolbar from '../Toolbar/Toolbar';
import _ from 'lodash';

// Grid requires the use of HOC withSelection() whenever it's used.
// The default export is *with* the HOC. A separate *raw* component is
// exported which can be combined with many HOCs for various functionality.

	// Desired features: ---------
	// Rows
		// Rows with ability to use multiple lines (I was thinking custom render fns on rows, could possibly already do this!)
	// selection
		// Draggable selection (not super important)
	// editor
		// [ ] Show inline editor for selected row
		// Dragging of window (see withWindowedEditor)
	// Rows
		// Drag/drop reordering (Used primarily to change sort order in OneBuild apps)
			// state to keep track of current ordering
			// If it's reorderable, add reorder drag handle column
	// custom cell types
		// Most would use text, and depend on @onehat/data for formatting
	// Display tree data

export function Grid(props) {
	const {

			columnsConfig = [], // json configurations for each column

			columnProps = {},
			getRowProps = () => {
				return {
					borderBottomWidth: 1,
					borderBottomColor: 'trueGray.500',
					py: 2,
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
			showRowExpander = false,
			rowExpanderTpl = '',
			showHeaders = true,
			showHovers = true,
			canColumnsSort = true,
			canColumnsReorder = true,
			canColumnsResize = true,
			allowToggleSelection = true, // i.e. single click with no shift key toggles the selection of the item clicked on
			disablePagination = false,
			bottomToolbar = 'pagination',
			topToolbar = null,
			additionalToolbarButtons = [],

			// withEditor
			onAdd,
			onEdit,
			onDelete,
			onView,
			onDuplicate,
			onReset,
			onContextMenu,

			// withData
			Repository,
			data,
			fields,
			idField,
			displayField,
			idIx,
			displayIx,

			// withPresetButtons
			onChangeColumnsConfig,

			// withSelection
			selection,
			setSelection,
			selectionMode,
			removeFromSelection,
			addToSelection,
			deselectAll,
			selectRangeTo,
			isInSelection,
			noSelectorMeansNoResults = false,

			// selectorSelected
			selectorId,
			selectorSelected,
			disableSelectorSelected = false,

			// withInlineEditor
			inlineEditorRef,
			onScrollRow,
			onEditorRowClick,

		} = props,
		forceUpdate = useForceUpdate(),
		gridRef = useRef(),
		[isReady, setIsReady] = useState(false),
		[isLoading, setIsLoading] = useState(false),
		[localColumnsConfig, setLocalColumnsConfigRaw] = useState([]),
		setLocalColumnsConfig = (config) => {
			setLocalColumnsConfigRaw(config);
			if (onChangeColumnsConfig) {
				onChangeColumnsConfig(config);
			}
		},
		onRowClick = (item, rowIndex, e) => {
			const
				{
					shiftKey,
					metaKey,
				 } = e;
				
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
		renderRow = (row) => {
			if (row.item.isDestroyed) {
				return null;
			}

			let {
					item,
					index,
				} = row,
				isHeaderRow = row.item.id === 'headerRow',
				rowProps = getRowProps && !isHeaderRow ? getRowProps(item) : {},
				isSelected = !isHeaderRow && isInSelection(item);

			return <Pressable
						// {...testProps(Repository ? Repository.schema.name + '-' + item.id : item.id)}
						onPress={(e) => {
							if (isHeaderRow) {
								return
							}
							switch (e.detail) {
								case 1: // single click
									onRowClick(item, index, e); // sets selection
									if (onEditorRowClick) {
										onEditorRowClick(item, index, e);
									}
									break;
								case 2: // double click
									if (!isSelected) { // If a row was already selected when double-clicked, the first click will deselect it,
										onRowClick(item, index, e); // so reselect it
									}
									if (onEdit) {
										onEdit();
									}
									break;
								case 3: // triple click
									break;
								default:
							}
						}}
						onLongPress={(e) => {
							if (isHeaderRow) {
								return
							}
							// context menu
							const selection = [item];
							setSelection(selection);
							if (onEditorRowClick) { // e.g. inline editor
								onEditorRowClick(item, index, e);
							}
							if (onContextMenu) {
								onContextMenu(item, index, e, selection, setSelection);
							}
						}}
						flexDirection="row"
						flexGrow={1}
					>
						{({
							isHovered,
							isFocused,
							isPressed,
						}) => {
							if (isHeaderRow) {
								return <GridHeaderRow
											Repository={Repository}
											columnsConfig={localColumnsConfig}
											setColumnsConfig={setLocalColumnsConfig}
											hideNavColumn={hideNavColumn}
											canColumnsSort={canColumnsSort}
											canColumnsReorder={canColumnsReorder}
											canColumnsResize={canColumnsResize}
											setSelection={setSelection}
											gridRef={gridRef}
											isHovered={isHovered}
										/>;
							}

							let bg = styles.GRID_ROW_BG;
							if (isSelected) {
								if (showHovers && isHovered) {
									bg = styles.GRID_ROW_SELECTED_HOVER_BG;
								} else {
									bg = styles.GRID_ROW_SELECTED_BG;
								}
							} else {
								if (showHovers && isHovered) {
									bg = styles.GRID_ROW_HOVER_BG;
								} else {
									bg = styles.GRID_ROW_BG;
								}
							}
							return <GridRow
										columnsConfig={localColumnsConfig}
										columnProps={columnProps}
										fields={fields}
										rowProps={rowProps}
										hideNavColumn={hideNavColumn}
										bg={bg}
										item={item}
									/>;
						}}
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
							isEditable = false,
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
							isEditable,
							editor,
							format,
							renderer,
							reorderable,
							resizable,
							sortable,
							w,
							flex,
							showDragHandles: false,
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

		if (!isReady) {
			setLocalColumnsConfig(calculateLocalColumnsConfig());
			setIsReady(true);
		}
		if (!Repository) {
			return () => {};
		}

		// set up @onehat/data repository
		const
			setTrue = () => setIsLoading(true),
			setFalse = () => setIsLoading(false),
			onChangeFilters = () => {
				if (!Repository.isAutoLoad) {
					Repository.reload();
				}
			},
			onChangeSorters = () => {
				if (!Repository.isAutoLoad) {
					Repository.reload();
				}
			};

		Repository.on('beforeLoad', setTrue);
		Repository.on('load', setFalse);
		Repository.ons(['changePage', 'changePageSize',], deselectAll);
		Repository.ons(['changeData', 'change'], forceUpdate);
		Repository.on('changeFilters', onChangeFilters);
		Repository.on('changeSorters', onChangeSorters);


		return () => {
			Repository.off('beforeLoad', setTrue);
			Repository.off('load', setFalse);
			Repository.offs(['changePage', 'changePageSize',], deselectAll);
			Repository.offs(['changeData', 'change'], forceUpdate);
			Repository.off('changeFilters', onChangeFilters);
			Repository.off('changeSorters', onChangeSorters);
		};
	}, [deselectAll]);

	useEffect(() => {
		if (!Repository) {
			return () => {};
		}
		if (!disableSelectorSelected) {
			let matches = selectorSelected?.[0]?.id;
			if (_.isEmpty(selectorSelected)) {
				matches = noSelectorMeansNoResults ? 'NO_MATCHES' : null;
			}
			Repository.filter(selectorId, matches, false); // so it doesn't clear existing filters
		}

	}, [selectorId, selectorSelected]);

	const footerToolbarItemComponents = useMemo(() => getFooterToolbarItems(), [additionalToolbarButtons]);

	if (!isReady) {
		return null;
	}

	// Actual data to show in the grid
	const entities = Repository ? (Repository.isRemote ? Repository.entities : Repository.getEntitiesOnPage()) : data;
	let rowData = _.clone(entities); // don't use the original array, make a new one so alterations to it are temporary
	if (showHeaders) {
		rowData.unshift({ id: 'headerRow' });
	}
	const initialNumToRender = rowData.length || 10;

	// headers & footers
	let listFooterComponent = null;
	if (Repository && bottomToolbar === 'pagination' && !disablePagination && Repository.isPaginated) {
		listFooterComponent = <PaginationToolbar Repository={Repository} toolbarItems={footerToolbarItemComponents} />;
	} else if (footerToolbarItemComponents.length) {
		listFooterComponent = <Toolbar>{footerToolbarItemComponents}</Toolbar>;
	}
	
	return <Column
				{...testProps('Grid')}
				flex={1}
				w="100%"
			>
				{topToolbar}

				<Column w="100%" flex={1} borderTopWidth={isLoading ? 2 : 1} borderTopColor={isLoading ? '#f00' : 'trueGray.300'} onClick={deselectAll}>
					{!entities.length ? <NoRecordsFound text={noneFoundText} onRefresh={onRefresh} /> :
						<FlatList
							ref={gridRef}
							// ListHeaderComponent={listHeaderComponent}
							// ListFooterComponent={listFooterComponent}
							scrollEnabled={true}
							nestedScrollEnabled={true}
							contentContainerStyle={{
								overflow: 'scroll',
							}}
							refreshing={isLoading}
							onRefresh={pullToRefresh ? onRefresh : null}
							progressViewOffset={100}
							data={rowData}
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
						/>}
				</Column>

				{listFooterComponent}

			</Column>;

}

export const WindowedGridEditor = withAlert(
									withEvents(
										withData(
											withMultiSelection(
												withSelection(
													withWindowedEditor(
														withFilters(
															withPresetButtons(
																withContextMenu(
																	Grid
																)
															)
														)
													)
												)
											)
										)
									)
								);

export const InlineGridEditor = withAlert(
									withEvents(
										withData(
											withMultiSelection(
												withSelection(
													withInlineEditor(
														withPresetButtons(
															withContextMenu(
																withFilters(
																	Grid
																)
															)
														)
													)
												)
											)
										)
									)
								);

export default WindowedGridEditor;
