import { useCallback, useMemo, useRef, } from 'react';
import { Icon, } from '@onehat-gluestack';
import clsx from 'clsx';
import {
	SELECTION_MODE_MULTI,
} from '../../../../Constants/Selection.js';
import Button from '../../../Buttons/Button.js';
import Square from '../../../Icons/Square.js';
import SquareCheck from '../../../Icons/SquareCheck.js';
import withAlert from '../../../Hoc/withAlert.js';
import withComponent from '../../../Hoc/withComponent.js';
import withData from '../../../Hoc/withData.js';
import withTooltip from '../../../Hoc/withTooltip.js';
import withValue from '../../../Hoc/withValue.js';
import ArrayCombo from '../Combo/ArrayCombo.js';
import _ from 'lodash';

function MultiSelectComponent(props) {
	const {
			showSelectClearAll = false,
			disabledRows = [],
			fieldsOrder,
			_combo = {},

			// withData
			data = [],
			fields,
			idField,
			displayField,
			idIx,
			displayIx,

			// withValue
			value = [],
			setValue,

			...propsToPass
		} = props;

	const comboGridProps = _combo._grid || {};
	const comboProps = useMemo(() => _.omit(_combo, ['_grid']), [_combo]);
	const effectiveFields = _combo.fields || fields || ['id', 'value'];
	const effectiveIdField = _combo.idField || idField || 'id';
	const effectiveDisplayField = _combo.displayField || displayField || 'value';
	const effectiveIdIx = _.isNumber(_combo.idIx) ? _combo.idIx : effectiveFields.indexOf(effectiveIdField);
	const effectiveDisplayIx = _.isNumber(_combo.displayIx) ? _combo.displayIx : effectiveFields.indexOf(effectiveDisplayField);

	const disabledIds = useMemo(() => new Set(disabledRows || []), [disabledRows]);

	const getValueFromItem = useCallback((item, ix, fieldName) => {
		if (_.isArray(item)) {
			return item[ix];
		}
		if (_.isPlainObject(item)) {
			return item[fieldName];
		}
		return undefined;
	}, []);

	const { firstWinById, sourceOrderIds, } = useMemo(() => {
		const firstWinById = {};
		const sourceOrderIds = [];

		_.each(data, (item) => {
			const id = getValueFromItem(item, effectiveIdIx, effectiveIdField);
			if (_.isNil(id) || !_.isUndefined(firstWinById[id])) {
				return;
			}
			firstWinById[id] = {
				id,
				text: getValueFromItem(item, effectiveDisplayIx, effectiveDisplayField),
			};
			sourceOrderIds.push(id);
		});

		return {
			firstWinById,
			sourceOrderIds,
		};
	}, [data, effectiveDisplayField, effectiveDisplayIx, effectiveIdField, effectiveIdIx, getValueFromItem]);

	const getOrderedIds = useCallback((selectedIdSet) => {
		const ordered = [];
		if (_.isArray(fieldsOrder) && fieldsOrder.length) {
			_.each(fieldsOrder, (id) => {
				if (selectedIdSet.has(id) && !_.isUndefined(firstWinById[id])) {
					ordered.push(id);
				}
			});
		}
		_.each(sourceOrderIds, (id) => {
			if (selectedIdSet.has(id) && !_.includes(ordered, id)) {
				ordered.push(id);
			}
		});
		return ordered;
	}, [fieldsOrder, firstWinById, sourceOrderIds]);

	const getSelectedIdSetFromValue = useCallback((incomingValue) => {
		const set = new Set();
		if (!_.isArray(incomingValue)) {
			return set;
		}
		_.each(incomingValue, (item) => {
			const id = _.isPlainObject(item) ? item.id : item;
			if (_.isNil(id) || _.isUndefined(firstWinById[id]) || disabledIds.has(id)) {
				return;
			}
			set.add(id);
		});
		return set;
	}, [disabledIds, firstWinById]);

	const selectedIdSet = useMemo(() => getSelectedIdSetFromValue(value), [getSelectedIdSetFromValue, value]);
	const selectedIds = useMemo(() => getOrderedIds(selectedIdSet), [getOrderedIds, selectedIdSet]);
	const selectableIds = useMemo(() => _.filter(sourceOrderIds, (id) => !disabledIds.has(id)), [sourceOrderIds, disabledIds]);

	const setValueFromIds = useCallback((ids) => {
		let idsToUse = [];
		if (_.isArray(ids)) {
			idsToUse = ids;
		} else if (!_.isNil(ids)) {
			idsToUse = [ids];
		}

		const selectedIdSet = new Set();
		_.each(idsToUse, (id) => {
			if (_.isNil(id) || _.isUndefined(firstWinById[id]) || disabledIds.has(id)) {
				return;
			}
			selectedIdSet.add(id);
		});

		const orderedIds = getOrderedIds(selectedIdSet);
		const newValue = _.map(orderedIds, (id) => {
			const item = firstWinById[id];
			return {
				id: item.id,
				text: item.text,
			};
		});
		setValue(newValue);
	}, [disabledIds, firstWinById, getOrderedIds, setValue]);

	const getIsRowSelectable = useCallback((item) => {
		const id = getValueFromItem(item, effectiveIdIx, effectiveIdField);
		if (_.isNil(id)) {
			return false;
		}
		return !disabledIds.has(id);
	}, [disabledIds, effectiveIdField, effectiveIdIx, getValueFromItem]);

	const selectedIdSetRef = useRef(new Set());
	selectedIdSetRef.current = selectedIdSet;

	const additionalButtons = useMemo(() => {
		if (!showSelectClearAll) {
			return [];
		}

		return [
			<Button
				key="selectAll"
				variant="outline"
				text="Select all"
				onPress={() => setValueFromIds(selectableIds)}
				className="ml-1"
			/>,
			<Button
				key="clearAll"
				variant="outline"
				text="Clear all"
				onPress={() => setValueFromIds([])}
				className="ml-1"
			/>,
		];
	}, [selectableIds, setValueFromIds, showSelectClearAll]);

	const columnsConfig = useMemo(() => [
		{
			id: 'checkbox',
			header: '',
			w: 36,
			isSortable: false,
			isEditable: false,
			isReorderable: false,
			isResizable: false,
			renderer: (item, fieldName, cellProps, key) => {
				const
					id = getValueFromItem(item, effectiveIdIx, effectiveIdField),
					isSelectable = !_.isNil(id) && !disabledIds.has(id),
					isChecked = isSelectable && selectedIdSetRef.current.has(id);
				return <Icon
							key={key}
							as={isChecked ? SquareCheck : Square}
							size="sm"
							className={clsx(
								'self-center',
								isSelectable ? 'text-grey-700' : 'text-grey-300',
								'mr-2',
							)}
						/>;
			},
		},
		{
			id: 'displayField',
			fieldName: effectiveDisplayField,
			flex: 1,
		},
	], [disabledIds, effectiveDisplayField, effectiveIdField, effectiveIdIx, getValueFromItem]);

	const multiSelectGridProps = useMemo(() => {
		return {
			columnsConfig,
			selectionMode: SELECTION_MODE_MULTI,
			allowToggleSelection: true,
			getCanSelectItem: getIsRowSelectable,
			...comboGridProps,
		};
	}, [columnsConfig, comboGridProps, getIsRowSelectable]);

	return <ArrayCombo
				disableWithData={true}
				disableWithValue={true}
				data={data}
				fields={effectiveFields}
				idField={effectiveIdField}
				displayField={effectiveDisplayField}
				idIx={effectiveIdIx}
				displayIx={effectiveDisplayIx}
				value={selectedIds}
				setValue={setValueFromIds}
				isMultiSelectMode={true}
				hideMenuOnSelection={false}
				additionalButtons={additionalButtons}
				_grid={multiSelectGridProps}
				{...comboProps}
				{...propsToPass}
			/>;
}

export const MultiSelect = withComponent(
							withAlert(
								withData(
									withValue(
										withTooltip(
											MultiSelectComponent
										)
									)
								)
							)
						);

function withAdditionalProps(WrappedComponent) {
	return (props) => {
		const tooltipTriggerClassName = clsx(
			'w-full',
			'flex-1',
			props.tooltipTriggerClassName,
		);
		return <WrappedComponent
					{...props}
					isValueAlwaysArray={true}
					isValueAsStringifiedJson={true}
					preserveValueOrder={true}
					tooltipTriggerClassName={tooltipTriggerClassName}
				/>;
	};
}

export default withAdditionalProps(MultiSelect);
