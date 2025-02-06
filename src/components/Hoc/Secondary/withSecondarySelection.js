import { forwardRef, useState, useEffect, useRef, } from 'react';
import {
	SELECTION_MODE_SINGLE,
	SELECTION_MODE_MULTI,
	SELECT_UP,
	SELECT_DOWN,
} from '../../../Constants/Selection.js';
import useForceUpdate from '../../../Hooks/useForceUpdate.js';
import inArray from '../../../Functions/inArray.js';
import _ from 'lodash';

// NOTE: This is a modified version of @onehat/ui/src/Hoc/withSelection

export default function withSelection(WrappedComponent) {
	return forwardRef((props, ref) => {

		if (props.secondaryDisableWithSelection) {
			return <WrappedComponent {...props} />;
		}

		if (props.secondarySetSelection) {
			// bypass everything, since we're already using withSelection() in hierarchy.
			// For example, Combo has withSelection(), and intenally it uses Grid which also has withSelection(),
			// but we only need it defined once for the whole thing.
			return <WrappedComponent {...props} />;
		}

		const {
				secondarySelection,
				secondaryDefaultSelection,
				secondaryOnChangeSelection,
				secondarySelectionMode = SELECTION_MODE_SINGLE, // SELECTION_MODE_MULTI, SELECTION_MODE_SINGLE
				secondaryAutoSelectFirstItem = false,
				fireEvent,

				// withComponent
				self,

				// withSecondaryValue
				secondaryValue,
				secondarySetValue,

				// withSecondaryData
				SecondaryRepository,
				secondaryData,
				secondaryIdIx,
				secondaryDisplayIx,
			} = props,
			usesWithValue = !!secondarySetValue,
			initialSelection = secondarySelection || secondaryDefaultSelection || [],
			forceUpdate = useForceUpdate(),
			secondarySelectionRef = useRef(initialSelection),
			[isReady, setIsReady] = useState(secondarySelection || false), // if secondarySelection is already defined, or secondaryValue is not null and we don't need to load repository, it's ready
			secondarySetSelection = (secondarySelection) => {
				if (_.isEqual(secondarySelection, secondaryGetSelection())) {
					return;
				}

				secondarySelectionRef.current = secondarySelection;
				if (secondaryOnChangeSelection) {
					secondaryOnChangeSelection(secondarySelection);
				}
				if (fireEvent) {
					fireEvent('secondaryChangeSelection', secondarySelection);
				}
				forceUpdate();
			},
			secondaryGetSelection = () => {
				return secondarySelectionRef.current;
			},
			secondarySelectPrev = () => {
				secondarySelectDirection(SELECT_UP);
			},
			secondarySelectNext = () => {
				secondarySelectDirection(SELECT_DOWN);
			},
			secondaryAddPrevToSelection = () => {
				secondarySelectDirection(SELECT_UP, true);
			},
			secondaryAddNextToSelection = () => {
				secondarySelectDirection(SELECT_DOWN, true);
			},
			secondarySelectDirection = (which, isAdd = false) => {
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
						secondaryAddToSelection(items[newIx]);
					} else {
						secondarySetSelection([items[newIx]]);
					}
				}
			},
			secondaryAddToSelection = (item) => {
				const newSelection = _.clone(secondaryGetSelection()); // so we get a new object, so descendants rerender
				newSelection.push(item);
				secondarySetSelection(newSelection);
			},
			secondaryRemoveFromSelection = (item) => {
				let newSelection = [];
				if (SecondaryRepository) {
					newSelection = _.remove(secondaryGetSelection(), (sel) => sel !== item);
				} else {
					newSelection = _.remove(secondaryGetSelection(), (sel) => sel[secondaryIdIx] !== item[secondaryIdIx]);
				}
				secondarySetSelection(newSelection);
			},
			secondaryDeselectAll = () => {
				if (!_.isEmpty(secondaryGetSelection())) {
					secondarySetSelection([]);
				}
			},
			secondaryRefreshSelection = () => {
				// When Repository reloads, the entities get destroyed.
				// Loop through these destroyed entities and see if new ones exist with same ids.
				// If so, select these new ones.
				// That way, after a load event, we'll keep the same selection, if possible.
				const
					newSelection = [],
					ids = _.map(secondaryGetSelection(), (item) => item.id);
				_.each(ids, (id) => {
					const found = SecondaryRepository.getById(id);
					if (found) {
						newSelection.push(found);
					}
				});
				secondarySetSelection(newSelection);
			},
			getMaxMinSelectionIndices = () => {
				let items,
					currentlySelectedRowIndices = [];
				if (SecondaryRepository) {
					items = SecondaryRepository.getEntitiesOnPage();
				} else {
					items = secondaryData;
				}
				_.each(items, (item, ix) => {
					if (secondaryIsInSelection(item)) {
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
			secondarySelectRangeTo = (item) => {
				// Select above max or below min to this one
				const
					currentSelectionLength = secondaryGetSelection().length,
					index = getIndexOfSelectedItem(item);
				let newSelection = _.clone(secondaryGetSelection()); // so we get a new object, so descendants rerender

				if (currentSelectionLength) {
					const { items, max, min, } = getMaxMinSelectionIndices();
					let i,
						itemAtIx;
					if (max < index) {
						// all other secondarySelections are below the current;
						// Range is from max+1 up to index
						for (i = max +1; i < index; i++) {
							itemAtIx = items[i];
							newSelection.push(itemAtIx);
						}
					} else if (min > index) {
						// all other secondarySelections are above the current;
						// Range is from min-1 down to index
						for (i = min -1; i > index; i--) {
							itemAtIx = items[i];
							newSelection.push(itemAtIx);
						}
					}
				}
				newSelection.push(item);
				secondarySetSelection(newSelection);
			},
			secondaryIsInSelection = (item) => {
				if (SecondaryRepository) {
					return inArray(item, secondaryGetSelection());
				}

				const found = _.find(secondaryGetSelection(), (selectedItem) => {
						return selectedItem[secondaryIdIx] === item[secondaryIdIx];
					});
				return !!found;
			},
			getIndexOfSelectedItem = (item) => {
				// Gets ix of entity on page, or element in secondaryData array
				if (SecondaryRepository) {
					const entities = SecondaryRepository.getEntitiesOnPage();
					return entities.indexOf(item);
				}
				
				let found;
				_.each(secondaryData, (datum, ix) => {
					if (datum[secondaryIdIx] === item[secondaryIdIx]) {
						found = ix;
						return false; // break loop
					}
				});
				return found;
			},
			secondaryGetIdsFromLocalSelection = () => {
				if (!secondaryGetSelection()[0]) {
					return null;
				}
				const secondaryValues = _.map(secondaryGetSelection(), (item) => {
					if (SecondaryRepository) {
						return item.id;
					}
					return item[secondaryIdIx];
				});
				if (secondaryValues.length === 1) {
					return secondaryValues[0];
				}
				return secondaryValues;
			},
			secondaryGetDisplayValuesFromLocalSelection = (secondarySelection) => {
				if (!secondarySelection[0]) {
					return '';
				}

				return _.map(secondarySelection, (item) => {
							if (SecondaryRepository) {
								return item.displayValue;
							}
							return item[secondaryDisplayIx];
						})
						.join(', ');
			},
			conformValueToLocalSelection = () => {
				if (!secondarySetValue) {
					return;
				}
				
				const localValue = secondaryGetIdsFromLocalSelection();
				if (!_.isEqual(localValue, secondaryValue)) {
					secondarySetValue(localValue);
				}
			},
			conformSelectionToValue = async () => {
				let newSelection = [];
				if (SecondaryRepository) {
					if (SecondaryRepository.isLoading) {
						await SecondaryRepository.waitUntilDoneLoading();
					}
					// Get entity or entities that match secondaryValue
					if ((_.isArray(secondaryValue) && !_.isEmpty(secondaryValue)) || !!secondaryValue) {
						if (_.isArray(secondaryValue)) {
							newSelection = SecondaryRepository.getBy((entity) => inArray(entity.id, secondaryValue));
						} else {
							let found = SecondaryRepository.getById(secondaryValue);
							if (found) {
								newSelection.push(found);
							// } else if (SecondaryRepository?.isRemote && SecondaryRepository?.entities.length) {

							// 	// Value cannot be found in SecondaryRepository, but actually exists on server
							// 	// Try to get this secondaryValue from the server directly
							// 	SecondaryRepository.filter(SecondaryRepository.schema.model.idProperty, secondaryValue);
							// 	await SecondaryRepository.load();
							// 	found = SecondaryRepository.getById(secondaryValue);
							// 	if (found) {
							// 		newSelection.push(found);
							// 	}

							}
						}
					}
				} else {
					// Get secondaryData item or items that match secondaryValue
					if (!_.isNil(secondaryValue) && (_.isBoolean(secondaryValue) || _.isNumber(secondaryValue) || !_.isEmpty(secondaryValue))) {
						let currentValue = secondaryValue;
						if (!_.isArray(currentValue)) {
							currentValue = [currentValue];
						}
						_.each(currentValue, (val) => {
							// Search through secondaryData
							const found = _.find(secondaryData, (item) => {
								if (_.isString(item[secondaryIdIx]) && _.isString(val)) {
									return item[secondaryIdIx].toLowerCase() === val.toLowerCase();
								}
								return item[secondaryIdIx] === val;
							});
							if (found) {
								newSelection.push(found);
							}
						});
					}
				}

				if (!_.isEqual(newSelection, secondaryGetSelection())) {
					secondarySetSelection(newSelection);
				}
			};

		if (SecondaryRepository) {
			useEffect(() => {
				SecondaryRepository.on('load', secondaryRefreshSelection);
				return () => {
					SecondaryRepository.off('load', secondaryRefreshSelection);
				};
			}, []);
		}

		useEffect(() => {

			(async () => {

				if (usesWithValue && SecondaryRepository?.isRemote 
					&& !SecondaryRepository.isAutoLoad && !SecondaryRepository.isLoaded && !SecondaryRepository.isLoading && (!_.isNil(secondaryValue) || !_.isEmpty(secondarySelection)) || secondaryAutoSelectFirstItem) {
					// on initialization, we can't conformSelectionToValue if the repository is not yet loaded, 
					// so first load repo, then conform to secondaryValue
					await SecondaryRepository.load();
				}

				if (!_.isNil(secondaryValue)) {

					await conformSelectionToValue();

				} else if (!_.isEmpty(secondarySelection)) {

					conformValueToLocalSelection();

				} else if (secondaryAutoSelectFirstItem) {
					let newSelection = [];
					if (SecondaryRepository) {
						const entitiesOnPage = SecondaryRepository.getEntitiesOnPage();
						newSelection = entitiesOnPage[0] ? [entitiesOnPage[0]] : [];
					} else {
						newSelection = secondaryData[0] ? [secondaryData[0]] : [];
					}
					secondarySetSelection(newSelection);
				}

				setIsReady(true);

			})();

		}, [secondaryValue]);

		if (self) {
			self.secondarySelection = secondaryGetSelection();
			self.secondarySetSelection = secondarySetSelection;
			self.secondarySelectPrev = secondarySelectPrev;
			self.secondarySelectNext = secondarySelectNext;
			self.secondaryAddPrevToSelection = secondaryAddPrevToSelection;
			self.secondaryAddNextToSelection = secondaryAddNextToSelection;
			self.secondaryAddToSelection = secondaryAddToSelection;
			self.secondaryRemoveFromSelection = secondaryRemoveFromSelection;
			self.secondaryDeselectAll = secondaryDeselectAll;
			self.secondarySelectRangeTo = secondarySelectRangeTo;
			self.secondaryIsInSelection = secondaryIsInSelection;
			self.secondaryGetIdsFromLocalSelection = secondaryGetIdsFromLocalSelection;
			self.secondaryGetDisplayValuesFromSelection = secondaryGetDisplayValuesFromLocalSelection;
		}

		if (usesWithValue) {
			useEffect(() => {
				if (!isReady) {
					return () => {};
				}
	
				conformSelectionToValue();
	
			}, [secondaryValue]);
	
			useEffect(() => {
				if (!isReady) {
					return () => {};
				}
	
				conformValueToLocalSelection();
				
			}, [secondarySelection]);
		}

		if (!isReady) {
			return null;
		}
		
		return <WrappedComponent
					{...props}
					ref={ref}
					secondaryDisableWithSelection={false}
					secondarySelection={secondaryGetSelection()}
					secondaryGetSelection={secondaryGetSelection}
					secondarySetSelection={secondarySetSelection}
					secondarySelectionMode={secondarySelectionMode}
					secondarySelectPrev={secondarySelectPrev}
					secondarySelectNext={secondarySelectNext}
					secondaryAddNextToSelection={secondaryAddNextToSelection}
					secondaryAddPrevToSelection={secondaryAddPrevToSelection}
					secondaryRemoveFromSelection={secondaryRemoveFromSelection}
					secondaryAddToSelection={secondaryAddToSelection}
					secondaryDeselectAll={secondaryDeselectAll}
					secondarySelectRangeTo={secondarySelectRangeTo}
					secondaryIsInSelection={secondaryIsInSelection}
					secondaryGetIdsFromSelection={secondaryGetIdsFromLocalSelection}
					secondaryGetDisplayValuesFromSelection={secondaryGetDisplayValuesFromLocalSelection}
				/>;
	});
}