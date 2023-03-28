import { useEffect, useState, } from 'react';
import {
	EDITOR_MODE__VIEW,
	EDITOR_MODE__ADD,
	EDITOR_MODE__EDIT,
} from '../../Constants/Editor.js';
import _ from 'lodash';

export default function withEditor(WrappedComponent) {
	return (props) => {

		let [editorMode, setEditorMode] = useState(EDITOR_MODE__VIEW); // Can change below, so use 'let'
		const {
				useEditor = false,
				userCanEdit = true,
				userCanView = true,
				disableAdd = false,
				disableEdit = false,
				disableDelete = false,
				disableDuplicate = false,
				disableView = false,
				getRecordIdentifier = (selection) => {
					if (selection.length > 1) {
						return 'records?';
					}
					return 'record?';
				},
				record,

				// DataMgt
				selectorId,
				selectorSelected,

				// withData
				Repository,

				// withSelection
				selection,
				setSelection,

				// withAlert
				confirm,
			} = props,
			[currentRecord, setCurrentRecord] = useState(null),
			[isEditorShown, setIsEditorShown] = useState(false),
			[isEditorViewOnly, setIsEditorViewOnly] = useState(false),
			[lastSelection, setLastSelection] = useState(),
			addRecord = async () => {
				if (!userCanEdit || disableAdd) {
					return;
				}
				const
					defaultValues = Repository.getSchema().model.defaultValues,
					addValues = _.clone(defaultValues);

				if (selectorId && !_.isEmpty(selectorSelected)) {
					addValues[selectorId] = selectorSelected.id;
				}

				const entity = await Repository.add(addValues, false, true, true);
				setSelection([entity]);
				setIsEditorViewOnly(false);
				setEditorMode(EDITOR_MODE__ADD);
				setIsEditorShown(true);
			},
			editRecord = () => {
				if (!userCanEdit || disableEdit) {
					return;
				}
				setIsEditorViewOnly(false);
				setEditorMode(EDITOR_MODE__EDIT);
				setIsEditorShown(true);
			},
			deleteRecord = (e) => {
				if (!userCanEdit || disableDelete) {
					return;
				}
				const
					isSingle = selection.length === 1,
					isPhantom = selection[0] && selection[0].isPhantom;

				if (isSingle && isPhantom) {
					onDelete();
				} else {
					const identifier = getRecordIdentifier(selection);
					confirm('Are you sure you want to delete the ' + identifier, onDelete);
				}
			},
			onDelete = async () => {
				Repository.delete(selection);
				await Repository.save();
			},
			viewRecord = () => {
				if (!userCanView) {
					return;
				}
				if (selection.length !== 1) {
					return;
				}
				setIsEditorViewOnly(true);
				setEditorMode(EDITOR_MODE__VIEW);
				setIsEditorShown(true);
			},
			duplicateRecord = async () => {
				if (!userCanEdit || disableDuplicate) {
					return;
				}
				if (selection.length !== 1) {
					return;
				}
				const
					entity = selection[0],
					idProperty = Repository.getSchema().model.idProperty,
					rawValues = _.omit(entity.rawValues, idProperty),
					duplicate = await Repository.add(rawValues, false, true);
				setSelection([duplicate]);
				setEditorMode(EDITOR_MODE__EDIT);
				setIsEditorShown(true);
			},
			onEditorSave = async (data, e) => {
				const
					what = record || selection,
					isSingle = what.length === 1;
				if (isSingle) {
					// just update this one entity
					what[0].setValues(data);

				} else if (selection.length > 1) {
					// Edit multiple entities

					// Loop through all entities and change fields that are not null
					const propertyNames = Object.getOwnPropertyNames(data);
					_.each(propertyNames, (propertyName) => {
						if (!_.isNil(data[propertyName])) {
							_.each(what, (rec) => {
								rec[propertyName] = data[propertyName]
							});
						}
					});
				}
				await Repository.save();
				setIsEditorShown(false);
			},
			onEditorCancel = async () => {
				const
					isSingle = selection.length === 1,
					isPhantom = selection[0] && selection[0].isPhantom;
				if (isSingle && isPhantom) {
					await onDelete();
				}
				setEditorMode(EDITOR_MODE__VIEW);
				setIsEditorShown(false);
			},
			onEditorClose = () => {
				setIsEditorShown(false);
			},
			calculateEditorMode = () => {
				let mode = EDITOR_MODE__VIEW;
				if (userCanEdit) {
					if (selection.length > 1) {
						if (!disableEdit) {
							// For multiple entities selected, change it to edit multiple mode
							mode = EDITOR_MODE__EDIT;
						}
					} else if (selection.length === 1 && selection.isPhantom) {
						if (!disableAdd) {
							// When a phantom entity is selected, change it to add mode.
							mode = EDITOR_MODE__ADD;
						}
					}
				}
				return mode;
			};

		useEffect(() => {
			// When selection changes, set the mode appropriately
			const mode = calculateEditorMode();
			setEditorMode(mode);
			setLastSelection(selection);
		}, [selection]);

		if (lastSelection !== selection) {
			// NOTE: If I don't calculate this on the fly for selection changes,
			// we see a flash of the previous state, since useEffect hasn't yet run.
			editorMode = calculateEditorMode();
		}

		return <WrappedComponent
					{...props}
					currentRecord={currentRecord}
					setCurrentRecord={setCurrentRecord}
					isEditorShown={isEditorShown}
					isEditorViewOnly={isEditorViewOnly}
					editorMode={editorMode}
					setEditorMode={setEditorMode}
					setIsEditorShown={setIsEditorShown}
					onAdd={addRecord}
					onEdit={editRecord}
					onDelete={deleteRecord}
					onView={viewRecord}
					onDuplicate={duplicateRecord}
					onEditorSave={onEditorSave}
					onEditorCancel={onEditorCancel}
					onEditorClose={onEditorClose}
					useEditor={useEditor}
					userCanEdit={userCanEdit}
					userCanView={userCanView}
					disableAdd={disableAdd}
					disableEdit={disableEdit}
					disableDelete={disableDelete}
					disableDuplicate={disableDuplicate}
					disableView ={disableView}
				/>;
	};
}