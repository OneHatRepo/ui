import { useState, useRef, } from 'react';
import {
	Column,
	Modal,
	Row,
} from 'native-base';
import {
	EDITOR_TYPE__WINDOWED,
} from '@onehat/ui/src/Constants/Editor.js';
import withAlert from '../../../Hoc/withAlert.js';
import withComponent from '../../../Hoc/withComponent.js';
import withData from '../../../Hoc/withData.js';
import withValue from '../../../Hoc/withValue.js';
import ValueBox from './ValueBox.js';
import Combo, { ComboEditor } from '../Combo/Combo.js';
import _ from 'lodash';



function TagComponent(props) {

	const {
			isViewOnly = false,
			isValueAlwaysArray,
			isValueAsStringifiedJson,
			Editor,
			_combo = {},

			// parent Form
			onChangeValue,

			// withAlert
			alert,

			// withComponent
			self,

			// withValue
			value = [],
			setValue,
			...propsToPass // break connection between Tag and Combo props
		} = props,
		ignoreNextComboValueChangeRef = useRef(false),
		[isViewerShown, setIsViewerShown] = useState(false),
		[viewerSelection, setViewerSelection] = useState(false),
		getIgnoreNextComboValueChange = () => {
			return ignoreNextComboValueChangeRef.current;
		},
		setIgnoreNextComboValueChange = (bool) => {
			ignoreNextComboValueChangeRef.current = bool;
		},
		onViewerClose = () => setIsViewerShown(false),
		onView = async (item, e) => {
			const
				id = item.id,
				repository = propsToPass.Repository;
			if (!repository.isLoaded) {
				await repository.load();
			}
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

			setViewerSelection([record]);
			setIsViewerShown(true);
		},
		clearComboValue = () => {
			setIgnoreNextComboValueChange(true); // we're clearing out the value of the underlying Combo, so ignore it when this combo submits the new value change
			self.children.combo.setValue(null);
		},
		onChangeComboValue = (comboValue) => {
			if (getIgnoreNextComboValueChange()) {
				setIgnoreNextComboValueChange(false);
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
				alert('Value already exists!');
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
			if (Repository) {
				item = Repository.getById(id);
				if (!item) {
					throw Error('item not found');
				}
				displayValue = item.displayValue;
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
		valueBoxes = _.map(value, (val, ix) => {
			return <ValueBox
						key={ix}
						text={val.text}
						onView={() => onView(val)}
						onDelete={!isViewOnly ? () => onDelete(val) : null}
					/>;
		});

	let WhichCombo = Combo;
	if (_combo.isEditor) {
		WhichCombo = ComboEditor;
	}

	const sizeProps = {};
	if (!props.flex && !props.w) {
		sizeProps.flex = 1;
	} else {
		if (props.w) {
			sizeProps.w = props.w;
		}
		if (props.flex) {
			sizeProps.flex = props.flex;
		}
	}

	if (propsToPass.selectorId) {
		_combo.selectorId = propsToPass.selectorId;
		_combo.selectorSelected = propsToPass.selectorSelected;
	}

	return <>
				<Column
					{...props}
					{...sizeProps}
					px={0}
					py={0}
				>
					<Row
						w="100%"
						borderWidth={1}
						borderColor="trueGray.300"
						borderRadius="md"
						bg="trueGray.100"
						p={1}
						mb={1}
						minHeight={10}
						flexWrap="wrap"
					>{valueBoxes}</Row>
					{!isViewOnly && <WhichCombo
										Repository={props.Repository}
										Editor={props.Editor}
										onChangeValue={onChangeComboValue}
										parent={self}
										reference="combo"
										{..._combo}
									/>}
				</Column>
				{isViewerShown && 
					<Modal
						isOpen={true}
						onClose={onViewerClose}
					>
						<Editor
							editorType={EDITOR_TYPE__WINDOWED}
							{...propsToPass}
							px={0}
							py={0}
							w="100%"
							parent={self}
							reference="viewer"

							isEditorViewOnly={true}
							selection={viewerSelection}
							onEditorClose={onViewerClose}
						/>
					</Modal>}
			</>;
	
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
		return <WrappedComponent
					_combo={{ isEditor: true }}
					{...props}
				/>;
	};
}

export const TagEditor = withAdditionalEditorProps(Tag);

export default Tag;