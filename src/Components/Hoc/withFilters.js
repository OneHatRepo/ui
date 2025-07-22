import { forwardRef, useState, useEffect, useRef, } from 'react';
import {
	HStack,
	// ScrollView,
	Text,
} from '@project-components/Gluestack';
import {
	ScrollView,
	Platform,
} from 'react-native'
import {
	EDITOR_TYPE__PLAIN,
} from '../../Constants/Editor.js';
import {
	FILTER_TYPE_ANCILLARY
} from '../../Constants/Filters.js';
import Inflector from 'inflector-js';
import testProps from '../../Functions/testProps.js';
import inArray from '../../Functions/inArray.js';
import getComponentFromType from '../../Functions/getComponentFromType.js';
import IconButton from '../Buttons/IconButton.js';
import Form from '../Form/Form.js';
import Label from '../Form/Label.js';
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

const isWindows = Platform.OS === 'windows';

export default function withFilters(WrappedComponent) {
	return forwardRef((props, ref) => {

		if (!props.useFilters) {
			return <WrappedComponent {...props} ref={ref} />;
		}

		if (!props.Repository) {
			throw Error('withFilters requires a Repository if useFilters === true');
		}

		const {
				// config
				searchAllText = true,
				showClearFiltersButton = true,
				defaultFilters = [], // likely a list of field names, possibly could be of shape below
				customFilters = [], // of shape: { title, type, field, value, getRepoFilters(value) }
				clearExceptions = [], // list of fields that should not be cleared when clearFilters button is pressed
				minFilters = 3,
				maxFilters = 6,
				onFilterChange,

				// withData
				Repository,

				// withComponent
				self,

				// withModal
				showModal,
				hideModal,
				updateModalBody,

			} = props,

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
			scrollViewRef = useRef(),
			[filters, setFiltersRaw] = useState(formattedStartingFilters), // array of formatted filters
			[slots, setSlots] = useState(startingSlots), // array of field names user is currently filtering on; blank slots have a null entry in array
			[previousFilterNames, setPreviousFilterNames] = useState([]), // names of filters the repository used last query
			[isHorizontalScrollbarShown, setIsHorizontalScrollbarShown] = useState(false),
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
					if (!inArray(filter.field, clearExceptions)) {
						filter.value = null;
					}
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
				let filterType;
				if (filter.type) {
					// filter type is already determined
					filterType = filter.type;
				} else {
					// try to find filter type from field name
					const field = _.isString(filter) ? filter : filter.field;
					filterType = getFilterType(field);
				}
				if (filterType?.type) {
					filterType = filterType.type;
				}
				return inArray(filterType, ['NumberRange', 'DateRange']);
			},
			filterById = (id, cb) => {
				onClearFilters();
				filterCallbackRef.current = cb; // store the callback, so we can call it the next time this HOC renders with new filters
				const newFilters = [...filters];
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
						autoAdjustPageSizeToHeight: false,
						pageSize: 20,
						uniqueRepository: true,
						className: 'Filter mx-1',
					},
					filterElements = [];
				_.each(filters, (filter, ix) => {
					let Element,
						elementProps = {};
					let {
							field,
							type: filterType,
							title,
							className = '',
						} = filter;
						
					if (!title) {
						const propertyDef = Repository.getSchema().getPropertyDefinition(field);
						title = propertyDef?.title;
					}

					if (_.isString(filterType)) {
						if (filterType === FILTER_TYPE_ANCILLARY) {
							title = modelFilterTypes[field].title;
							const tagOrCombo = Repository.schema.model.ancillaryFiltersThatUseTags && inArray(field, Repository.schema.model.ancillaryFiltersThatUseTags) ? 'Tag' : 'Combo';
							filterType = Inflector.camelize(Inflector.pluralize(field)) + tagOrCombo; // Convert field to PluralCamelCombo
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
					if (!Element) {
						return; // to protect against errors
					}
					if (field === 'q') {
						elementProps.flex = 1;
						elementProps.minWidth = 100;
					}

					const tooltip = filter.tooltip || title;
					let filterClassName = filterProps.className + ` Filter-${field}`;
					if (className) {
						filterClassName += ' ' + className;
					}
					if (elementProps.className) {
						filterClassName += ' ' + elementProps.className;
					}
					let filterElement = <Element
											{...testProps('filter-' + field)}
											tooltip={tooltip}
											placeholder={tooltip}
											value={getFilterValue(field)}
											onChangeValue={(value) => onFilterChangeValue(field, value)}
											isInFilter={true}
											minimizeForRow={true}
											{...filterProps}
											{...elementProps}
											className={filterClassName}
										/>;
					if (field !== 'q') {
						filterElement = <>
											<Label
												className="min-w-0 mr-1"
												_text={{
													className: UiGlobals.styles.FILTER_LABEL_CLASSNAME,
												}}
											>{title}</Label>
											{filterElement}
										</>;
					}
					// add a container for each filter
					filterElement = <HStack
										key={'filter-' + ix}
										className={`
											Filter-container-HStack
											h-full
											px-1
											mx-1
											bg-grey-100
											rounded-[6px]
											border
											border-l-white
											items-center
										`}
									>
										{filterElement}
									</HStack>;

					filterElements.push(filterElement);
				});
				return filterElements;
			},
			onShowFilterSelector = () => {
				showModal({
					title: 'Filter Selector',
					body: buildModalBody(filters, slots),
					canClose: true,
					w: 500,
				});
			},
			onContentSizeChange = (contentWidth, contentHeight) => {
				if (!isWindows) {
					return;
				}
				if (scrollViewRef.current) {
					scrollViewRef.current.measure((x, y, width, height, pageX, pageY) => {
						setIsHorizontalScrollbarShown(contentWidth > width);
					});
				}
			},
			buildModalBody = (modalFilters, modalSlots) => {

				const
					modalFilterElements = [],
					usedFields = _.filter(_.map(modalFilters, (filter) => {
						return filter?.field;
					}), el => !_.isNil(el)),
					formStartingValues = {};
				
				// populate modalFilterElements and formStartingValues
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
								newFilters = [...modalFilters],
								newSlots = [...modalSlots],
								i = ix;//searchAllText ? ixPlusOne : ix; // compensate for 'q' filter's possible presence

							newFilters[i] = getFormattedFilter(value);
							newSlots[i] = value;
							
							rebuildModalBody(newFilters, newSlots);
						},
					});

					formStartingValues[filterName] = field;
				});

				const
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
					canDeleteSlot = modalSlots.length > minFilters;
				if (canAddSlot || canDeleteSlot) {
					const
						onAddSlot = () => {
							if (!canAddSlot) {
								return;
							}
							const newSlots = [...modalSlots];
							newSlots.push(null);
							rebuildModalBody(modalFilters, newSlots);
						},
						onDeleteSlot = () => {
							if (!canDeleteSlot) {
								return;
							}
							const
								newFilters = [...modalFilters],
								newSlots = [...modalSlots];
							newFilters.pop();
							newSlots.pop();
							rebuildModalBody(newFilters, newSlots);
						};
					modalFilterElements.push({
						type: 'PlusMinusButton',
						name: 'plusMinusButton',
						plusHandler: onAddSlot,
						minusHandler: onDeleteSlot,
						isPlusDisabled: !canAddSlot,
						isMinusDisabled: !canDeleteSlot,
						plusTooltip: 'Add another filter slot',
						minusTooltip: 'Remove the last filter slot',
						className: 'justify-end',
					});
				}

				return <Form
							instructions="Please select which fields to filter by."
							editorType={EDITOR_TYPE__PLAIN}
							className="flex-1"
							startingValues={formStartingValues}
							items={[
								{
									name: 'instructions',
									type: 'DisplayField',
									text: 'Please select which fields to filter by.',
									className: 'mb-3',
								},
								{
									type: 'Column',
									flex: 1,
									items: modalFilterElements,
								},
							]}
							onReset={() => {
								rebuildModalBody(filters, slots);
							}}
							onCancel={(e) => {
								hideModal();
							}}
							onClose={(e) => {
								hideModal();
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
								hideModal();
							}}
						/>;
			},
			rebuildModalBody = (filters, slots) => {
				updateModalBody(buildModalBody(filters, slots));
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

		useEffect(() => {
			if (!isWindows) {
				return;
			}

			// NOTE: On Windows machines, I was getting horizontal scrollbars when the ScrollView 
			// was not wide enough to contain all the filters. This workaround adds pb-5 to the ScrollView
			// when the scrollbar is shown.

			if (scrollViewRef.current) {
				scrollViewRef.current.addEventListener('contentSizeChange', onContentSizeChange);
			}
			return () => {
				if (scrollViewRef.current) {
					scrollViewRef.current.removeEventListener('contentSizeChange', onContentSizeChange);
				}
			};
		}, []);
		
		if (!isReady) {
			return null;
		}

		if (self) {
			self.filterById = filterById;
			self.setFilters = setFilters;
		}

		const
			renderedFilters = renderFilters(),
			hasFilters = !!renderedFilters.length,
			scrollViewClass = isWindows && isHorizontalScrollbarShown ? 'pb-5' : '',
			toolbar = <Toolbar>
						<HStack className="withFilters-scrollViewContainer flex-1 items-center">
							<ScrollView
								ref={scrollViewRef}
								className={`withFilters-ScrollView ${scrollViewClass} pb-1`}
								horizontal={true}
								contentContainerStyle={{ alignItems: 'center' }}
								onContentSizeChange={onContentSizeChange}
							>
								<Text
									className={`
										withFilters-filtersLabel
										italic-italic
										pr-2
										select-none
										${hasFilters ? 'flex-1' : 'italic'}
									`}>{hasFilters ? 'Filters:' : 'No Filters'}</Text>
								{renderedFilters}
							</ScrollView>
						</HStack>
						{(showClearFiltersButton || !isUsingCustomFilters) && 
							<HStack className="withFilters-endButtonsContainer self-end items-center h-full">
								{showClearFiltersButton && 
									<IconButton
										{...testProps('clearFiltersBtn')}
										key="clearFiltersBtn"
										icon={Ban}
										className="ml-1"
										onPress={onClearFilters}
										tooltip="Clear all filters"
										isDisabled={!hasFilters}
									/>}
								{!isUsingCustomFilters && 
									<IconButton
										{...testProps('swapFiltersBtn')}
										key="swapFiltersBtn"
										icon={Gear}
										className="ml-1"
										onPress={onShowFilterSelector}
										tooltip="Set filters"
									/>}
							</HStack>}
					</Toolbar>;
		
		return <WrappedComponent {...props} topToolbar={toolbar} ref={ref} />;

	});
}