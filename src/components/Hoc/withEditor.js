import { useState, } from 'react';
import {
	Column,
	Icon,
	Modal,
	Pressable,
	Row,
	Text,
} from 'native-base';
import {
	EDITOR_TYPE_INLINE,
	EDITOR_TYPE_WINDOWED,
} from '../../Constants/EditorTypes';
import _ from 'lodash';

export default function withEditor(WrappedComponent) {
	return (props) => {
		const {
				Repository,
				// defaultData = {},
				useEditor = false,
				userCanEdit = true,
				userCanView = true,
				disableAdd = false,
				disableEdit = false,
				disableDelete = false,
				disableDuplicate = false,
				disableView = false,
				getRecordIdentifier = (record) => {
					if (_.isArray(record)) {
						return 'records?';
					}
					return 'record?';
				},

				selection,
				setSelection,
			} = props,
			[currentRecord, setCurrentRecord] = useState(null),
			[isRecordChanged, setIsRecordChanged] = useState(null),
			[isEditable, setIsEditable] = useState(true),
			[isEditorShown, setIsEditorShown] = useState(false),
			// [isEditable, setIsEditable] = useState(true),
			getEntityFromSelection = () => {
				let entity;
				if (selection.length === 1) {
					// just one entity
					entity = selection[0];
				} else if (selection.length > 1) {
					// multiple entities
					entity = selection
				} else {
					// nothing selected
					debugger;
				}
				return entity;
			},
			addRecord = async () => {
				const
					defaults = Repository.getSchema().model.defaultValues,
					entity = await Repository.add(defaults);
				setSelection([entity]);
				setIsEditorShown(true);
			},
			editRecord = () => {
				setIsEditorShown(true);
			},
			deleteRecord = (e) => {
				const entity = getEntityFromSelection();
				if (_.isArray(entity)) {
				} else {
					// TODO: Verify before delete!

					Repository.delete(entity);
				}
			},
			viewRecord = () => {

			},
			duplicateRecord = () => {

			},
			onEditorSave = (data, e) => {
				const entity = getEntityFromSelection();
				if (_.isArray(entity)) {
					// Edit multiple entities
					debugger;
				} else {
					// just update this one entity
					entity.setValues(data);
				}
				setIsEditorShown(false);
			},
			onEditorCancel = () => {
				const entity = getEntityFromSelection();
				if (_.isArray(entity)) {
					// cancel multiple entities
					debugger;
				} else {
					// Remove the phantom entity
					if (entity.isPhantom) {
						Repository.delete(entity);
					}
				}
				setIsEditorShown(false);
			};
			// checkIsRecordChanged = (compareData) => {
			// 	// Compare the currently selected record with the values in the form
			// 	const currentRecordSubmitData = currentRecord.submitData;
			// 	let isRecordChanged = false;

			// 	// Should we just use @onehat/data's entity.isDirty?
			// 	// No-- doesn't take ignoreFields into account.

			// 	setIsRecordChanged(isRecordChanged);
			// },
			// makeRecordChanges = () => {},
			// isJson = (str) => { // modified from https://stackoverflow.com/a/20392392
			// 	let o;
			// 	try {
			// 		o = JSON.parse(str);
			// 		if (_.idPlainObject(o)) {
			// 			return true;
			// 		}
			// 	} catch (e) {}
			// 	return false;
			// };

		return <WrappedComponent
					{...props}
					// defaultData={defaultData}
					currentRecord={currentRecord}
					setCurrentRecord={setCurrentRecord}
					isEditable={isEditable}
					isEditorShown={isEditorShown}
					setIsEditorShown={setIsEditorShown}
					isRecordChanged={isRecordChanged}
					onAdd={addRecord}
					onEdit={editRecord}
					onDelete={deleteRecord}
					onView={viewRecord}
					onDuplicate={duplicateRecord}
					onEditorSave={onEditorSave}
					onEditorCancel={onEditorCancel}
					disableAdd={disableAdd}
					disableEdit={disableEdit}
					disableDelete={disableDelete}
					disableDuplicate={disableDuplicate}
					disableView ={disableView}
				/>;
	};
}