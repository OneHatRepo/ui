import { useState, useEffect, } from 'react';
import {
	SELECTION_MODE_SINGLE,
	SELECTION_MODE_MULTI,
	SELECT_UP,
	SELECT_DOWN,
} from '../../constants/Selection';
import oneHatData from '@onehat/data';
import inArray from '../../functions/inArray';
import _ from 'lodash';

export default function withSelection(WrappedComponent) {
	return (props) => {
		const
			{
				defaultSelection,
				onSelect,
				selectionMode = SELECTION_MODE_SINGLE, // SELECTION_MODE_MULTI, SELECTION_MODE_SINGLE
				autoSelectFirstItem = false,

				Repository,
				data,
				fields,
				idField,
				displayField,
			} = props,
			[selection, setSelectionRaw] = useState(defaultSelection ? [defaultSelection] : []),
			[isReady, setIsReady] = useState(false),
			setSelection = (selection) => {
				if (onSelect) {
					onSelect(selection);
				}
				setSelectionRaw(selection);
			},
			selectNext = () => {
				selectDirection(SELECT_DOWN);
			},
			selectPrev = () => {
				selectDirection(SELECT_UP);
			},
			selectDirection = (which) => {
				const { items, max, min, } = getMaxMinSelectionIndices();
				let newIx;
				if (which === SELECT_DOWN) {
					newIx = max +1;
				} else if (which === SELECT_UP) {
					newIx = min -1;
				}
				if (items[newIx]) {
					setSelection([items[newIx]]);
				}
			},
			addToSelection = (item) => {
				let newSelection = [];
				newSelection = _.clone(selection); // so we get a new object, so descendants rerender
				newSelection.push(item);
				setSelection(newSelection);
			},
			removeFromSelection = (item) => {
				let newSelection = [];
				if (Repository) {
					newSelection = _.remove(selection, (sel) => sel !== item);
				} else {
					const ix = fields.indexOf(idField);
					newSelection = _.remove(selection, (sel) => sel[ix] !== item[ix]);
				}
				setSelection(newSelection);
			},
			getMaxMinSelectionIndices = () => {
				let items,
					currentlySelectedRowIndices = [];
				if (Repository) {
					items = Repository.getEntitiesOnPage();
				} else {
					items = data;
				}
				_.each(items, (item, ix) => {
					if (isInSelection(item)) {
						currentlySelectedRowIndices.push(ix);
					}
				});
				const
					max = Math.max(...currentlySelectedRowIndices),
					min = Math.min(...currentlySelectedRowIndices);
				
				return { items, max, min, };
			},
			selectRangeTo = (item) => {
				// Select above max or below min to this one
				const
					currentSelectionLength = selection.length,
					index = getIndexOfSelectedItem(item);
				let newSelection = _.clone(selection); // so we get a new object, so descendants rerender

				if (currentSelectionLength) {
					const { items, max, min, } = getMaxMinSelectionIndices();
					let i,
						itemAtIx;
					if (max < index) {
						// all other selections are below the current;
						// Range is from max+1 up to index
						for (i = max +1; i < index; i++) {
							itemAtIx = items[i];
							newSelection.push(itemAtIx);
						}
					} else if (min > index) {
						// all other selections are above the current;
						// Range is from min-1 down to index
						for (i = min -1; i > index; i--) {
							itemAtIx = items[i];
							newSelection.push(itemAtIx);
						}
					}
				}
				newSelection.push(item);
				setSelection(newSelection);
			},
			isInSelection = (item) => {
				if (Repository) {
					return inArray(item, selection);
				}

				const
					idIx = fields.indexOf(idField),
					found = _.find(selection, (selectedItem) => {
						return selectedItem[idIx] === item[idIx];
					});
				return !!found;
			},
			getIndexOfSelectedItem = (item) => {
				// Gets ix of entity on page, or element in data array
				if (Repository) {
					const entities = Repository.getEntitiesOnPage();
					return entities.indexOf(item);
				}
				
				const idIx = fields.indexOf(idField);
				let found;
				_.each(data, (datum, ix) => {
					if (datum[idIx] === item[idIx]) {
						found = ix;
						return false; // break loop
					}
				});
				return found;
			},
			getIdFromSelection = () => {
				if (!selection[0]) {
					return null;
				}
				const values = _.map(selection, (item) => {
					if (Repository) {
						return item.id;
					}
					const ix = fields.indexOf(idField);
					return item[ix];
				});
				if (values.length === 1) {
					return values[0];
				}
				return values;
			},
			getDisplayFromSelection = (selection) => {
				if (!selection[0]) {
					return '';
				}

				return _.map(selection, (item) => {
							if (Repository) {
								return item.displayValue;
							}
							const ix = fields.indexOf(displayField);
							return item[ix];
						})
						.join(', ');
			};

		useEffect(() => {
			let newSelection = [];
			if (!Repository) {
				// set up plain data
				if (_.isEmpty(selection) && autoSelectFirstItem) {
					newSelection = data[0] ? [data[0]] : [];
				}
			} else {
				// set up @onehat/data repository
				if (_.isEmpty(selection) && autoSelectFirstItem) {
					const entitiesOnPage = Repository.getEntitiesOnPage();
					newSelection = entitiesOnPage[0] ? [entitiesOnPage[0]] : [];
				}
			}
			if (autoSelectFirstItem) {
				setSelection(newSelection);
			}
			setIsReady(true);
		}, []);

		if (!isReady) {
			return null;
		}

		return <WrappedComponent
					{...props}
					selection={selection}
					setSelection={setSelection}
					selectionMode={selectionMode}
					selectNext={selectNext}
					selectPrev={selectPrev}
					removeFromSelection={removeFromSelection}
					addToSelection={addToSelection}
					selectRangeTo={selectRangeTo}
					isInSelection={isInSelection}
					getIdFromSelection={getIdFromSelection}
					getDisplayFromSelection={getDisplayFromSelection}
				/>;
	};
}