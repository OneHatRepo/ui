import { useState, useEffect, useRef, } from 'react';
import {
	Column,
	Modal,
	Row,
	ScrollView,
	Text,
} from 'native-base';
import {
	EDITOR_TYPE__PLAIN,
} from '../../Constants/Editor.js';
import {
	FILTER_TYPE_ANCILLARY
} from '../../Constants/Filters.js';
import Inflector from 'inflector-js';
import inArray from '../../Functions/inArray.js';
import getComponentFromType from '../../Functions/getComponentFromType.js';
import IconButton from '../Buttons/IconButton.js';
import FormPanel from '../Panel/FormPanel.js';
import Ban from '../Icons/Ban.js';
import Gear from '../Icons/Gear.js';
import Toolbar from '../Toolbar/Toolbar.js';
import getSaved from '../../Functions/getSaved.js';
import setSaved from '../../Functions/setSaved.js';
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
				onFilterChange,

				// withData
				Repository,

				// withComponent
				self,
			} = props;

		let modal = null,
			topToolbar = null;
		
		if (useFilters && Repository) {

			const
				// aliases
				{
					defaultFilters: modelDefaultFilters,
					ancillaryFilters: modelAncillaryFilters,
				} = Repository.getSchema().model,
				id = props.id || props.self?.path,

				// determine the starting filters
				startingFilters = !_.isEmpty(customFilters) ? customFilters : // custom filters override component filters
								!_.isEmpty(defaultFilters) ? defaultFilters : // component filters override model filters
								!_.isEmpty(modelDefaultFilters) ? modelDefaultFilters : [],
				isUsingCustomFilters = startingFilters === customFilters,
				modelFilterTypes = Repository.getSchema().getFilterTypes(),
				[isReady, setIsReady] = useState(false),
				[isFilterSelectorShown, setIsFilterSelectorShown] = useState(false),
				getFormattedFilter = (filter) => {
					let formatted = null;
					if (_.isString(filter)) {
						const
							field = filter,
							propertyDef = Repository.getSchema().getPropertyDefinition(field);
						
						let title, type;
						if (propertyDef) {
							title = propertyDef.title;
							type = propertyDef.filterType;
						} else if (modelAncillaryFilters[field]) {
							const ancillaryFilter = modelFilterTypes[field];
							title = ancillaryFilter.title;
							type = FILTER_TYPE_ANCILLARY;
						} else {
							throw Error('not a propertyDef, and not an ancillaryFilter!');
						}
						formatted = {
							field,
							title,
							type,
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
				if (searchAllText) {
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
				filterCallbackRef = useRef(),
				[filters, setFiltersRaw] = useState(formattedStartingFilters), // array of formatted filters
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
				setFilters = (filters, doSetSlots = true, save = true) => {
					setFiltersRaw(filters);

					if (doSetSlots) {
						const newSlots = [];
						_.each(filters, (filter, ix) => {
							if (searchAllText && ix === 0) {
								return; // skip
							}
							newSlots.push(filter.field);
						});
						if (newSlots.length < minFilters) {
							// Add more slots until we get to minFilters
							for(let i = newSlots.length; i < minFilters; i++) {
								newSlots.push(null);
							}
						}
						setSlots(newSlots);
					}
					if (save && id) {
						setSaved(id + '-filters', filters);
					}
					if (onFilterChange) {
						onFilterChange(filters);
					}
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
					setFilters(newFilters, false);
				},
				onClearFilters = () => {
					// Clears values for all active filters
					const newFilters = [];
					_.each(filters, (filter) => {
						filter.value = null;
						newFilters.push(filter);
					});
					setFilters(newFilters, false);
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
				getIsFilterRange = (filter) => {
					let field = _.isString(filter) ? filter : filter.field;
					const filterType = getFilterType(field);
					if (filterType?.type) {
						return inArray(filterType.type, ['NumberRange', 'DateRange'])
					}
					return inArray(filterType, ['NumberRange', 'DateRange']);
				},
				filterById = (id, cb) => {
					onClearFilters();
					filterCallbackRef.current = cb; // store the callback, so we can call it the next time this HOC renders with new filters
					const newFilters = _.clone(filters);
					_.remove(newFilters, (filter) => {
						return filter.field === 'q';
					});
					newFilters.unshift({
						field: 'q',
						title: 'Search all text fields',
						type: 'Input',
						value: 'id:' + id,
					});
					setFilters(newFilters, false, false);
				},
				renderFilters = () => {
					const
						filterProps = {
							mx: 1,
							autoAdjustPageSizeToHeight: false,
							pageSize: 20,
							uniqueRepository: true,
						},
						filterElements = [];
					_.each(filters, (filter, ix) => {
						let Element,
							elementProps = {};
						let {
								field,
								type: filterType,
								title,
							} = filter;
						
						if (!title) {
							const propertyDef = Repository.getSchema().getPropertyDefinition(field);
							title = propertyDef?.title;
						}

						if (_.isString(filterType)) {
							if (filterType === FILTER_TYPE_ANCILLARY) {
								title = modelFilterTypes[field].title;
								filterType = Inflector.camelize(Inflector.pluralize(field)) + 'Combo'; // Convert field to PluralCamelCombo
							}
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

						const tooltip = filter.tooltip || title;
						let filterElement = <Element
												key={'filter-' + field}
												tooltip={tooltip}
												placeholder={tooltip}
												value={getFilterValue(field)}
												onChangeValue={(value) => onFilterChangeValue(field, value)}
												{...filterProps}
												{...elementProps}
											/>;
						if (showLabels && field !== 'q') {
							filterElement = <Row key={'label-' + ix} alignItems="center">
												<Text ml={2} mr={1} fontSize={UiGlobals.styles.FILTER_LABEL_FONTSIZE}>{title}</Text>
												{filterElement}
											</Row>;
						}
						filterElements.push(filterElement);
					});
					return filterElements;
				};

			useEffect(() => {
				(async () => {
					
					// Whenever the filters change in some way, make repository conform to these new filters
					const newRepoFilters = [];
					let filtersToUse = filters

					if (!isReady && id && !isUsingCustomFilters) { // can't save custom filters bc we can't save JS fns in Repository (e.g. getRepoFilters)
						const savedFilters = await getSaved(id + '-filters');
						if (!_.isEmpty(savedFilters)) {
							// load saved filters
							filtersToUse = savedFilters;
							setFilters(savedFilters, true, false); // false to skip save
						}
					}

					if (isUsingCustomFilters) {
						_.each(filtersToUse, ({ field, value, getRepoFilters }) => {
							if (getRepoFilters) {
								let repoFiltersFromFilter = getRepoFilters(value) || [];
								if (!_.isArray(repoFiltersFromFilter)) {
									repoFiltersFromFilter = [repoFiltersFromFilter];
								}
								_.each(repoFiltersFromFilter, (repoFilter) => { // one custom filter might generate multiple filters for the repository
									newRepoFilters.push(repoFilter);
								});
							} else {
								newRepoFilters.push({ name: field, value, });
							}
						});
					} else {
						const newFilterNames = [];
						_.each(filtersToUse, (filter) => {
							const {
									field,
									value,
									type,
								} = filter,
								isFilterRange = getIsFilterRange(filter);
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
								const
									isAncillary = type === FILTER_TYPE_ANCILLARY,
									filterName = (isAncillary ? 'ancillary___' : '') + field;
								newFilterNames.push(filterName);
								newRepoFilters.push({ name: filterName, value, });
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

					if (searchAllText && Repository.searchAncillary && !Repository.hasBaseParam('searchAncillary')) {
						Repository.setBaseParam('searchAncillary', true);
					}

					await Repository.filter(newRepoFilters, null, false); // false so other filters remain

					if (filterCallbackRef.current) {
						filterCallbackRef.current(); // call the callback
						filterCallbackRef.current = null; // clear the callback
					}

					if (!isReady) {
						setIsReady(true);
					}
				})();
			}, [filters]);

			if (!isReady) {
				return null;
			}

			if (self) {
				self.filterById = filterById;
				self.setFilters = setFilters;
			}

			const
				renderedFilters = renderFilters(),
				hasFilters = !!renderedFilters.length;
			topToolbar = <Toolbar>
							<Row flex={1} alignItems="center">
								<ScrollView horizontal={true} contentContainerStyle={{ alignItems: 'center' }}>
									<Text fontStyle="italic" pr={2} userSelect="none">Filters:{hasFilters ? '' : ' None'}</Text>
									{renderedFilters}
								</ScrollView>
							</Row>
							<Row flex={hasFilters ? null : 1} alignItems="center" alignSelf="flex-end">
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
										const f = filters;
										const s = slots;
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

					// Create the data for the combobox. (i.e. List all the possible filters for this slot)
					let data = [];
					_.each(modelFilterTypes, (filterType, filterField) => {
						if (inArray(filterField, usedFields) && field !== filterField) { // Show all filters not yet applied, but include the current filter
							return; // skip, since it's already been used
						}

						// Is it an ancillary filter?
						const isAncillary = _.isPlainObject(filterType) && filterType.isAncillary;
						if (isAncillary) {
							data.push([ filterField, filterType.title + ' •' ]);
							return;
						}

						// basic property filter
						const propertyDef = Repository.getSchema().getPropertyDefinition(filterField);
						data.push([ filterField, propertyDef?.title ]);
					});

					// sort by title
					data = _.sortBy(data, [function(datum) { return datum[1]; }]);

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
								i = searchAllText ? ixPlusOne : ix; // compensate for 'q' filter's possible presence

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
									editorType={EDITOR_TYPE__PLAIN}
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
										setIsFilterSelectorShown(false);
									}}
									onClose={(e) => {
										setIsFilterSelectorShown(false);
									}}
									onSave={(data, e) => {
										// Conform filters to this new choice of filters

										const newFilters = [];

										if (searchAllText) {
											newFilters.push(filters[0]);
										}

										// Conform the filters to the modal selection
										_.each(data, (field, ix) => {
											if (_.isEmpty(field) || !ix.match(/^filter/)) {
												return;
											}

											const newFilter = getFormattedFilter(field);
											newFilters.push(newFilter);
										});

										setFilters(newFilters);

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