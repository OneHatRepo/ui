import { useState, useEffect, } from 'react';
import {
	SELECTION_MODE_SINGLE,
	SELECTION_MODE_MULTI,
	SELECT_UP,
	SELECT_DOWN,
} from '../../Constants/Selection.js';
import inArray from '../../Functions/inArray.js';
import _ from 'lodash';

export default function withSelection(WrappedComponent) {
	return (props) => {

		if (props.setSelection) {
			// bypass everything, since we're already using withSelection() in hierarchy.
			// For example, Combo has withSelection(), and intenally it uses Grid which also has withSelection(),
			// but we only need it defined once for the whole thing.
			return <WrappedComponent {...props} />;
		}

		const
			{
				selection,
				defaultSelection,
				onChangeSelection,
				selectionMode = SELECTION_MODE_SINGLE, // SELECTION_MODE_MULTI, SELECTION_MODE_SINGLE
				autoSelectFirstItem = false,
				fireEvent,

				// withValue
				value,
				setValue,

				// withData
				Repository,
				data,
				idIx,
				displayIx,
			} = props,
			usesWithValue = !!setValue,
			[localSelection, setLocalSelection] = useState(selection || defaultSelection || []),
			[isReady, setIsReady] = useState(selection || false), // if selection is already defined, or value is not null and we don't need to load repository, it's ready
			setSelection = (selection) => {
				setLocalSelection(selection);
				if (onChangeSelection) {
					onChangeSelection(selection);
				}
				if (fireEvent) {
					fireEvent('changeSelection', selection);
				}
			},
			selectNext = () => {
				selectDirection(SELECT_DOWN);
			},
			selectPrev = () => {
				selectDirection(SELECT_UP);
			},
			selectDirection = (which) => {
				const { items, max, min, noSelection, } = getMaxMinSelectionIndices();
				let newIx;
				if (which === SELECT_DOWN) {
					if (noSelection || max === items.length -1) {
						// select first
						newIx = 0;
					} else {
						newIx = max +1;
					}
				} else if (which === SELECT_UP) {
					if (noSelection || min === 0) {
						// select last
						newIx = items.length -1;
					} else {
						newIx = min -1;
					}
				}
				if (items[newIx]) {
					setSelection([items[newIx]]);
				}
			},
			addToSelection = (item) => {
				let newSelection = [];
				newSelection = _.clone(localSelection); // so we get a new object, so descendants rerender
				newSelection.push(item);
				setSelection(newSelection);
			},
			removeFromSelection = (item) => {
				let newSelection = [];
				if (Repository) {
					newSelection = _.remove(localSelection, (sel) => sel !== item);
				} else {
					newSelection = _.remove(localSelection, (sel) => sel[idIx] !== item[idIx]);
				}
				setSelection(newSelection);
			},
			deselectAll = () => {
				if (!_.isEmpty(localSelection)) {
					setSelection([]);
				}
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
				if (currentlySelectedRowIndices.length === 0) {
					return { items, noSelection: true, };
				}
				const
					max = Math.max(...currentlySelectedRowIndices),
					min = Math.min(...currentlySelectedRowIndices);
				
				return { items, max, min, noSelection: false, };
			},
			selectRangeTo = (item) => {
				// Select above max or below min to this one
				const
					currentSelectionLength = localSelection.length,
					index = getIndexOfSelectedItem(item);
				let newSelection = _.clone(localSelection); // so we get a new object, so descendants rerender

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
					return inArray(item, localSelection);
				}

				const found = _.find(localSelection, (selectedItem) => {
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
				if (!localSelection[0]) {
					return null;
				}
				const values = _.map(localSelection, (item) => {
					if (Repository) {
						return item.id;
					}
					return item[idIx];
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
							return item[displayIx];
						})
						.join(', ');
			},
			conformValueToSelection = () => {
				if (!setValue) {
					return;
				}
				// Adjust the value to match the selection
				const localValue = getIdFromSelection();
				if (!_.isEqual(localValue, value)) {
					setValue(localValue);
				}
			},
			conformSelectionToValue = () => {
				// adjust the selection to match the value
				let newSelection = [];
				if (Repository) {
					// Get entity or entities that match value
					if ((_.isArray(value) && !_.isEmpty(value)) || !!value) {
						if (_.isArray(value)) {
							newSelection = Repository.getBy((entity) => inArray(entity.id, value));
						} else {
							const found = Repository.getById(value);
							if (found) {
								newSelection.push(found);
							}
						}
					}
				} else {
					// Get data item or items that match value
					if (!_.isNil(value) && (_.isBoolean(value) || _.isNumber(value) || !_.isEmpty(value))) {
						let currentValue = value;
						if (!_.isArray(currentValue)) {
							currentValue = [currentValue];
						}
						_.each(currentValue, (val) => {
							// Search through data
							const found = _.find(data, (item) => {
								if (_.isString(item[idIx]) && _.isString(val)) {
									return item[idIx].toLowerCase() === val.toLowerCase();
								}
								return item[idIx] === val;
							});
							if (found) {
								newSelection.push(found);
							}
						});
					}
				}

				if (!_.isEqual(newSelection, localSelection)) {
					setSelection(newSelection);
				}
			};

		useEffect(() => {
			if (isReady) {
				return () => {};
			}

			(async () => {

				if (Repository && usesWithValue && !Repository.isLoaded && Repository.isRemote && !Repository.isAutoLoad && !Repository.isLoading) {
					// on initialization, we can't conformSelectionToValue if the repository is not yet loaded, 
					// so first load repo, then conform to value
					await Repository.load();
				}

				if (usesWithValue && !_.isNil(value)) {

					conformSelectionToValue();

				} else if (autoSelectFirstItem) {
					let newSelection = [];
					if (Repository) {
						const entitiesOnPage = Repository.getEntitiesOnPage();
						newSelection = entitiesOnPage[0] ? [entitiesOnPage[0]] : [];
					} else {
						newSelection = data[0] ? [data[0]] : [];
					}
					setSelection(newSelection);
				}

				setIsReady(true);

			})();

		}, []);


		if (usesWithValue) {
			useEffect(() => {
				if (!isReady) {
					return () => {};
				}
	
				conformSelectionToValue();
	
			}, [value, isReady]);
	
			useEffect(() => {
				if (!isReady) {
					return () => {};
				}
	
				conformValueToSelection();
			}, [selection, isReady]);
		}

		if (!isReady) {
			return null;
		}
		
		return <WrappedComponent
					{...props}
					selection={localSelection}
					setSelection={setSelection}
					selectionMode={selectionMode}
					selectNext={selectNext}
					selectPrev={selectPrev}
					removeFromSelection={removeFromSelection}
					addToSelection={addToSelection}
					deselectAll={deselectAll}
					selectRangeTo={selectRangeTo}
					isInSelection={isInSelection}
					getIdFromSelection={getIdFromSelection}
					getDisplayFromSelection={getDisplayFromSelection}
				/>;
	};
}