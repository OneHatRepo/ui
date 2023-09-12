import { useEffect, useState, useRef, } from 'react';
import {
	Button,
} from 'native-base';
import {
	EDITOR_MODE__VIEW,
	EDITOR_MODE__ADD,
	EDITOR_MODE__EDIT,
} from '../../Constants/Editor.js';
import _ from 'lodash';

export default function withEditor(WrappedComponent, isTree = false) {
	return (props) => {

		let [editorMode, setEditorMode] = useState(EDITOR_MODE__VIEW); // Can change below, so use 'let'
		const {
				userCanEdit = true,
				userCanView = true,
				canEditorViewOnly = false, // whether the editor can *ever* change state out of 'View' mode
				disableAdd = false,
				disableEdit = false,
				disableDelete = false,
				disableDuplicate = false,
				disableView = false,
				getRecordIdentifier = (selection) => {
					if (selection.length > 1) {
						return 'records?';
					}
					return 'record' + (selection[0].displayValue ? ' "' + selection[0].displayValue + '"' : '') + '?';
				},
				record,

				// parent container
				selectorId,
				selectorSelected,

				// withData
				Repository,

				// withSelection
				selection,
				setSelection,

				// withAlert
				alert,
				confirm,
				hideAlert,
			} = props,
			listeners = useRef({}),
			editorStateRef = useRef(),
			[currentRecord, setCurrentRecord] = useState(null),
			[isAdding, setIsAdding] = useState(false),
			[isEditorShown, setIsEditorShown] = useState(false),
			[isEditorViewOnly, setIsEditorViewOnly] = useState(canEditorViewOnly), // current state of whether editor is in view-only mode
			[lastSelection, setLastSelection] = useState(),
			setSelectionDecorated = (newSelection) => {
				function doIt() {
					setSelection(newSelection);
				}
				const formState = editorStateRef.current;
				if (!_.isEmpty(formState?.dirtyFields) && newSelection !== selection && editorMode === EDITOR_MODE__EDIT) {
					confirm('This record has unsaved changes. Are you sure you want to cancel editing? Changes will be lost.', doIt);
				} else {
					doIt();
				}
			},
			getListeners = () => {
				return listeners.current;
			},
			setListeners = (obj) => {
				listeners.current = obj;
				// forceUpdate(); // we don't want to get into an infinite loop of renders. Simply directly assign the listeners in every child render
			},
			onAdd = async () => {
				const defaultValues = Repository.getSchema().getDefaultValues();
				let addValues = _.clone(defaultValues);

				if (selectorId && !_.isEmpty(selectorSelected)) {
					addValues[selectorId] = selectorSelected.id;
				}

				if (getListeners().onBeforeAdd) {
					const listenerResult = await getListeners().onBeforeAdd();
					if (listenerResult === false) {
						return;
					}
				}

				if (isTree) {
					if (!selection[0]) {
						throw Error('Must select a parent node.');
					}
					addValues.parentId = selection[0].id;
				} else {
					// Set repository to sort by id DESC and switch to page 1, so this new entity is guaranteed to show up on the current page, even after saving
					const currentSorter = Repository.sorters[0];
					if (currentSorter.name !== Repository.schema.model.idProperty || currentSorter.direction !== 'DESC') {
						Repository.pauseEvents();
						Repository.sort(Repository.schema.model.idProperty, 'DESC');
						Repository.setPage(1);
						Repository.resumeEvents();
						await Repository.reload();
					}
				}

				// Unmap the values, so we can input true originalData
				addValues = Repository.unmapData(addValues);

				setIsAdding(true);
				const entity = await Repository.add(addValues, false, true);
				setSelection([entity]);
				setIsEditorViewOnly(false);
				setEditorMode(EDITOR_MODE__ADD);
				setIsEditorShown(true);

				if (getListeners().onAfterAdd) {
					await getListeners().onAfterAdd(entity);
				}
			},
			onEdit = async () => {
				if (getListeners().onBeforeEdit) {
					const listenerResult = await getListeners().onBeforeEdit();
					if (listenerResult === false) {
						return;
					}
				}
				setIsEditorViewOnly(false);
				setEditorMode(EDITOR_MODE__EDIT);
				setIsEditorShown(true);
			},
			onDelete = async (cb) => {
				if (getListeners().onBeforeDelete) {
					const listenerResult = await getListeners().onBeforeDelete();
					if (listenerResult === false) {
						return;
					}
				}
				const
					isSingle = selection.length === 1,
					firstSelection = selection[0],
					isTree = firstSelection?.isTree,
					hasChildren = isTree ? firstSelection?.hasChildren : false,
					isPhantom = firstSelection?.isPhantom;

				if (isSingle && isTree && hasChildren) {
					alert({
						title: 'Move up children?',
						message: 'The node you have selected for deletion has children. ' + 
								'Should these children be moved up to this node\'s parent, or be deleted?',
						buttons: [
							<Button colorScheme="danger" onPress={() => onMoveChildren(cb)} key="moveBtn">
								Move Children
							</Button>,
							<Button colorScheme="danger" onPress={() => onDeleteChildren(cb)} key="deleteBtn">
								Delete Children
							</Button>
						],
						includeCancel: true,
					});
				} else
				if (isSingle && isPhantom) {
					deleteRecord(cb);
				} else {
					const identifier = getRecordIdentifier(selection);
					confirm('Are you sure you want to delete the ' + identifier, () => deleteRecord(cb));
				}
			},
			onMoveChildren = (cb) => {
				hideAlert();
				deleteRecord(true, cb);
			},
			onDeleteChildren = (cb) => {
				hideAlert();
				deleteRecord(false, cb);
			},
			deleteRecord = async (moveSubtreeUp, cb) => {
				if (getListeners().onBeforeDeleteSave) {
					await getListeners().onBeforeDeleteSave(selection);
				}

				await Repository.delete(selection, moveSubtreeUp);
				if (!Repository.isAutoSave) {
					await Repository.save();
				}
				if (getListeners().onAfterDelete) {
					await getListeners().onAfterDelete(selection);
				}
				if (cb) {
					cb();
				}
			},
			viewRecord = async () => {
				if (!userCanView) {
					return;
				}
				if (selection.length !== 1) {
					return;
				}
				setIsEditorViewOnly(true);
				setEditorMode(EDITOR_MODE__VIEW);
				setIsEditorShown(true);

				if (getListeners().onAfterView) {
					await getListeners().onAfterView(entity);
				}
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

				if (getListeners().onBeforeEditSave) {
					await getListeners().onBeforeEditSave(what);
				}

				await Repository.save();

				setIsAdding(false);
				setIsEditorShown(false);
				
				if (getListeners().onAfterEdit) {
					await getListeners().onAfterEdit(what);
				}

				return true;
			},
			onEditorCancel =  () => {
				async function doIt() {
					const
						isSingle = selection.length === 1,
						isPhantom = selection[0] && selection[0].isPhantom;
					if (isSingle && isPhantom) {
						await deleteRecord();
					}
					
					setIsAdding(false);
					setEditorMode(EDITOR_MODE__VIEW);
					setIsEditorShown(false);
				}
				const formState = editorStateRef.current;
				if (!_.isEmpty(formState.dirtyFields)) {
					confirm('This record has unsaved changes. Are you sure you want to cancel editing? Changes will be lost.', doIt);
				} else {
					doIt();
				}
			},
			onEditorClose = () => {
				setIsEditorShown(false);
			},
			onEditorDelete = async () => {
				onDelete(() => {
					setEditorMode(EDITOR_MODE__VIEW);
					setIsEditorShown(false);
				});
			},
			calculateEditorMode = () => {
				let mode = editorMode;
				if (!canEditorViewOnly && userCanEdit) {
					if (selection.length > 1) {
						if (!disableEdit) {
							// For multiple entities selected, change it to edit multiple mode
							mode = EDITOR_MODE__EDIT;
						}
					} else if (selection.length === 1 && selection[0].isPhantom) {
						if (!disableAdd) {
							// When a phantom entity is selected, change it to add mode.
							mode = EDITOR_MODE__ADD;
						}
					}
				}
				return mode;
			},
			onEditMode = () => {
				setEditorMode(EDITOR_MODE__EDIT);
			},
			onViewMode = () => {
				function doIt() {
					setEditorMode(EDITOR_MODE__VIEW);
				}
				const formState = editorStateRef.current;
				if (!_.isEmpty(formState.dirtyFields)) {
					confirm('This record has unsaved changes. Are you sure you want to switch to "View" mode? Changes will be lost.', doIt);
				} else {
					doIt();
				}
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
					isAdding={isAdding}
					editorMode={editorMode}
					onEditMode={onEditMode}
					onViewMode={onViewMode}
					editorStateRef={editorStateRef}
					setIsEditorShown={setIsEditorShown}
					onAdd={(!userCanEdit || disableAdd) ? null : onAdd}
					onEdit={(!userCanEdit || disableEdit) ? null : onEdit}
					onDelete={(!userCanEdit || disableDelete || (editorMode === EDITOR_MODE__ADD && (selection[0]?.isPhantom || currentRecord?.isPhantom))) ? null : onDelete}
					onView={viewRecord}
					onDuplicate={duplicateRecord}
					onEditorSave={onEditorSave}
					onEditorCancel={onEditorCancel}
					onEditorDelete={(!userCanEdit || disableDelete || (editorMode === EDITOR_MODE__ADD && (selection[0]?.isPhantom || currentRecord?.isPhantom))) ? null : onEditorDelete}
					onEditorClose={onEditorClose}
					setWithEditListeners={setListeners}
					isEditor={true}
					userCanEdit={userCanEdit}
					userCanView={userCanView}
					disableAdd={disableAdd}
					disableEdit={disableEdit}
					disableDelete={disableDelete}
					disableDuplicate={disableDuplicate}
					disableView ={disableView}
					setSelection={setSelectionDecorated}
				/>;
	};
}