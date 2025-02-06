import { forwardRef, useState, useEffect, useRef, } from 'react';
import {
	SELECTION_MODE_SINGLE,
	SELECTION_MODE_MULTI,
	SELECT_UP,
	SELECT_DOWN,
} from '../../Constants/Selection.js';
import useForceUpdate from '../../Hooks/useForceUpdate.js';
import inArray from '../../Functions/inArray.js';
import _ from 'lodash';

export default function withSelection(WrappedComponent) {
	return forwardRef((props, ref) => {

		if (props.disableWithSelection) {
			return <WrappedComponent {...props} ref={ref} />;
		}

		if (props.setSelection) {
			// bypass everything, since we're already using withSelection() in hierarchy.
			// For example, Combo has withSelection(), and intenally it uses Grid which also has withSelection(),
			// but we only need it defined once for the whole thing.
			return <WrappedComponent {...props} ref={ref} />;
		}

		const {
				selection,
				defaultSelection,
				onChangeSelection,
				selectionMode = SELECTION_MODE_SINGLE, // SELECTION_MODE_MULTI, SELECTION_MODE_SINGLE
				autoSelectFirstItem = false,
				fireEvent,

				// withComponent
				self,

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
			initialSelection = selection || defaultSelection || [],
			forceUpdate = useForceUpdate(),
			selectionRef = useRef(initialSelection),
			[isReady, setIsReady] = useState(selection || false), // if selection is already defined, or value is not null and we don't need to load repository, it's ready
			setSelection = (selection) => {
				if (_.isEqual(selection, getSelection())) {
					return;
				}

				selectionRef.current = selection;
				if (onChangeSelection) {
					onChangeSelection(selection);
				}
				if (fireEvent) {
					fireEvent('changeSelection', selection);
				}
				forceUpdate();
			},
			getSelection = () => {
				return selectionRef.current;
			}
			selectPrev = () => {
				selectDirection(SELECT_UP);
			},
			selectNext = () => {
				selectDirection(SELECT_DOWN);
			},
			addPrevToSelection = () => {
				selectDirection(SELECT_UP, true);
			},
			addNextToSelection = () => {
				selectDirection(SELECT_DOWN, true);
			},
			selectDirection = (which, isAdd = false) => {
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
					if (isAdd) {
						addToSelection(items[newIx]);
					} else {
						setSelection([items[newIx]]);
					}
				}
			},
			addToSelection = (item) => {
				const newSelection = _.clone(getSelection()); // so we get a new object, so descendants rerender
				newSelection.push(item);
				setSelection(newSelection);
			},
			removeFromSelection = (item) => {
				let newSelection = [];
				if (Repository) {
					newSelection = _.remove(getSelection(), (sel) => sel !== item);
				} else {
					newSelection = _.remove(getSelection(), (sel) => sel[idIx] !== item[idIx]);
				}
				setSelection(newSelection);
			},
			deselectAll = () => {
				if (!_.isEmpty(getSelection())) {
					setSelection([]);
				}
			},
			refreshSelection = () => {
				// When Repository reloads, the entities get destroyed.
				// Loop through these destroyed entities and see if new ones exist with same ids.
				// If so, select these new ones.
				// That way, after a load event, we'll keep the same selection, if possible.
				const
					newSelection = [],
					ids = _.map(getSelection(), (item) => item.id);
				_.each(ids, (id) => {
					const found = Repository.getById(id);
					if (found) {
						newSelection.push(found);
					}
				});
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
					currentSelectionLength = getSelection().length,
					index = getIndexOfSelectedItem(item);
				let newSelection = _.clone(getSelection()); // so we get a new object, so descendants rerender

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
					return inArray(item, getSelection());
				}

				const found = _.find(getSelection(), (selectedItem) => {
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
			getIdsFromLocalSelection = () => {
				if (!getSelection()[0]) {
					return null;
				}
				const values = _.map(getSelection(), (item) => {
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
			getDisplayValuesFromSelection = (selection) => {
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
			conformValueToLocalSelection = () => {
				if (!setValue) {
					return;
				}
				
				const localValue = getIdsFromLocalSelection();
				if (!_.isEqual(localValue, value)) {
					setValue(localValue);
				}
			},
			conformSelectionToValue = async () => {
				let newSelection = [];
				if (Repository) {
					if (Repository.isLoading) {
						await Repository.waitUntilDoneLoading();
					}
					// Get entity or entities that match value
					if ((_.isArray(value) && !_.isEmpty(value)) || !!value) {
						if (_.isArray(value)) {
							newSelection = Repository.getBy((entity) => inArray(entity.id, value));
						} else {
							let found = Repository.getById(value);
							if (found) {
								newSelection.push(found);
							// } else if (Repository?.isRemote && Repository?.entities.length) {

							// 	// Value cannot be found in Repository, but actually exists on server
							// 	// Try to get this value from the server directly
							// 	Repository.filter(Repository.schema.model.idProperty, value);
							// 	await Repository.load();
							// 	found = Repository.getById(value);
							// 	if (found) {
							// 		newSelection.push(found);
							// 	}

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

				if (!_.isEqual(newSelection, getSelection())) {
					setSelection(newSelection);
				}
			};

		if (Repository) {
			useEffect(() => {
				Repository.on('load', refreshSelection);
				return () => {
					Repository.off('load', refreshSelection);
				};
			}, []);
		}

		useEffect(() => {

			(async () => {

				if (usesWithValue && Repository?.isRemote 
					&& !Repository.isAutoLoad && !Repository.isLoaded && !Repository.isLoading && (!_.isNil(value) || !_.isEmpty(selection)) || autoSelectFirstItem) {
					// on initialization, we can't conformSelectionToValue if the repository is not yet loaded, 
					// so first load repo, then conform to value
					await Repository.load();
				}

				if (!_.isNil(value)) {

					await conformSelectionToValue();

				} else if (!_.isEmpty(selection)) {

					conformValueToLocalSelection();

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

		}, [value]);

		if (self) {
			self.selection = getSelection();
			self.setSelection = setSelection;
			self.selectPrev = selectPrev;
			self.selectNext = selectNext;
			self.addPrevToSelection = addPrevToSelection;
			self.addNextToSelection = addNextToSelection;
			self.addToSelection = addToSelection;
			self.removeFromSelection = removeFromSelection;
			self.deselectAll = deselectAll;
			self.selectRangeTo = selectRangeTo;
			self.isInSelection = isInSelection;
			self.getIdsFromLocalSelection = getIdsFromLocalSelection;
			self.getDisplayValuesFromSelection = getDisplayValuesFromSelection;
		}

		if (usesWithValue) {
			useEffect(() => {
				if (!isReady) {
					return () => {};
				}
	
				conformSelectionToValue();
	
			}, [value]);
	
			useEffect(() => {
				if (!isReady) {
					return () => {};
				}
	
				conformValueToLocalSelection();
				
			}, [selection]);
		}

		if (!isReady) {
			return null;
		}
		
		return <WrappedComponent
					{...props}
					ref={ref}
					disableWithSelection={false}
					selection={getSelection()}
					getSelection={getSelection}
					setSelection={setSelection}
					selectionMode={selectionMode}
					selectPrev={selectPrev}
					selectNext={selectNext}
					addNextToSelection={addNextToSelection}
					addPrevToSelection={addPrevToSelection}
					removeFromSelection={removeFromSelection}
					addToSelection={addToSelection}
					deselectAll={deselectAll}
					selectRangeTo={selectRangeTo}
					isInSelection={isInSelection}
					getIdsFromSelection={getIdsFromLocalSelection}
					getDisplayValuesFromSelection={getDisplayValuesFromSelection}
				/>;
	});
}