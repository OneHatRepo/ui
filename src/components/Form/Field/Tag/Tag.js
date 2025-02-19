import { useRef, } from 'react';
import {
	HStack,
	VStackNative,
} from '@project-components/Gluestack';
import {
	EDITOR_TYPE__WINDOWED,
} from '../../../../Constants/Editor.js';
import withAlert from '../../../Hoc/withAlert.js';
import withComponent from '../../../Hoc/withComponent.js';
import withData from '../../../Hoc/withData.js';
import withModal from '../../../Hoc/withModal.js';
import withValue from '../../../Hoc/withValue.js';
import ValueBox from './ValueBox.js';
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
			tooltip,
			testID,

			// parent Form
			onChangeValue,

			// withAlert
			alert,

			// withComponent
			self,

			// withValue
			value = [],
			setValue,

			// withModal
			showModal,
			hideModal,

			...propsToPass // break connection between Tag and Combo props
		} = props,
		styles = UiGlobals.styles,
		valueRef = useRef(value),
		onView = async (item, e) => {
			const
				id = item.id,
				repository = propsToPass.Repository;
			if (repository.isLoading) {
				await repository.waitUntilDoneLoading();
			}
			let record = repository.getById(id); // first try to get from entities in memory
			if (!record && repository.getSingleEntityFromServer) {
				record = await repository.getSingleEntityFromServer(id);
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
							className={`
								w-full
								p-0
							`}
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
			// Convert this to id and displayValue from either Repository or data array.
			const
				Repository = props.Repository,
				data = props.data,
				idIx = props.idIx,
				displayIx = props.displayIx,
				id = comboValue;
			let item,
				displayValue;
				
			if (!id) {
				displayValue = '';
			} else if (Repository) {
				if (!Repository.isDestroyed) {
					item = Repository.getById(id);
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


			// add new value
			const newValue = _.clone(value); // so we trigger a re-render
			newValue.push({
				id,
				text: displayValue,
			})
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
		onGridAdd = (selection) => {
			// underlying GridEditor added a record.
			// add it to this Tag's value
			const
				entity = selection[0],
				id = entity.id,
				newValue = _.clone(valueRef.current);
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
			
			const newValue = _.clone(valueRef.current);
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
						onDelete={!isViewOnly ? () => onDelete(val) : null}
						showEye={showEye}
						minimizeForRow={minimizeForRow}
					/>;
		});
	
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

	let className = `
		Tag
		w-full
		p-0
	`;
	if (props.className) {
		className += ' ' + props.className;
	}
	const style = {};
	if (!props.flex && !props.w) {
		style.flex = 1;
	} else {
		if (props.w) {
			style.width = props.w;
		}
		if (props.flex) {
			style.flex = props.flex;
		}
	}
	if (props.style) {
		_.assign(style, props.style); // needed for grid; otherwise valuebox width can be too wide
	}
	let valueBoxesClassName = `
		Tag-valueBoxes-container
		w-full
		min-h-[40px]
		max-h-[200px]
		mb-1
		p-1
		flex-wrap
		overflow-auto
		border
		border-grey-300
		rounded-md
		bg-grey-100
		${styles.FORM_TAG_CLASSNAME}
	`,
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
						Repository={props.Repository}
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