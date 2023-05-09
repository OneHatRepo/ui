import { useState, useEffect, } from 'react';
import {
	Column,
	Modal,
	Row,
	Text,
} from 'native-base';
import inArray from '../../Functions/inArray.js';
import getComponentFromType from '../../Functions/getComponentFromType.js';
import IconButton from '../Buttons/IconButton.js';
import FormPanel from '../Panel/FormPanel.js';
import Ban from '../Icons/Ban.js';
import Gear from '../Icons/Gear.js';
import Toolbar from '../Toolbar/Toolbar.js';
import UiGlobals from '../../UiGlobals.js';
import _ from 'lodash';

// Filters only work with Repository; not data array

// Yet to do:
// - Save user choice in cookie for next time this component loads
// 
// Model defaultFilters should adjust to this new arrangement

export default function withFilters(WrappedComponent) {
	return (props) => {
		const {
				// config
				useFilters = false,
				searchAllText = true,
				showLabels = true,
				showFilterSelector = true,
				defaultFilters = [], // likely a list of field names, possibly could be of shape below
				customFilters = [], // of shape: { title, type, field, value, getRepoFilters(value) }
				minFilters = 3,
				maxFilters = 6,

				// withData
				Repository,
			} = props;

		let modal = null,
			topToolbar = null;
		
		if (useFilters && Repository) {

			const
				// aliases
				{
					defaultFilters: modelDefaultFilters,
					filterTypes: modelFilterTypes,
					titles: modelTitles,
					virtualFields: modelVirtualFields,
					excludeFields: modelExcludeFields,
					filteringDisabled: modelFilteringDisabled,
				} = Repository.getSchema().model,

				// determine the starting filters
				startingFilters = !_.isEmpty(customFilters) ? customFilters : // custom filters override component filters
								!_.isEmpty(defaultFilters) ? defaultFilters : // component filters override model filters
								!_.isEmpty(modelDefaultFilters) ? modelDefaultFilters : [],
				isUsingCustomFilters = startingFilters === customFilters,
				[isReady, setIsReady] = useState(false),
				[isFilterSelectorShown, setIsFilterSelectorShown] = useState(false),
				getFormattedFilter = (filter) => {
					let formatted = null;
					if (_.isString(filter)) {
						const field = filter;
						formatted = {
							field,
							title: modelTitles[field],
							type: modelFilterTypes[field],
							value: null, // value starts as null
						};
					} else if (_.isPlainObject(filter)) {
						// already formatted
						formatted = filter;
					}
					return formatted;
				};

			let formattedStartingFilters = [],
				startingSlots = [];
			if (!isReady) {
				// Generate initial starting state
				if (!isUsingCustomFilters && searchAllText) {
					formattedStartingFilters.push({ field: 'q', title: 'Search all text fields', type: 'Input', value: null, });
				}
				_.each(startingFilters, (filter) => {
					const
						formattedFilter = getFormattedFilter(filter),
						field = formattedFilter.field;
					formattedStartingFilters.push(formattedFilter);
					if (!isUsingCustomFilters) {
						startingSlots.push(field);
					}
				});
				if (startingSlots.length < minFilters) {
					for (let i = startingSlots.length; i < minFilters; i++) {
						startingSlots.push(null);
					}
				}
			}

			const
				[filters, setFilters] = useState(formattedStartingFilters), // array of formatted filters
				[slots, setSlots] = useState(startingSlots), // array of field names user is currently filtering on; blank slots have a null entry in array
				[modalFilters, setModalFilters] = useState([]),
				[modalSlots, setModalSlots] = useState([]),
				[previousFilterNames, setPreviousFilterNames] = useState([]), // names of filters the repository used last query
				canAddSlot = (() => {
					let canAdd = true;
					if (!!maxFilters && modalSlots.length >= maxFilters) {
						canAdd = false; // maxFilters has been reached
					}
					if (canAdd) {
						_.each(modalSlots, (field) => {
							if (_.isNil(field)) {
								canAdd = false; // at least one slot has no selected field to filter
								return false;
							}
						});
					}
					return canAdd;
				})(),
				canDeleteSlot = modalSlots.length > minFilters,
				onAddSlot = () => {
					if (!canAddSlot) {
						return;
					}
					const newSlots = _.clone(modalSlots);
					newSlots.push(null);
					setModalSlots(newSlots);
				},
				onDeleteSlot = () => {
					if (!canDeleteSlot) {
						return;
					}
					const
						newFilters = _.clone(modalFilters),
						newSlots = _.clone(modalSlots);
					newFilters.pop();
					newSlots.pop();
					setModalFilters(newFilters);
					setModalSlots(newSlots);
				},
				onFilterChangeValue = (field, value) => {
					// handler for when a filter value changes
					const newFilters = [];
					_.each(filters, (filter) => {
						if (filter.field === field) {
							filter.value = value;
						}
						newFilters.push(filter);
					});
					setFilters(newFilters);
				},
				onClearFilters = () => {
					// Clears values for all active filters
					const newFilters = [];
					_.each(filters, (filter) => {
						filter.value = null;
						newFilters.push(filter);
					});
					setFilters(newFilters);
				},
				getFilterByField = (field) => {
					return _.find(filters, (filter) => {
						return filter.field === field;
					});
				},
				getFilterValue = (field) => {
					const filter = getFilterByField(field);
					return filter?.value;
				},
				getFilterType = (field) => {
					// Finds filter type for the field name, from active filters
					const filter = getFilterByField(field);
					return filter?.type;
				},
				getIsFilterRange = (field) => {
					// determines if filter is a "range" filter
					const filterType = getFilterType(field);
					return inArray(filterType, ['NumberRange', 'DateRange']);
				},
				renderFilters = () => {
					const
						filterProps = {
							mx: 1,
						};
					let filterElements = [];
					_.each(filters, (filter, ix) => {
						let Element,
							elementProps = {};
						const {
								field,
								title,
								type: filterType,
								...propsToPass
							} = filter;

						if (_.isString(filterType)) {
							Element = getComponentFromType(filterType);
							if (filterType === 'Input') {
								elementProps.autoSubmit = true;
							}
						} else if (_.isPlainObject(filterType)) {
							const {
									type,
									...p
								} = filterType;
							elementProps = p;
							Element = getComponentFromType(type);
							if (type === 'Input') {
								elementProps.autoSubmit = true;
							}
						}
						if (field === 'q') {
							elementProps.flex = 1;
							elementProps.minWidth = 100;
						}

						const tooltip = filter.tooltip || filter.title || modelTitles[filter.field];
						let filterElement = <Element
												key={'filter-' + field}
												tooltip={tooltip}
												placeholder={tooltip}
												value={getFilterValue(field)}
												onChangeValue={(value) => onFilterChangeValue(field, value)}
												{...filterProps}
												{...elementProps}
												{...propsToPass}
											/>;
						
						// Add divider props
						if (showLabels && field !== 'q') {
							const dividerProps = {
								// borderLeftWidth: 1,
								// borderLeftColor: '#fff',
								borderRightWidth: 1,
								borderRightColor: '#fff',
								px: 2,
							};
							filterElement = <Row key={'label-' + ix} alignItems="center" {...dividerProps}>
												<Text ml={2} mr={1} fontSize={UiGlobals.styles.FILTER_LABEL_FONTSIZE}>{modelTitles[field] || title}</Text>
												{filterElement}
											</Row>;
						}
						filterElements.push(filterElement);
					});
					if (isUsingCustomFilters) {
						filterElements = [ <Row flex={1} justifyContent="flex-start">{filterElements}</Row> ]; // This allows all the filters to sit flush-left
					}
					return filterElements;
				};

			useEffect(() => {
				// Whenever the filters change in some way, make repository conform to these new filters
				const newRepoFilters = [];

				if (isUsingCustomFilters) {
					_.each(filters, (filter) => {
						const repoFiltersFromFilter = filter.getRepoFilters(filter.value);
						_.each(repoFiltersFromFilter, (repoFilter) => { // one custom filter might generate multiple filters for the repository
							newRepoFilters.push(repoFilter);
						});
					});
				} else {
					const newFilterNames = [];
					_.each(filters, (filter) => {
						const {
								field,
								value,
							} = filter,
							isFilterRange = getIsFilterRange(field);
						if (isFilterRange) {
							if (!!value) {
								const
									highField = field + ' <=',
									lowField = field + ' >=',
									highValue = value.high,
									lowValue = value.low;
								newFilterNames.push(highField);
								newFilterNames.push(lowField);
								newRepoFilters.push({ name: highField, value: highValue, });
								newRepoFilters.push({ name: lowField, value: lowValue, });
							}
						} else {
							newFilterNames.push(field);
							newRepoFilters.push({ name: field, value, });
						}
					});

					// Go through previousFilterNames and see if any are no longer used. 
					_.each(previousFilterNames, (name) => {
						if (!inArray(name, newFilterNames)) {
							newRepoFilters.push({ name, value: null, }); // no longer used, so set it to null so it'll be deleted
						}
					});
					setPreviousFilterNames(newFilterNames);
				}

				Repository.filter(newRepoFilters, null, false); // false so other filters remain

				if (searchAllText && Repository.searchAncillary && !Repository.hasBaseParam('searchAncillary')) {
					Repository.setBaseParam('searchAncillary', true);
				}

				if (!isReady) {
					setIsReady(true);
				}

			}, [filters]);

			if (!isReady) {
				return null;
			}

			const
				renderedFilters = renderFilters(),
				hasFilters = !!renderedFilters.length;
			topToolbar = <Toolbar justifyContent="space-between" alignItems="center">
							<Text pr={2} userSelect="none">Filters:{hasFilters ? '' : ' None'}</Text>
							{renderedFilters}
							<Row flex={hasFilters ? null : 1} justifyContent="flex-end">
								<IconButton
									key="clear"
									_icon={{
										as: Ban,
									}}
									ml={1}
									onPress={onClearFilters}
									tooltip="Clear all filters"
								/>
								{showFilterSelector && !isUsingCustomFilters && <IconButton
									key="gear"
									_icon={{
										as: Gear,
									}}
									ml={1}
									onPress={() => {
										setModalFilters(filters);
										setModalSlots(slots);
										setIsFilterSelectorShown(true);
									}}
									tooltip="Swap filters"
								/>}
							</Row>
						</Toolbar>;

			if (isFilterSelectorShown) { // this is always false when isUsingCustomFilters
				// Build the modal to select the filters
				const
					modalFilterElements = [],
					usedFields = _.filter(_.map(modalFilters, (filter) => {
						return filter?.field;
					}), el => !_.isNil(el)),
					formStartingValues = {};
				
				_.each(modalSlots, (field, ix) => {

					// Create the data for the combobox.
					const data = [];
					_.each(modelFilterTypes, (filterType, filterField) => {
						if (inArray(filterField, usedFields) && field !== filterField) { // Show all filters not yet applied, but include the current filter
							return; // skip, since it's already been used
						}
						data.push([ filterField, modelTitles[filterField] ]);
					});

					const
						ixPlusOne = (ix +1),
						filterName = 'filter' + ixPlusOne;

					modalFilterElements.push({
						key: filterName,
						name: filterName,
						type: 'Combo',
						label: 'Filter ' + ixPlusOne,
						data,
						onChange: (value) => {
							const
								newFilters = _.clone(modalFilters),
								newSlots = _.clone(modalSlots),
								i = !isUsingCustomFilters && searchAllText ? ixPlusOne : ix; // compensate for 'q' filter's possible presence

							if (newFilters[i]?.value) {
								newFilters[i].value = value;
							} else {
								newFilters[i] = getFormattedFilter(value);
							}
							newSlots[ix] = value;
							
							setModalFilters(newFilters);
							setModalSlots(newSlots);
						},
					});

					formStartingValues[filterName] = field;
				});

				if (canAddSlot || canDeleteSlot) {
					modalFilterElements.push({
						type: 'PlusMinusButton',
						name: 'plusMinusButton',
						plusHandler: onAddSlot,
						minusHandler: onDeleteSlot,
						isPlusDisabled: !canAddSlot,
						isMinusDisabled: !canDeleteSlot,
						justifyContent: 'flex-end',
					});
				}

				modal = <Modal
							isOpen={true}
							onClose={() => setIsFilterSelectorShown(false)}
						>
							<Column bg="#fff" w={500}>
								<FormPanel
									title="Filter Selector"
									instructions="Please select which fields to filter by."
									flex={1}
									startingValues={formStartingValues}
									items={[
										{
											type: 'Column',
											flex: 1,
											items: modalFilterElements,
										},
									]}
									onCancel={(e) => {
										// Just close the modal
										setIsFilterSelectorShown(false);
									}}
									onSave={(data, e) => {
										// Conform filters to this new choice of filters

										const
											newFilters = [],
											newSlots = [];

										if (!isUsingCustomFilters && searchAllText) {
											newFilters.push(filters[0]);
										}

										// Conform the filters to the modal selection
										_.each(data, (field, ix) => {
											if (_.isEmpty(field) || !ix.match(/^filter/)) {
												return;
											}

											const newFilter = getFormattedFilter(field);

											newFilters.push(newFilter);
											newSlots.push(field);
										});

										if (newSlots.length < minFilters) {
											// Add more slots until we get to minFilters
											for(let i = newSlots.length; i < minFilters; i++) {
												newSlots.push(null);
											}
										}

										setFilters(newFilters);
										setSlots(newSlots);

										// Close the modal
										setIsFilterSelectorShown(false);
									}}
									onReset={() => {
										setModalFilters(filters);
										setModalSlots(slots);
									}}
								/>
							</Column>
						</Modal>;
			}

		} // END if (useFilters)

		return <>
					<WrappedComponent topToolbar={topToolbar} {...props} />
					{modal}
				</>;
	};
}