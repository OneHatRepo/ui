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

		if (props.disableWithEditor) {
			return <WrappedComponent {...props} />;
		}

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
				useRemoteDuplicate = false, // call specific copyToNew function on server, rather than simple duplicate on client
				getRecordIdentifier = (selection) => {
					if (selection.length > 1) {
						return 'records?';
					}
					return 'record' + (selection[0].displayValue ? ' "' + selection[0].displayValue + '"' : '') + '?';
				},
				record,
				onAdd,
				onChange, // any kind of crud change
				onDelete,
				onSave, // this could also be called 'onEdit'
				newEntityDisplayValue,
				defaultValues,

				// withComponent
				self,

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
			newEntityDisplayValueRef = useRef(),
			[currentRecord, setCurrentRecord] = useState(null),
			[isAdding, setIsAdding] = useState(false),
			[isSaving, setIsSaving] = useState(false),
			[isEditorShown, setIsEditorShown] = useState(false),
			[isEditorViewOnly, setIsEditorViewOnly] = useState(canEditorViewOnly), // current state of whether editor is in view-only mode
			[isIgnoreNextSelectionChange, setIsIgnoreNextSelectionChange] = useState(false),
			[lastSelection, setLastSelection] = useState(),
			setSelectionDecorated = (newSelection) => {
				function doIt() {
					setSelection(newSelection);
				}
				const formState = editorStateRef.current;
				if (!_.isEmpty(formState?.dirtyFields) && newSelection !== selection && editorMode === EDITOR_MODE__EDIT) {
					confirm('This record has unsaved changes. Are you sure you want to cancel editing? Changes will be lost.', doIt);
				} else if (selection && (selection[0]?.isPhantom || selection[0]?.isRemotePhantom)) {
					confirm('This new record is unsaved. Are you sure you want to cancel editing? Changes will be lost.', async () => {
						await selection[0].delete();
						doIt();
					});
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
			getNewEntityDisplayValue = () => {
				return newEntityDisplayValueRef.current;
			},
			doAdd = async (e, values) => {
				let addValues = values;

				if (!values) {
					// you can either:
					// 1. directlty submit 'values' to use in doAdd(), or
					// 2. Use the repository's default values (defined on each property as 'defaultValue'), or
					// 3. Individually override the repository's default values with submitted 'defaultValues' (given as a prop to this HOC)
					let defaultValuesToUse = Repository.getSchema().getDefaultValues();
					if (defaultValues) {
						_.merge(defaultValuesToUse, defaultValues);
					}
					addValues = _.clone(defaultValuesToUse);
				}

				if (selectorId && !_.isEmpty(selectorSelected)) {
					addValues[selectorId] = selectorSelected.id;
				}

				if (getNewEntityDisplayValue()) {
					const displayPropertyName = Repository.getSchema().model.displayProperty;
					addValues[displayPropertyName] = getNewEntityDisplayValue();
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
				setIsSaving(true);
				const entity = await Repository.add(addValues, false, true);
				setIsSaving(false);
				setIsIgnoreNextSelectionChange(true);
				setSelection([entity]);
				if (Repository.isAutoSave) {
					// for isAutoSave Repositories, submit the handers right away
					if (getListeners().onAfterAdd) {
						await getListeners().onAfterAdd(entity);
					}
					if (onAdd) {
						await onAdd(entity);
					}
				}
				setIsEditorViewOnly(false);
				setEditorMode(Repository.isAutoSave ? EDITOR_MODE__EDIT : EDITOR_MODE__ADD);
				setIsEditorShown(true);
			},
			doEdit = async () => {
				if (_.isEmpty(selection) || (_.isArray(selection) && (selection.length > 1 || selection[0]?.isDestroyed))) {
					return;
				}
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
			doDelete = async (args) => {
				let cb = null;
				if (_.isFunction(args)) {
					cb = args;
				}
				if (_.isEmpty(selection) || (_.isArray(selection) && (selection.length > 1 || selection[0]?.isDestroyed))) {
					return;
				}
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
							<Button colorScheme="danger" onPress={() => doMoveChildren(cb)} key="moveBtn">
								Move Children
							</Button>,
							<Button colorScheme="danger" onPress={() => doDeleteChildren(cb)} key="deleteBtn">
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
					confirm('Are you sure you want to delete the ' + identifier, () => deleteRecord(null, cb));
				}
			},
			doMoveChildren = (cb) => {
				hideAlert();
				deleteRecord(true, cb);
			},
			doDeleteChildren = (cb) => {
				hideAlert();
				deleteRecord(false, cb);
			},
			deleteRecord = async (moveSubtreeUp, cb) => {
				if (getListeners().onBeforeDelete) {
					const listenerResult = await getListeners().onBeforeDelete(selection);
					if (listenerResult === false) {
						return;
					}
				}

				await Repository.delete(selection, moveSubtreeUp);
				if (!Repository.isAutoSave) {
					await Repository.save();
				}
				if (getListeners().onAfterDelete) {
					await getListeners().onAfterDelete(selection);
				}
				setSelection([]);
				if (cb) {
					cb(selection);
				}
				if (onChange) {
					onChange(selection);
				}
				if (onDelete) {
					onDelete(selection);
				}
			},
			doView = async (allowEditing = false) => {
				if (!userCanView) {
					return;
				}
				if (selection.length !== 1) {
					return;
				}
				setIsEditorViewOnly(!allowEditing);
				setEditorMode(EDITOR_MODE__VIEW);
				setIsEditorShown(true);

				if (getListeners().onAfterView) {
					await getListeners().onAfterView();
				}
			},
			doDuplicate = async () => {
				if (!userCanEdit || disableDuplicate) {
					return;
				}
				if (selection.length !== 1) {
					return;
				}
				if (useRemoteDuplicate) {
					return onRemoteDuplicate();
				}
				const
					entity = selection[0],
					idProperty = Repository.getSchema().model.idProperty,
					rawValues = _.omit(entity.rawValues, idProperty),
					duplicate = await Repository.add(rawValues, false, true);
				setIsIgnoreNextSelectionChange(true);
				setSelection([duplicate]);
				setEditorMode(EDITOR_MODE__EDIT);
				setIsEditorShown(true);
			},
			onRemoteDuplicate = async () => {
				const
					entity = selection[0],
					duplicateEntity = await Repository.remoteDuplicate(entity);

				setIsIgnoreNextSelectionChange(true);
				setSelection([duplicateEntity]);
				doEdit();
			},
			doEditorSave = async (data, e) => {
				// NOTE: The Form submits onSave for both adds (when not isAutoSsave) and edits.
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

				if (getListeners().onBeforeSave) {
					const listenerResult = await getListeners().onBeforeSave(what);
					if (listenerResult === false) {
						return;
					}
				}

				setIsSaving(true);
				let success;
				try {
					await Repository.save();
					success = true;
				} catch (e) {
					// alert(e.context);
					success = false;
				}
				setIsSaving(false);

				if (success) {
					if (onChange) {
						onChange(what);
					}
					if (editorMode === EDITOR_MODE__ADD) {
						if (onAdd) {
							await onAdd(what);
						}
						if (getListeners().onAfterAdd) {
							await getListeners().onAfterAdd(what);
						}
						setIsAdding(false);
						setEditorMode(EDITOR_MODE__EDIT);
					} else if (editorMode === EDITOR_MODE__EDIT) {
						if (getListeners().onAfterEdit) {
							await getListeners().onAfterEdit(what);
						}
						if (onSave) {
							onSave(what);
						}
					}
					// setIsEditorShown(false);
				}

				return success;
			},
			doEditorCancel =  () => {
				async function doIt() {
					const
						isSingle = selection.length === 1,
						isPhantom = selection[0] && !selection[0]?.isDestroyed && selection[0].isPhantom;
					if (isSingle && isPhantom) {
						await deleteRecord();
					}
					
					setIsAdding(false);
					setIsEditorShown(false);
				}
				const formState = editorStateRef.current;
				if (!_.isEmpty(formState.dirtyFields)) {
					confirm('This record has unsaved changes. Are you sure you want to cancel editing? Changes will be lost.', doIt);
				} else {
					doIt();
				}
			},
			doEditorClose = () => {
				if (isAdding) {
					doEditorCancel();
				}
				setIsEditorShown(false);
			},
			doEditorDelete = async () => {
				doDelete(() => {
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
					} else if (selection.length === 1 && !selection[0].isDestroyed && selection[0].isPhantom) {
						if (!disableAdd) {
							// When a phantom entity is selected, change it to add mode.
							mode = EDITOR_MODE__ADD;
						}
					}
				}
				return mode;
			},
			setEditMode = () => {
				setEditorMode(EDITOR_MODE__EDIT);
			},
			setViewMode = () => {
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
			let mode;
			if (isIgnoreNextSelectionChange) {
				// on selection change from doAdd/doDuplicate/etc, calculate whether to put Editor in "add" or "edit" mode
				mode = calculateEditorMode();
			} else {
				// Most of the time, if selection changed, put the Editor in "view" mode
				mode = EDITOR_MODE__VIEW;
			}
			setEditorMode(mode);

			setIsIgnoreNextSelectionChange(false);
			setLastSelection(selection);
		}, [selection]);

		if (self) {
			self.add = doAdd;
			self.edit = doEdit;
			self.delete = doDelete;
			self.moveChildren = doMoveChildren;
			self.deleteChildren = doDeleteChildren;
			self.duplicate = doDuplicate;
		}
		newEntityDisplayValueRef.current = newEntityDisplayValue;

		if (lastSelection !== selection) {
			// NOTE: If I don't calculate this on the fly for selection changes,
			// we see a flash of the previous state, since useEffect hasn't yet run.
			// (basically redo what's in the useEffect, above)
			if (isIgnoreNextSelectionChange) {
				editorMode = calculateEditorMode();
			} else {
				editorMode = EDITOR_MODE__VIEW;
			}
		}

		return <WrappedComponent
					{...props}
					disableWithEditor={false}
					currentRecord={currentRecord}
					setCurrentRecord={setCurrentRecord}
					isEditorShown={isEditorShown}
					isEditorViewOnly={isEditorViewOnly}
					isAdding={isAdding}
					isSaving={isSaving}
					editorMode={editorMode}
					onEditMode={setEditMode}
					onViewMode={setViewMode}
					editorStateRef={editorStateRef}
					setIsEditorShown={setIsEditorShown}
					onAdd={(!userCanEdit || disableAdd) ? null : doAdd}
					onEdit={(!userCanEdit || disableEdit) ? null : doEdit}
					onDelete={(!userCanEdit || disableDelete) ? null : doDelete}
					onView={doView}
					onDuplicate={doDuplicate}
					onEditorSave={doEditorSave}
					onEditorCancel={doEditorCancel}
					onEditorDelete={(!userCanEdit || disableDelete) ? null : doEditorDelete}
					onEditorClose={doEditorClose}
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