import { useState, useEffect, } from 'react';
import {
	Column,
	Modal,
	Text,
} from 'native-base';
import inArray from '../../Functions/inArray';
import getComponentFromType from '../../Functions/getComponentFromType';
import IconButton from '../Buttons/IconButton';
import FormPanel from '../Panel/FormPanel';
import Ban from '../Icons/Ban';
import Gear from '../Icons/Gear';
import Toolbar from '../Toolbar/Toolbar';
import _ from 'lodash';

// Filters only work with Repository; not data array

export default function withFilters(WrappedComponent) {
	return (props) => {
		const {
				useFilters = false,
				searchAllText = true,
				filter1StartingField = '',
				filter2StartingField = '',
				filter3StartingField = '',
				filter4StartingField = '',
				filter5StartingField = '',
				filter1StartingValue = null,
				filter2StartingValue = null,
				filter3StartingValue = null,
				filter4StartingValue = null,
				filter5StartingValue = null,

				// withData
				Repository,
			} = props;

		let modal,
			topToolbar = null;
		
		if (useFilters && Repository) {
			const
				[isFilterSelectorShown, setIsFilterSelectorShown] = useState(false),
				[filter1Field, setFilter1Field] = useState(filter1StartingField || Repository?.getSchema().model.defaultFilters?.[0] || null),
				[filter2Field, setFilter2Field] = useState(filter2StartingField || Repository?.getSchema().model.defaultFilters?.[1] || null),
				[filter3Field, setFilter3Field] = useState(filter3StartingField || Repository?.getSchema().model.defaultFilters?.[2] || null),
				[filter4Field, setFilter4Field] = useState(filter4StartingField || Repository?.getSchema().model.defaultFilters?.[3] || null),
				[filter5Field, setFilter5Field] = useState(filter5StartingField || Repository?.getSchema().model.defaultFilters?.[4] || null),
				[filter1FieldForModal, setFilter1FieldForModal] = useState(filter1Field),
				[filter2FieldForModal, setFilter2FieldForModal] = useState(filter2Field),
				[filter3FieldForModal, setFilter3FieldForModal] = useState(filter3Field),
				[filter4FieldForModal, setFilter4FieldForModal] = useState(filter4Field),
				[filter5FieldForModal, setFilter5FieldForModal] = useState(filter5Field),
				[filterQValue, setFilterQValue] = useState(null),
				[filter1Value, setFilter1Value] = useState(filter1StartingValue),
				[filter2Value, setFilter2Value] = useState(filter2StartingValue),
				[filter3Value, setFilter3Value] = useState(filter3StartingValue),
				[filter4Value, setFilter4Value] = useState(filter4StartingValue),
				[filter5Value, setFilter5Value] = useState(filter5StartingValue),
				[filterFields, setFilterFields] = useState([]),
				onFilterChange = (ix, value) => {
					switch(ix) {
						case 'q':
							setFilterQValue(value);
							break;
						case 0:
							setFilter1Value(value);
							break;
						case 1:
							setFilter2Value(value);
							break;
						case 2:
							setFilter3Value(value);
							break;
						case 3:
							setFilter4Value(value);
							break;
						case 4:
							setFilter5Value(value);
							break;
						default:
					}
				},
				getFilterType = (ix) => {
					const
						filterField = getFilterField(ix),
						filterTypeDefinition = Repository.getSchema().model.filterTypes[filterField];
					let filterType;
					if (_.isString(filterTypeDefinition)) {
						filterType = filterTypeDefinition;
					} else {
						filterType = filterTypeDefinition.type;
					}
					return filterType;
				},
				getFilterField = (ix) => {
					let field;
					switch(ix) {
						case 0:
							field = filter1Field;
							break;
						case 1:
							field = filter2Field;
							break;
						case 2:
							field = filter3Field;
							break;
						case 3:
							field = filter4Field;
							break;
						case 4:
							field = filter5Field;
							break;
						default:
					}
					return field;
				},
				getFilterValue = (ix) => {
					let value;
					switch(ix) {
						case 'q':
							value = filterQValue;
							break;
						case 0:
							value = filter1Value;
							break;
						case 1:
							value = filter2Value;
							break;
						case 2:
							value = filter3Value;
							break;
						case 3:
							value = filter4Value;
							break;
						case 4:
							value = filter5Value;
							break;
						default:
					}
					return value;
				},
				getIsFilterRange = (ix) => {
					const filterType = getFilterType(0);
					return inArray(filterType, ['NumberRange', 'DateRange']);
				},
				renderFilters = () => {
					if (!Repository) {
						return null;
					}
		
					const
						{
							titles = [],
							filterTypes = [],
							virtualFields = [],
							excludeFields = [],
						} = Repository.getSchema().model,
						filterProps = {
							mx: 1,
						},
						filterElements = [],
						addFilter = (fieldName, ix) => {
							if (ix === 'q') {
								// special case
								const Element = getComponentFromType('Input');
								filterElements.push(<Element
														key={ix}
														tooltip="Search all text fields"
														placeholder="All text fields"
														value={getFilterValue(ix)}
														autoSubmit={true}
														onChangeValue={(value) => onFilterChange(ix, value)}
														{...filterProps}
													/>);
								return;
							}
							if (inArray(fieldName, virtualFields) || inArray(fieldName, excludeFields)) {
								return; // skip
							}
							const filterType = filterTypes[fieldName];
							let Element,
								modelProps = {};
							if (_.isString(filterType)) {
								Element = getComponentFromType(filterType);
							} else if (_.isPlainObject(filterType)) {
								const {
										type,
										...p
									} = filterType;
								modelProps = p;
								Element = getComponentFromType(type);
							}
							if (!Element) {
								debugger;
							}
							filterElements.push(<Element
													key={ix}
													tooltip={titles[fieldName]}
													placeholder={titles[fieldName]}
													value={getFilterValue(ix)}
													onChangeValue={(value) => onFilterChange(ix, value)}
													{...filterProps}
													{...modelProps}
												/>);
						};
					if (searchAllText) {
						addFilter(null, 'q');
					}
					if (filter1Field) {
						addFilter(filter1Field, 0);
					}
					if (filter2Field) {
						addFilter(filter2Field, 1);
					}
					if (filter3Field) {
						addFilter(filter3Field, 2);
					}
					if (filter4Field) {
						addFilter(filter4Field, 3);
					}
					if (filter5Field) {
						addFilter(filter5Field, 4);
					}
					
					filterElements.push(<IconButton
											key="clear"
											_icon={{
												as: Ban,
											}}
											ml={1}
											onPress={onClearFilters}
											tooltip="Clear all filters"
										/>);
					filterElements.push(<IconButton
											key="gear"
											_icon={{
												as: Gear,
											}}
											ml={1}
											onPress={() => setIsFilterSelectorShown(true)}
											tooltip="Swap filters"
										/>);
		
					return filterElements;
				},
				setFiltersOn = (ix, filters, newFilterFields) => {
					const
						filterIxField = getFilterField(ix),
						filterIxValue = getFilterValue(ix),
						isFilterRange = getIsFilterRange(ix);
					let highValue,
						lowValue,
						highField,
						lowField;
					if (isFilterRange && !!filterIxValue) {
						highValue = filterIxValue.high;
						lowValue = filterIxValue.low;
						highField = filterIxField + ' <=';
						lowField = filterIxField + ' >=';

						newFilterFields.push(highField);
						newFilterFields.push(lowField);
						filters.push({ name: highField, value: highValue, });
						filters.push({ name: lowField, value: lowValue, });
					} else {
						newFilterFields.push(filterIxField);
						filters.push({ name: filterIxField, value: filterIxValue, });
					}
				},
				onClearFilters = () => {
					setFilterQValue(null);
					setFilter1Value(null);
					setFilter2Value(null);
					setFilter3Value(null);
					setFilter4Value(null);
					setFilter5Value(null);
				};

			useEffect(() => {
				const 
					filters = [],
					newFilterFields = [];


				// For each filter field that is set, add a real filter for it
				if (filter1Field) {
					setFiltersOn(0, filters, newFilterFields);
				}
				if (filter2Field) {
					setFiltersOn(1, filters, newFilterFields);
				}
				if (filter3Field) {
					setFiltersOn(2, filters, newFilterFields);
				}
				if (filter4Field) {
					setFiltersOn(3, filters, newFilterFields);
				}
				if (filter5Field) {
					setFiltersOn(4, filters, newFilterFields);
				}
				if (searchAllText && !_.isEmpty(filterQValue)) {
					const q = 'q';
					newFilterFields.push(q);
					filters.push({ name: q, value: filterQValue, });
				}
				setFilterFields(newFilterFields);

				// Go through previous filterFields see if any are no longer used. If no longer used, set it to null so it'll be deleted
				_.each(filterFields, (filterField) => {
					if (!inArray(filterField, newFilterFields)) {
						filters[filterField] = null;
					}
				});
				
				Repository.filter(filters, null, false); // false so other filters remain

			}, [filter1Field, filter2Field, filter3Field, filter4Field, filter5Field,
				filter1Value, filter2Value, filter3Value, filter4Value, filter5Value,
				filterQValue,]);


			let filterComboProps = {};
			if (Repository?.getSchema().model.titles) {
				filterComboProps.data = [];
				const schemaModel = Repository.getSchema().model;
				_.each(schemaModel.titles, (title, fieldName) => {
					if (!inArray(fieldName, schemaModel.virtualFields) && !inArray(fieldName, schemaModel.excludeFields) && !inArray(fieldName, schemaModel.filteringDisabled)) {
						filterComboProps.data.push([fieldName, title]);
					}
				});
				topToolbar = <Toolbar justifyContent="space-between"><Text pt={2} pr={2} userSelect="none">Filters:</Text>{renderFilters()}</Toolbar>;
			}

			if (isFilterSelectorShown) {
				modal = <Modal
							isOpen={true}
							onClose={() => setIsFilterSelectorShown(false)}
						>
							<Column bg="#fff" w={500}>
								<FormPanel
									title="Filter Selector"
									instructions="Please select which fields to filter by. You may select up to five filters. Leave blank for no filter."
									flex={1}
									startingValues={{
										filter1: filter1Field,
										filter2: filter2Field,
										filter3: filter3Field,
										filter4: filter4Field,
										filter5: filter5Field,
									}}
									items={[
										{
											type: 'Column',
											flex: 1,
											items: [
												{
													type: 'Combo',
													label: 'Filter 1',
													name: 'filter1',
													onChangeValue: (value) => {
														setFilter1FieldForModal(value);
													},
													...filterComboProps,
												},
												{
													type: 'Combo',
													label: 'Filter 2',
													name: 'filter2',
													onChangeValue: (value) => {
														setFilter2FieldForModal(value);
													},
													...filterComboProps,
												},
												{
													type: 'Combo',
													label: 'Filter 3',
													name: 'filter3',
													onChangeValue: (value) => {
														setFilter3FieldForModal(value);
													},
													...filterComboProps,
												},
												{
													type: 'Combo',
													label: 'Filter 4',
													name: 'filter4',
													onChangeValue: (value) => {
														setFilter4FieldForModal(value);
													},
													...filterComboProps,
												},
												{
													type: 'Combo',
													label: 'Filter 5',
													name: 'filter5',
													onChangeValue: (value) => {
														setFilter5FieldForModal(value);
													},
													...filterComboProps,
												},
											],
										}, // END Column
									]}
									onCancel={(e) => {
										setFilter1FieldForModal(filter1Field);
										setFilter2FieldForModal(filter2Field);
										setFilter3FieldForModal(filter3Field);
										setFilter4FieldForModal(filter4Field);
										setFilter5FieldForModal(filter5Field);
										setIsFilterSelectorShown(false);
									}}
									onSave={(data, e) => {
										if (filter1FieldForModal !== filter1Field) {
											setFilter1Field(filter1FieldForModal);
											setFilter1Value(null);
										}
										if (filter2FieldForModal !== filter2Field) {
											setFilter2Field(filter2FieldForModal);
											setFilter2Value(null);
										}
										if (filter3FieldForModal !== filter3Field) {
											setFilter3Field(filter3FieldForModal);
											setFilter3Value(null);
										}
										if (filter4FieldForModal !== filter4Field) {
											setFilter4Field(filter4FieldForModal);
											setFilter4Value(null);
										}
										if (filter5FieldForModal !== filter5Field) {
											setFilter5Field(filter5FieldForModal);
											setFilter5Value(null);
										}
										setIsFilterSelectorShown(false);
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