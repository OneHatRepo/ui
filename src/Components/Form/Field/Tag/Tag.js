import { useRef, useState, useEffect, } from 'react';
import {
	HStack,
	VStackNative,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import * as yup from 'yup'; // https://github.com/jquense/yup#string
import oneHatData from '@onehat/data';
import {
	EDITOR_TYPE__WINDOWED,
} from '../../../../Constants/Editor.js';
import {
	EDITOR_TYPE__PLAIN,
} from '../../../../Constants/Editor.js';
import Button from '../../../Buttons/Button.js';
import testProps from '../../../../Functions/testProps.js';
import Form from '../../Form.js';
import Viewer from '../../../Viewer/Viewer.js';
import withAlert from '../../../Hoc/withAlert.js';
import withComponent from '../../../Hoc/withComponent.js';
import withData from '../../../Hoc/withData.js';
import withModal from '../../../Hoc/withModal.js';
import withValue from '../../../Hoc/withValue.js';
import ValueBox from './ValueBox.js';
import Inflector from 'inflector-js';
import Combo, { ComboEditor } from '../Combo/Combo.js';
import UiGlobals from '../../../../UiGlobals.js';
import _ from 'lodash';

function TagComponent(props) {

	const {
			isViewOnly = false,
			isValueAlwaysArray,
			isValueAsStringifiedJson,
			showEye = true,
			minimizeForRow = false,
			Editor,
			_combo = {},
			SourceRepository,
			mustSaveBeforeEditingJoinData = false,
			joinDataConfig,
			getBaseParams, // See note in useEffect
			outerValueId, // See note in useEffect
			tooltip,
			testID,
			isDirty = false,

			// withAlert
			alert,

			// withComponent
			self,

			// withData
			Repository: TargetRepository,
			setBaseParams,

			// withFilters
			isInFilter,

			// withValue
			value = [],
			setValue,

			// withModal
			showModal,
			hideModal,

			...propsToPass // break connection between Tag and Combo props
		} = props,
		styles = UiGlobals.styles,
		propertyDef = SourceRepository?.getSchema().getPropertyDefinition(self.reference),
		hasJoinData = propertyDef?.joinData?.length,
		[JoinRepository] = useState(() => {
			if (hasJoinData) {
				return oneHatData.getRepository(propertyDef.joinModel, true);
			}
			return null;
		}),
		[isInited, setIsInited] = useState(_.isUndefined(getBaseParams)), // default to true unless getBaseParams is defined
		modelFieldStartsWith = hasJoinData ? Inflector.underscore(JoinRepository.getSchema().name) + '__' : '',
		valueRef = useRef(value),
		onView = async (item, e) => {
			// show the joined record's viewer
			const
				id = item.id,
				repository = TargetRepository;
			if (repository.isLoading) {
				await repository.waitUntilDoneLoading();
			}
			let record = repository.getById(id); // first try to get from entities in memory
			if (!record && repository.loadOneAdditionalEntity) {
				record = await repository.loadOneAdditionalEntity(id);
			}

			if (!record) {
				alert('Record could not be found!');
				return;
			}

			showModal({
				body: <Editor
							editorType={EDITOR_TYPE__WINDOWED}
							parent={self}
							reference="viewer"
							Repository={repository}
							isEditorViewOnly={true}
							selection={[record]}
							onEditorClose={hideModal}
							className={clsx(
								'w-full',
								'p-0',
							)}
						/>,
				onCancel: hideModal,
			});
		},
		clearComboValue = () => {
			self.children.combo.setValue(null);
		},
		onChangeComboValue = (comboValue) => {

			if (_.isNil(comboValue)) {
				// NOTE: We *shouldn't* get here, but for some unknown reason, we *were* getting here on rare occasions.
				// The combo was giving us null values, and the Tag dutifully added null values to its value array.
				// Stop this from happening.
				return;
			}

			// make sure value doesn't already exist
			let exists = false;
			_.each(value, (val) => {
				if (val.id === comboValue) {
					exists = true;
					return false; // break
				}
			});
			if (exists) {
				clearComboValue();
				// alert('Value already exists!'); // This screws up testing! alerts should be for error conditions, not standard operating conditions
				return;
			}

			// The value we get from combo is a simple int
			// Convert this to { id, text} from either Repository or data array.
			const
				data = props.data,
				idIx = props.idIx,
				displayIx = props.displayIx,
				id = comboValue;
			let item,
				displayValue;
				
			if (!id) {
				displayValue = '';
			} else if (TargetRepository) {
				if (!TargetRepository.isDestroyed) {
					item = TargetRepository.getById(id);
					if (!item) {
						throw Error('item not found');
					}
					displayValue = item.displayValue;
				}
			} else {
				item = _.find(data, (datum) => datum[idIx] === id);
				if (!item) {
					throw Error('item not found');
				}
				displayValue = item[displayIx];
			}

			let joinData = {};
			if (hasJoinData) {
				// build up the default starting values for joinData,
				// first with schema defaultValues...
				const
					allSchemaDefaults = JoinRepository.getSchema().getDefaultValues(),
					modelSchemaDefaults = _.pickBy(allSchemaDefaults, (value, key) => {
						return key.startsWith(modelFieldStartsWith);
					}),
					fullFieldNames = propertyDef.joinData.map((fieldName) => { // add the 'model_name__' prefix so we can get schema default values
						return modelFieldStartsWith + fieldName;
					}),
					schemaDefaultValues = _.pick(modelSchemaDefaults, fullFieldNames);
				joinData = _.mapKeys(schemaDefaultValues, (value, key) => { // strip out the 'model_name__' prefix from field names
					return key.startsWith(modelFieldStartsWith) ? key.slice(modelFieldStartsWith.length) : key;
				});

				// then override with default values in joinDataConfig, if they exist
				if (joinDataConfig) {
					_.each(Object.keys(joinDataConfig), (fieldName) => {
						const fieldConfig = joinDataConfig[fieldName];
						if (!_.isUndefined(fieldConfig.defaultValue)) { // null in jsonDataConfig will override a default value in schema!
							joinData[fieldName] = fieldConfig.defaultValue;
						}
					});
				}
			}


			// add new value
			const
				newValue = [...value], // clone Tag's full current value (array), so we trigger a re-render after adding the new value
				newItem = {
					id,
					text: displayValue,
				};
			if (hasJoinData) {
				newItem.joinData = joinData;
			}
			newValue.push(newItem);
			setValue(newValue);
			clearComboValue();
		},
		onDelete = (val) => {
			// Remove from value array
			const newValue = _.filter(value, (val1) => {
				return val1.id !== val.id;
			});			
			setValue(newValue);
		},
		onViewEditJoinData = async (item, e) => {
			// show the joinData viewer/editor

			/* item format:
				item = {
					id: 3,
					text: "1000HR PM",
					joinData: {
						hide_every_n: 0,
						also_resets: '[]',
					},
				}
			*/

			// Prepare Form to edit the joinData
			const
				// create the Form.record, format: { meters_pm_schedules__also_resets: null, meters_pm_schedules__hide_every_n: 5 }
				record = _.mapKeys(item.joinData, (value, key) => { // add the 'model_name__' prefix so we can match JoinRepository property names
					return modelFieldStartsWith + key;
				}),
				// create the Form.items
				items = propertyDef.joinData.map((fieldName) => {
					let obj = {
						name: modelFieldStartsWith + fieldName,
					};

					// add in any specific config for joinData[fieldName]], if it exists
					// (The outer *Editor can configure each Tag field's joinData Form item.
					// This moves that configuration down and adds outerValueId)
					if (joinDataConfig?.[fieldName]) {
						const joinDataConfigFieldname = _.clone(joinDataConfig[fieldName]); // don't mutate original
						joinDataConfigFieldname.outerValueId = item.id; // so that joinData can be aware of the value of the inspected ValueBox; see note in useEffect, below
						obj = {
							...obj,
							...joinDataConfigFieldname,
						};
					}

					return obj;
				});

			let height = 300;
			let body;
			const extraModalProps = {};
			if (isViewOnly) {
				// show Viewer
				body = <Viewer
							record={record}
							Repository={JoinRepository}
							items={items}
							columnDefaults={{
								labelWidth: 200,
							}}
						/>;

				extraModalProps.customButtons = [
					<Button
						{...testProps('closeBtn')}
						key="closeBtn"
						onPress={hideModal}
						text="Close"
						className="text-white"
					/>,
				];
			} else {
				body = <Form
							editorType={EDITOR_TYPE__PLAIN}
							isEditorViewOnly={false}
							record={record}
							Repository={JoinRepository}
							items={items}
							additionalFooterButtons={[
								{
									text: 'Cancel',
									onPress: hideModal,
									skipSubmit: true,
									variant: 'outline',
								}
							]}
							onSave={(values)=> {

								// strip the 'model_name__' prefix from the field names
								values = _.mapKeys(values, (value, key) => {
									return key.startsWith(modelFieldStartsWith) ? key.slice(modelFieldStartsWith.length) : key;
								});

								// Put these values back on joinData
								item.joinData = values;
								const newValue = [...valueRef.current]; // clone
								const ix = _.findIndex(newValue, (val) => {
									return val.id === item.id;
								});
								newValue[ix] = item;
								setValue(newValue);

								hideModal();
							}}
						/>;
			}
			switch (items.length) {
				case 1: height = 250; break;
				case 2: height = 400; break;
				default: height = 600; break;
			}

			showModal({
				title: 'Extra data for "' + item.text + '"',
				w: 400,
				h: height,
				canClose: true,
				includeReset: false,
				includeCancel: false,
				body,
				...extraModalProps,
			});
		},
		onGridAdd = (selection) => {
			// underlying GridEditor added a record.
			// add it to this Tag's value
			const
				entity = selection[0],
				id = entity.id,
				newValue = [...valueRef.current]; // clone
			newValue.push({
				id,
				text: entity.displayValue,
			});
			setValue(newValue);
		},
		onGridSave = (selection) => {
			// underlying GridEditor has changed a record.
			// Check if that value exists, and if so, update its displayValue
			if (_.isEmpty(valueRef.current)) {
				return;
			}

			const
				entity = selection[0],
				id = entity.id,
				ix = _.findIndex(valueRef.current, (item) => {
					return item.id === id;
				}),
				isFound = ix !== -1;
			if (!isFound) {
				return;
			}
			
			const newValue = [...valueRef.current]; // clone
			newValue[ix] = {
				id,
				text: entity.displayValue,
			};
			setValue(newValue);
		},
		onGridDelete = (selection) => {
			// underlying GridEditor has deleted a value.
			// Check if that value exists, and if so delete it
			if (_.isEmpty(valueRef.current)) {
				return;
			}

			const
				entity = selection[0],
				id = entity.id,
				ix = _.findIndex(valueRef.current, (item) => {
					return item.id === id;
				}),
				isFound = ix !== -1;
			if (!isFound) {
				return;
			}

			const newValue = _.filter(valueRef.current, (item) => {
				return item.id !== id;
			});
			setValue(newValue);
		},
		valueBoxes = _.map(value, (val, ix) => {
			return <ValueBox
						key={ix}
						text={val.text}
						onView={() => onView(val)}
						showEye={showEye}
						onViewEditJoinData={() => onViewEditJoinData(val)}
						showJoin={hasJoinData && (!mustSaveBeforeEditingJoinData || !isDirty)}
						onDelete={!isViewOnly ? () => onDelete(val) : null}
						minimizeForRow={minimizeForRow}
					/>;
		});
	
	if (!_.isUndefined(getBaseParams) && outerValueId) {
		useEffect(() => {

			// NOTE: This useEffect is so we can dynamically set the TargetRepository's baseParams,
			// based on outerValueId, before it loads.
			// We did this for cases where the Tag field has joinData that's managing a nested Tag field. 
			// ... This deals with recursion, so gets "alice in wonderland" quickly!
			// If that inner Tag field has getBaseParams defined on a joinDataConfig field of the outer Tag,
			// then that means it needs to set its baseParams dynamically, based on the value of the outer ValueBox.

			// For example: in the MetersEditor:
			// {
			// 	name: 'meters__pm_schedules',
			// 	mustSaveBeforeEditingJoinData: true,
			// 	joinDataConfig: {
			// 		also_resets: {
			// 			getBaseParams: (values, outerValueId) => {
			// 				const baseParams = {
			// 					'conditions[MetersPmSchedules.meter_id]': meter_id, // limit also_resets to those MetersPmSchedules related to this meter
			// 				};
			// 				if (outerValueId) {
			// 					baseParams['conditions[MetersPmSchedules.id <>]'] = outerValueId; // exclude the ValueBox that was clicked on
			// 				}
			// 				return baseParams;
			// 			},
			// 		},
			// 	},
			// }

			TargetRepository.setBaseParams(getBaseParams(value, outerValueId));
			setIsInited(true);

		}, [value]);
	}

	if (!isInited) {
		return null;
	}

	valueRef.current = value; // the onGrid* methods were dealing with stale data, so use a ref, and update it here

	let WhichCombo = Combo;
	if (_combo.isEditor) {
		WhichCombo = ComboEditor;
	}

	if (propsToPass.selectorId) {
		_combo.selectorId = propsToPass.selectorId;
		_combo.selectorSelected = propsToPass.selectorSelected;
		_combo.selectorSelectedField = propsToPass.selectorSelectedField;
	}

	let className = clsx(
		'Tag',
		'w-full',
		'p-0',
	);
	if (isInFilter) {
		className += ' max-w-[250px]';
	}
	if (props.className) {
		className += ' ' + props.className;
	}
	const style = {};
	if (props.style) {
		_.assign(style, props.style); // needed for grid; otherwise valuebox width can be too wide
	}
	if (!props.flex && !props.w && !style.width) {
		style.flex = 1;
	} else {
		if (props.w && !style.width) {
			style.width = props.w;
		}
		if (props.flex && !style.width) {
			style.flex = props.flex;
		}
	}
	let valueBoxesClassName = clsx(
		'Tag-valueBoxes-container',
		'w-full',
		'min-h-[40px]',
		'max-h-[200px]',
		'mb-1',
		'p-1',
		'flex-wrap',
		'overflow-auto',
		'border',
		'border-grey-300',
		'rounded-md',
		'bg-grey-100',
		styles.FORM_TAG_CLASSNAME,
	),
	comboClassName = '';
	if (_combo.className) {
		comboClassName = _combo.className;
	}
	if (minimizeForRow) {
		if (isViewOnly) {
			// combo is not shown, so allow valueBoxes to take up more space
			valueBoxesClassName += ' min-h-[25px] h-full overflow-auto flex-1';
		} else {
			// shrink both down
			valueBoxesClassName += ' Scott h-auto min-h-[25px] max-h-[35px] overflow-auto flex-1';
			comboClassName += ' h-auto min-h-0 max-h-[25px] flex-1';
		}
	}
	
	return <VStackNative
				testID={testID}
				className={className}
				style={style}
			>
				<HStack className={valueBoxesClassName}>{valueBoxes}</HStack>
				
				{!isViewOnly && 
					<WhichCombo
						Repository={TargetRepository}
						Editor={props.Editor}
						onSubmit={onChangeComboValue}
						parent={self}
						reference="combo"
						isInTag={true}
						onGridAdd={onGridAdd}
						onGridSave={onGridSave}
						onGridDelete={onGridDelete}
						tooltip={tooltip}
						usePermissions={props.usePermissions}
						{..._combo}
						className={comboClassName}
					/>}
			</VStackNative>;
	
}

function withAdditionalProps(WrappedComponent) {
	return (props) => {
		return <WrappedComponent
					isValueAlwaysArray={true}
					isValueAsStringifiedJson={true}
					{...props}
				/>;
	};
}

export const Tag = withAdditionalProps(
						withComponent(
							withAlert(
								withData(
									withValue(
										TagComponent
									)
								)
							)
						)
					);

function withAdditionalEditorProps(WrappedComponent) {
	return (props) => {
		const {
				_combo = {},
			} = props;
		_combo.isEditor = true;
		return <WrappedComponent
					{...props}
					_combo={_combo}
				/>;
	};
}

export const TagEditor = withAdditionalEditorProps(Tag);

export default Tag;