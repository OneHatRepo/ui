import { useState, } from 'react';
import {
	Column,
	Icon,
	Modal,
	Pressable,
	Row,
	Text,
} from 'native-base';
import _ from 'lodash';

export default function withEditor(WrappedComponent) {
	return (props) => {
		const {
				Repository,
				defaultData = {},
				ignoreFields = [],
				userCanEdit = true,
				userCanView = true,
				disableAdd = false,
				disableEdit = false,
				disableRemove = false,
				disableDuplicate = false,
				disableView = false,
				getRecordIdentifier = (record) => {
					if (_.isArray(record)) {
						return 'records?';
					}
					return 'record?';
				},
			} = props,
			[currentRecord, setCurrentRecord] = useState(null),
			[isRecordChanged, setIsRecordChanged] = useState(null),
			[isEditable, setIsEditable] = useState(true),
			[isEditorShown, setIsEditorShown] = useState(false),
			// [isEditable, setIsEditable] = useState(true),
			addRecord = () => {
				setIsEditorShown(true);


				const entity = Repository.add({
					// defaults are where??
				});
			},
			editRecord = () => {
				setIsEditorShown(true);
			},
			removeRecord = () => {},
			viewRecord = () => {},
			duplicateRecord = () => {},
			resetRecord = () => {},
			saveRecord = () => {},
			onEditorSave = () => {},
			onEditorCancel = () => {
				setIsEditorShown(false);
			},
			checkIsRecordChanged = (compareData) => {
				// Compare the currently selected record with the values in the form
				const currentRecordSubmitData = currentRecord.submitData;
				let isRecordChanged = false;

				// Should we just use @onehat/data's entity.isDirty?
				// No-- doesn't take ignoreFields into account.



				setIsRecordChanged(isRecordChanged);
			},
			makeRecordChanges = () => {},
			isJson = (str) => { // modified from https://stackoverflow.com/a/20392392
				let o;
				try {
					o = JSON.parse(str);
					if (o && typeof o === 'object') {
						return o;
					}
				} catch (e) {}
				return false;
			};

		return <WrappedComponent
					{...props}
					editorType={editorType}
					defaultData={defaultData}
					currentRecord={currentRecord}
					setCurrentRecord={setCurrentRecord}
					isEditable={isEditable}
					isEditorShown={isEditorShown}
					setIsEditorShown={setIsEditorShown}
					isRecordChanged={isRecordChanged}
					onAdd={addRecord}
					onEdit={editRecord}
					onRemove={removeRecord}
					onView={viewRecord}
					onDuplicate={duplicateRecord}
					onReset={resetRecord}
					onEditorSave={onEditorSave}
					onEditorCancel={onEditorCancel}
					disableAdd={disableAdd}
					disableEdit={disableEdit}
					disableRemove={disableRemove}
					disableDuplicate={disableDuplicate}
					disableView ={disableView}
				/>;
	};
}