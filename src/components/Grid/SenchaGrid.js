import { useState, useEffect, } from 'react';
import {
	Column,
	Row,
	Text,
} from 'native-base';
import {
	SenchaGrid,
	AddressColumn,
	BooleanColumn,
	CheckboxColumn,
	ColorColumn,
	Column as Col,
	DateColumn,
	DecimalColumn,
	EmailColumn,
	FloatColumn,
	IntegerColumn,
	MoneyColumn,
	NumberColumn,
	PercentageColumn,
	PhoneColumn,
	TreeColumn,
} from '@sencha/sencha-grid';
import '@sencha/sencha-grid/dist/themes/grui.css';
import testProps from '../../functions/testProps';
import useForceUpdate from '../../hooks/useForceUpdate';
import Loading from '../Messages/Loading';
import Toolbar from '../Toolbar/Toolbar';
import PaginationToolbar from '../Toolbar/PaginationToolbar';
import NoRecordsFound from './NoRecordsFound';
import AngleRight from '../Icons/AngleRight';
import _ from 'lodash';

// This grid makes use of @sencha/sencha-grid

export default function Grid(props) {
	const {
			Repository,
			topToolbar,
			bottomToolbar = 'pagination',
			columnsConfig = [], // json configurations for each column
			showSummaries = false,
			showEditors = false,
			showFilters = false,
			showRowExpander = false,
			cellEditing = false,
			rowEditing = false,
			// columnProps = {},
			// getRowProps = () => {
			// 	return {
			// 		bg: '#fff',
			// 		p: 2,
			// 	};
			// },
			gridProps = {},
			pullToRefresh = true,
			hideRightColumn = true,
			disableLoadingIndicator = false,
			noneFoundText,
			disableReloadOnChangeFilters = false,

			// properties
			data,
			treeData,
			columnLines = true,
			grouped = false,
			groupFooter = false,
			groupField,
			hideHeaders = false,
			scrollable = false,
			itemConfig, // { body: <RowBodyComponent /> },
			itemRipple, // { color: 'green' },
			hideRowLines = false,
			rowNumbers = false,
			selectable = {
				cells: false,
				checkbox: true,
				// checkboxColumnIndex: 0,
				columns: true,
				deselectable: true,
				disabled: false,
				drag: true,
				extensible: true,
				headerCheckbox: true,
				mode: 'multi', // single | multi
				reducible: true,
				rows: true,
			},
			shadow = false,
			sortable = true,
			variableHeights = true,


			// events
			onBeforeComplete,
			onBeforeEdit,
			onBeforeGroupCollapse,
			onBeforeGroupExpand,
			onBeforeStartEdit,
			onBeforeCancelEdit,
			onCellSelection,
			onColumnAdd,
			onColumnHide,
			onColumnMenuCreated,
			onColumnMove,
			onColumnResize,
			onColumnSelection,
			onColumnSort,
			onCompleteEdit,
			onDeselect,
			onEdit,
			onEditRestrict,
			onInitialized,
			onPainted,
			onSelect,
			onStartEdit,
			onUpdateData,
			onValidateEdit,

		} = props,
		entities = Repository.entities,
		[isLoading, setIsLoading] = useState(false),
		forceUpdate = useForceUpdate(),
		onRefresh = () => Repository.load(),
		generateColumnComponents = () => {
			const columnComponents = [];
			_.each(columnsConfig, (column, ix) => {

				// This destructuring sets the default values
				const {
						type, // specify which sencha column type to use

						align = 'left',
						dateTimeFormatLocales = 'en-US',
						editable = false,
						editor, // BooleanEditor | CheckboxEditor | ColorEditor | DateEditor | IEditor | NumberEditor | PhoneEditor | SelectEditor | TextEditor | 
						flex,
						field, // required
						format,
						groupable = false,
						hideable = false,
						hidden = false,
						locked = false,
						menu, // [{ text: 'menu1' }, { text: 'menu2' }]
						menuDisabled = false,
						minWidth,
						renderer, // React component will render the output
						resizable = true,
						sortable = true,
						style,
						summary, // sum, min, max, average, variance, variancep, stddev, stddevp
						summaryCell, // 'numbercell'
						summaryRenderer, // fn that returns value as formatted string, like (value) => 'Maximum Cost: ' + value;
						text, // i.e. header
						width,
					} = column,

					// This var incorporates the default values, and puts them back in an obj we pass to column
					propsToPass = {
						align,
						dateTimeFormatLocales,
						editable,
						field,
						groupable,
						hideable,
						hidden,
						locked,
						menuDisabled,
						resizable,
						sortable,
					},
					propsToCheck = {
						editor,
						format,
						menu,
						minWidth,
						renderer,
						style,
						summary,
						summaryCell,
						summaryRenderer,
						text,
					};
				_.each(propsToCheck, (prop, name) => {
					if (!_.isEmpty(prop)) {
						propsToPass[name] = prop;
					}
				});

				if (!flex && !width) {
					propsToPass.flex = 1;
				} else if (flex) {
					propsToPass.flex = flex;
				} else if (width) {
					propsToPass.width = width;
				}

				let ColumnType;
				switch(type) {
					case 'address':
						ColumnType = AddressColumn;
						break;
					case 'bool':
						ColumnType = BooleanColumn;
						break;
					case 'checkbox':
						ColumnType = CheckboxColumn;
						break;
					case 'color':
						ColumnType = ColorColumn;
						break;
					case 'date':
					case 'datetime':
					// case 'time':
						ColumnType = DateColumn;
						break;
					case 'decimal':
						ColumnType = DecimalColumn;
						break;
					case 'email':
						ColumnType = EmailColumn;
						break;
					case 'float':
						ColumnType = FloatColumn;
						break;
					case 'int':
						ColumnType = IntegerColumn;
						break;
					case 'currency':
						ColumnType = MoneyColumn;
						break;
					case 'percentInt':
						ColumnType = NumberColumn;
						break;
					case 'percent':
						ColumnType = PercentageColumn;
						break;
					case 'phone':
						ColumnType = PhoneColumn;
						break;
					case 'tree':
						ColumnType = TreeColumn;
						break;
					default:
						ColumnType = Col;
				}

				if (!_.isEmpty(editor)) {
					propsToPass.editor = editor;
				}

				columnComponents.push(<ColumnType key={ix} {...propsToPass} />);
			});

			if (!hideRightColumn) {
				columnComponents.push(<AngleRight
					key={columnComponents.length} 
					color="#aaa"
					variant="ghost"
					w={30}
					alignSelf="center"
					ml={3}
				/>);
			}
			return columnComponents;
		},
		convertEntitiesToSenchaGrid = () => {
			return _.map(Repository.entities, (entity) => {
				const rec = {};
				_.each(columnsConfig, (config) => {
					rec[config.field] = entity[config.field];
				});
				return rec;
			});
		},
		getPlugins = () => {
			const plugins = {};
			if (showSummaries) {
				plugins.gridsummaryrow = true;
			}
			if (showEditors) {
				plugins.gridcellediting = true;
			}
			if (rowEditing) {
				plugins.rowedit = { autoConfirm: false, };
			}
			if (showRowExpander) {
				plugins.rowexpander = true;
			}
			if (cellEditing) {
				plugins.cellediting = { clicksToEdit: 2, };
			}
			if (showFilters) {
				plugins.gridfilters = true;
			}
			if (grouped) {
				plugins.groupingpanel = true;
			}
			if (pullToRefresh) {
				// plugins.pullrefresh = true; // causes a crash!
			}
			return plugins;
		};

	useEffect(() => {
		if (!Repository || !Repository.on) {
			return;
		}
		if (disableLoadingIndicator) {
			return;
		}
		const
			setTrue = () => setIsLoading(true),
			setFalse = () => setIsLoading(false),
			onChangeFilters = () => {
				if (!Repository.autoLoad && Repository.isLoaded && !disableReloadOnChangeFilters) {
					Repository.reload();
				}
			};

		Repository.on('beforeLoad', setTrue);
		Repository.on('load', setFalse);
		Repository.ons(['changePage', 'changePageSize', 'changeData', 'change'], forceUpdate);
		Repository.on('changeFilters', onChangeFilters);

		// LEFT OFF HERE.
		// If changing the pageSize to 5, it says that it's showing page 1, but it doesn't show the first item.
		// Nav to other pages doesn't work right yet.
		
		return () => {
			Repository.off('beforeLoad', setTrue);
			Repository.off('load', setFalse);
			Repository.offs(['changePage', 'changePageSize', 'changeData', 'change'], forceUpdate);
			Repository.off('changeFilters', onChangeFilters);
		};
	}, [Repository, disableLoadingIndicator, disableReloadOnChangeFilters, forceUpdate]);
	
	if (!props.Repository) {
		return null;
	}

	const propsToPass = {
			columnLines,
			grouped,
			groupFooter,
			hideHeaders,
			scrollable,
			hideRowLines,
			rowNumbers,
			selectable,
			shadow,
			sortable,
			variableHeights,
		},
		columnComponents = generateColumnComponents(),
		plugins = getPlugins(),
		propsToCheck = {
			plugins,
			groupField,
			itemConfig,
			itemRipple,
			onBeforeComplete,
			onBeforeEdit,
			onBeforeGroupCollapse,
			onBeforeGroupExpand,
			onBeforeStartEdit,
			onBeforeCancelEdit,
			onCellSelection,
			onColumnAdd,
			onColumnHide,
			onColumnMenuCreated,
			onColumnMove,
			onColumnResize,
			onColumnSelection,
			onColumnSort,
			onCompleteEdit,
			onDeselect,
			onEdit,
			onEditRestrict,
			onInitialized,
			onPainted,
			onSelect,
			onStartEdit,
			onUpdateData,
			onValidateEdit,
		}
	_.each(propsToCheck, (prop, name) => {
		if (!_.isEmpty(prop)) {
			propsToPass[name] = prop;
		}
	});
	if (!_.isEmpty(data)) {
		propsToPass.data = data;
	} else if (!_.isEmpty(treeData)) {
		propsToPass.treeData = treeData;
	} else {
		propsToPass.data = convertEntitiesToSenchaGrid();
	}

	return <Column
				{...testProps('GridPanelContainer')}
				flex={1}
				w="100%"
			>
				{topToolbar && <Toolbar>{topToolbar}</Toolbar>}

				{isLoading && <Column flex={1}><Loading /></Column>}

				{!isLoading && (!entities.length ? <NoRecordsFound text={noneFoundText} onRefresh={onRefresh} /> : 
				
					<SenchaGrid {...propsToPass} style={{ width: "100%", height: "100%", flex: 1, }} {...gridProps}>
						{columnComponents}
					</SenchaGrid>)}

				{bottomToolbar && (bottomToolbar === 'pagination' ?
					<PaginationToolbar Repository={Repository} />:
						<Toolbar>{bottomToolbar}</Toolbar>)}
			</Column>;

}
