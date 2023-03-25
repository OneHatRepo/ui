import { useEffect, useState, } from 'react';
import {
	EDITOR_MODE__VIEW,
	EDITOR_MODE__ADD,
	EDITOR_MODE__EDIT,
} from '../../Constants/Editor.js';
import _ from 'lodash';

export default function withEditor(WrappedComponent) {
	return (props) => {
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
			[editorMode, setEditorMode] = useState(EDITOR_MODE__VIEW),
			addRecord = async () => {
				if (!userCanEdit) {
					return;
				}
				const
					defaultValues = Repository.getSchema().model.defaultValues,
					entity = await Repository.add(defaultValues, false, true, true);
				setSelection([entity]);
				setIsEditorViewOnly(false);
				setEditorMode(EDITOR_MODE__ADD);
				setIsEditorShown(true);
			},
			editRecord = () => {
				if (!userCanEdit) {
					return;
				}
				setIsEditorViewOnly(false);
				setEditorMode(EDITOR_MODE__EDIT);
				setIsEditorShown(true);
			},
			deleteRecord = (e) => {
				if (!userCanEdit) {
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
			onDelete = () => {
				Repository.delete(selection);
				if (!Repository.isAutoSave) {
					Repository.save();
				}
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
				if (!userCanEdit) {
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
				setIsEditorShown(true);
			},
			onEditorSave = (data, e) => {
				const
					what = record || selection,
					isSingle = what.length === 1;
				if (isSingle) {
					// just update this one entity
					what[0].setValues(data);

				} else if (selection.length > 1) {
					// Edit multiple entities


					debugger;



				}
				if (!Repository.isAutoSave) {
					Repository.save();
				}
				setIsEditorShown(false);
			},
			onEditorCancel = () => {
				const
					isSingle = selection.length === 1,
					isPhantom = selection[0] && selection[0].isPhantom;
				if (isSingle && isPhantom) {
					onDelete();
				}
				setIsEditorShown(false);
			},
			onEditorClose = () => {
				setIsEditorShown(false);
			};

		useEffect(() => {
			if (selection.length === 1 && selection.isPhantom && userCanEdit) {
				if (editorMode !== EDITOR_MODE__ADD) {
					setEditorMode(EDITOR_MODE__ADD);
				}
			} else {
				if (editorMode !== EDITOR_MODE__VIEW) {
					setEditorMode(EDITOR_MODE__VIEW);
				}
			}
		}, [selection]);

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