import { useRef, } from 'react';
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
		} = props,
		comboGridProps = _combo._grid || {},
		comboProps = _.omit(_combo, ['_grid']),
		effectiveFields = _combo.fields || fields || ['id', 'value'],
		effectiveIdField = _combo.idField || idField || 'id',
		effectiveDisplayField = _combo.displayField || displayField || 'value',
		effectiveIdIx = _.isNumber(_combo.idIx) ? _combo.idIx : effectiveFields.indexOf(effectiveIdField),
		effectiveDisplayIx = _.isNumber(_combo.displayIx) ? _combo.displayIx : effectiveFields.indexOf(effectiveDisplayField),
		disabledIds = new Set(disabledRows || []),
		getValueFromItem = (item, ix, fieldName) => {
			if (_.isArray(item)) {
				return item[ix];
			}
			if (_.isPlainObject(item)) {
				return item[fieldName];
			}
			return undefined;
		},
		firstWinById = {},
		sourceOrderIds = [];

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

	const
		selectedIdSetRef = useRef(selectedIdSet),
		getOrderedIds = (selectedIdSet) => {
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
		},
		getSelectedIdSetFromValue = (incomingValue) => {
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
		},
		setValueFromIds = (ids) => {
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
		},
		getIsRowSelectable = (item) => {
			const id = getValueFromItem(item, effectiveIdIx, effectiveIdField);
			if (_.isNil(id)) {
				return false;
			}
			return !disabledIds.has(id);
		},
		selectedIdSet = getSelectedIdSetFromValue(value),
		selectedIds = getOrderedIds(selectedIdSet),
		selectableIds = _.filter(sourceOrderIds, (id) => !disabledIds.has(id)),
		additionalButtons = [];

	selectedIdSetRef.current = selectedIdSet;

	if (showSelectClearAll) {
		additionalButtons.push(
			<Button
				key="selectAll"
				variant="outline"
				text="Select all"
				onPress={() => setValueFromIds(selectableIds)}
				className="ml-1"
			/>
		);
		additionalButtons.push(
			<Button
				key="clearAll"
				variant="outline"
				text="Clear all"
				onPress={() => setValueFromIds([])}
				className="ml-1"
			/>
		);
	}

	const columnsConfig = [
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
	];

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
				_grid={{
					columnsConfig,
					selectionMode: SELECTION_MODE_MULTI,
					allowToggleSelection: true,
					getCanSelectItem: getIsRowSelectable,
					...comboGridProps,
				}}
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
