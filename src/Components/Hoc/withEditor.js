import { forwardRef, useContext, useEffect, useState, useRef, } from 'react';
import {
	ADD,
	EDIT,
	DELETE,
	VIEW,
	DUPLICATE,
} from '../../Constants/Commands.js';
import {
	EDITOR_MODE__VIEW,
	EDITOR_MODE__ADD,
	EDITOR_MODE__EDIT,
	EDITOR_TYPE__SIDE,
	EDITOR_TYPE__INLINE,
} from '../../Constants/Editor.js';
import useForceUpdate from '../../Hooks/useForceUpdate.js'
import Button from '../Buttons/Button.js';
import EditorModeContext from '../../Contexts/EditorModeContext.js';
import UiGlobals from '../../UiGlobals.js';
import _ from 'lodash';

export default function withEditor(WrappedComponent, isTree = false) {
	return forwardRef((props, ref) => {

		if (props.disableWithEditor || props.alreadyHasWithEditor) {
			return <WrappedComponent {...props} ref={ref} isTree={isTree} />;
		}

		const {
				userCanEdit = true, // not permissions, but capability
				userCanView = true,
				canEditorViewOnly = false, // whether the editor can *ever* change state out of 'View' mode
				canProceedWithCrud, // fn returns bool on if the CRUD operation can proceed
				canRecordBeEdited, // fn(selection) returns bool on if the current record(s) can be edited
				canRecordBeDeleted, // fn(selection) returns bool on if the current record(s) can be deleted
				disableAdd = false,
				disableEdit = false,
				disableDelete = false,
				enableMultiDelete = false, // deleting multiple records at once is opt-in only
				disableDuplicate = false,
				disableView = false,
				useRemoteDuplicate = false, // call specific copyToNew function on server, rather than simple duplicate on client
				getDuplicateValues, // fn(entity) to get default values for duplication
				getRecordIdentifier = (selection) => {
					if (selection.length > 1) {
						return 'records?';
					}
					return 'record' + (selection[0].displayValue ? ' "' + selection[0].displayValue + '"' : '') + '?';
				},
				editorType,
				onAdd,
				onBeforeAdd,
				onChange, // any kind of crud change
				onBeforeDelete,
				onDelete,
				onSave, // this could also be called 'onEdit'
				onEditorClose,
				newEntityDisplayValue,
				newEntityDisplayProperty, // in case the field to set for newEntityDisplayValue is different from model
				defaultValues,
				editorMode: parentEditorModeProp,
				initialEditorMode = EDITOR_MODE__VIEW,
				stayInEditModeOnSelectionChange = false,
				inheritParentEditorMode = true,

				// withComponent
				self,

				// parent container
				selectorId,
				selectorSelected,
				selectorSelectedField = 'id',

				// withData
				Repository,

				// withPermissions
				canUser,
				showPermissionsError,

				// withSelection
				selection,
				getSelection,
				setSelection,

				// withAlert
				alert,
				confirm,
				hideAlert,
			} = props,
			parentEditorModeContext = useContext(EditorModeContext),
			forceUpdate = useForceUpdate(),
			listeners = useRef({}),
			editorStateRef = useRef(),
			newEntityDisplayValueRef = useRef(),
			editorModeRef = useRef(initialEditorMode),
			isIgnoreNextSelectionChangeRef = useRef(false),
			isEditorShownRef = useRef(false),
			defaultValuesRef = useRef(defaultValues),
			canEditorBeInEditModeRef = useRef(true), // whether the editor is allowed to be in edit mode based on canRecordBeEdited
			[currentRecord, setCurrentRecord] = useState(null),
			[isAdding, setIsAdding] = useState(false),
			[isSaving, setIsSaving] = useState(false),
			[isEditorViewOnly, setIsEditorViewOnly] = useState(canEditorViewOnly), // current state of whether editor is in view-only mode
			[lastSelection, setLastSelection] = useState(),
			setIsIgnoreNextSelectionChange = (bool) => {
				isIgnoreNextSelectionChangeRef.current = bool;
			},
			getIsIgnoreNextSelectionChange = () => {
				return isIgnoreNextSelectionChangeRef.current;
			},
			setIsEditorShown = (bool) => {
				isEditorShownRef.current = bool;
				forceUpdate();
				if (!bool && onEditorClose) {
					onEditorClose();
				}
			},
			getIsEditorShown = () => {
				return isEditorShownRef.current;
			},
			getDefaultValues = () => {
				return defaultValuesRef.current;
			},
			setDefaultValues = (vals) => {
				defaultValuesRef.current = vals;
			},
			setCanEditorBeInEditMode = (bool) => {
				canEditorBeInEditModeRef.current = bool;
				forceUpdate();
			},
			getCanEditorBeInEditMode = () => {
				return canEditorBeInEditModeRef.current;
			},
			setIsWaitModalShown = (bool) => {
				const
					dispatch = UiGlobals.redux?.dispatch,
					setIsWaitModalShownAction = UiGlobals.systemReducer?.setIsWaitModalShownAction;
				if (setIsWaitModalShownAction) {
					console.log('withEditor:setIsWaitModalShownAction', bool);
					dispatch(setIsWaitModalShownAction(bool));
				}
			},
			setSelectionDecorated = (newSelection) => {
				function doIt() {
					setSelection(newSelection);
				}
				const
					formState = editorStateRef.current,
					selection = getSelection();
				if (!_.isEmpty(formState?.dirtyFields) && newSelection !== selection && getEditorMode() === EDITOR_MODE__EDIT) {
					confirm('This record has unsaved changes. Are you sure you want to cancel editing? Changes will be lost.', doIt);
				} else if (selection && selection[0] && !selection[0].isDestroyed && selection[0].isPhantom) {
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
			getEditorMode = () => {
				return editorModeRef.current;
			},
			setEditorMode = (mode) => {
				if (editorModeRef.current !== mode) {
					editorModeRef.current = mode;
					forceUpdate();
				}
			},
			getParentEditorMode = () => {
				const contextMode = parentEditorModeContext?.effectiveEditorMode || null;
				if (contextMode) {
					return contextMode;
				}

				// Some modal implementations break React context boundaries. Fall back to
				// an explicitly-passed parent mode so nested ancillary editors still inherit.
				if (parentEditorModeProp === EDITOR_MODE__ADD) {
					return EDITOR_MODE__EDIT;
				}
				if (parentEditorModeProp === EDITOR_MODE__EDIT || parentEditorModeProp === EDITOR_MODE__VIEW) {
					return parentEditorModeProp;
				}

				return null;
			},
			getInheritedEditorMode = () => {
				if (!inheritParentEditorMode) {
					return null;
				}
				const parentMode = getParentEditorMode();
				if (parentMode === EDITOR_MODE__ADD) {
					return EDITOR_MODE__EDIT;
				}
				if (parentMode === EDITOR_MODE__EDIT || parentMode === EDITOR_MODE__VIEW) {
					return parentMode;
				}
				return null;
			},
			getIsParentSaveLocked = () => {
				return !!parentEditorModeContext?.isAnyAncestorUnsaved;
			},
			getIsCurrentSelectionUnsaved = () => {
				const selection = getSelection();
				if (!selection || selection.length !== 1) {
					return false;
				}
				const record = selection[0];
				if (!record || record.isDestroyed) {
					return false;
				}
				return !!record.isPhantom;
			},
			getIsEditorDisabledByParent = () => {
				return getIsParentSaveLocked();
			},
			getIsEditorModeControlledByParent = () => {
				return !!getInheritedEditorMode();
			},
			getNewEntityDisplayValue = () => {
				return newEntityDisplayValueRef.current;
			},
			setNewEntityDisplayValue = (val) => {
				newEntityDisplayValueRef.current = val;
			},
			showViewFallback = async () => {
				// helper for doEdit
				// If the editor is forced into EDIT mode by parent inheritance, 
				// but the child editor cannot actually be in edit mode due to permissions or configuration, 
				// switch the mode to VIEW.

				if (!userCanView) {
					return;
				}
				if (canUser && !canUser(VIEW)) {
					showPermissionsError(VIEW);
					return;
				}
				if (canProceedWithCrud && !canProceedWithCrud()) {
					return;
				}
				if (editorType === EDITOR_TYPE__INLINE) {
					return;
				}
				const selection = getSelection();
				if (selection.length !== 1) {
					return;
				}
				setIsEditorViewOnly(true);
				setEditorMode(EDITOR_MODE__VIEW);
				setIsEditorShown(true);
				if (getListeners().onAfterView) {
					await getListeners().onAfterView();
				}
			},
			doAdd = async (e, values) => {
				if (getIsEditorDisabledByParent()) {
					return;
				}
				if (getInheritedEditorMode() === EDITOR_MODE__VIEW) {
					return;
				}
				if (canUser && !canUser(ADD)) {
					showPermissionsError(ADD);
					return;
				}
				if (canProceedWithCrud && !canProceedWithCrud()) {
					return;
				}

				const selection = getSelection();
				let addValues = values;

				if (Repository?.isLoading) {
					// NOTE: This is a hack to prevent adding a new record while the repository is still loading.
					// This can happen when the repository is still loading, and the user clicks the 'Add' button.
					setTimeout(() => {
						doAdd(e, values);
					}, 500);
					return;
				}

				if (!values) {
					// you can either:
					// 1. directlty submit 'values' to use in doAdd(), or
					// 2. Use the repository's default values (defined on each property as 'defaultValue'), or
					// 3. Individually override the repository's default values with submitted 'defaultValues' (given as a prop to this HOC)
					let defaultValuesToUse = Repository.getSchema().getDefaultValues();
					if (getDefaultValues()) {
						_.merge(defaultValuesToUse, getDefaultValues());
					}
					addValues = {...defaultValuesToUse};
				}

				if (selectorId && !_.isEmpty(selectorSelected)) {
					addValues[selectorId] = selectorSelected[selectorSelectedField];
				}

				if (getNewEntityDisplayValue()) {
					const displayPropertyName = newEntityDisplayProperty || Repository.getSchema().model.displayProperty;
					addValues[displayPropertyName] = getNewEntityDisplayValue();
				}

				if (getListeners().onBeforeAdd) {
					// This listener is set by child components using setWithEditListeners()
					const listenerResult = await getListeners().onBeforeAdd(addValues);
					if (listenerResult === false) {
						return;
					}
					if (listenerResult) {
						// allow the listener to override the addValues by returning an object
						addValues = listenerResult;
					}
				}
				if (onBeforeAdd) {
					// This listener is set by parent components using a prop
					const listenerResult = await onBeforeAdd(addValues);
					if (listenerResult === false) {
						return;
					}
					if (listenerResult) {
						// allow the listener to override the addValues by returning an object
						addValues = listenerResult;
					}
				}

				if (isTree) {
					if (!selection[0]) {
						throw Error('Must select a parent node.');
					}
					const parent = selection[0];
					addValues.parentId = parent.id;
					addValues.depth = parent.depth +1;
				} else {
					// Set repository to sort by id DESC and switch to page 1, so this new entity is guaranteed to show up on the current page, even after saving
					const currentSorter = Repository.sorters[0];
					if (currentSorter.name.match(/__sort_order$/)) { // when it's using a sort column, keep using it
						if (currentSorter.direction !== 'DESC') {
							Repository.pauseEvents();
							Repository.sort(currentSorter.name, 'DESC');
							Repository.setPage(1);
							Repository.resumeEvents();
							await Repository.reload();
						}
					} else if (currentSorter.name !== Repository.schema.model.idProperty || currentSorter.direction !== 'DESC') {
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
				if (getListeners().onAfterAdd) {
					await getListeners().onAfterAdd(entity);
				}
				if (Repository.isAutoSave) {
					// for isAutoSave Repositories, submit the handers right away
					if (getListeners().onAfterAddSave) {
						await getListeners().onAfterAddSave(selection);
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
				if (getIsEditorDisabledByParent()) {
					return;
				}
				const inheritedEditorMode = getInheritedEditorMode();
				if (inheritedEditorMode === EDITOR_MODE__VIEW) {
					await doView(false);
					return;
				}
				if (inheritedEditorMode === EDITOR_MODE__EDIT && (!userCanEdit || disableEdit || canEditorViewOnly)) {
					await showViewFallback();
					return;
				}
				if (canUser && !canUser(EDIT)) {
					if (inheritedEditorMode === EDITOR_MODE__EDIT) {
						await showViewFallback();
						return;
					}
					showPermissionsError(EDIT);
					return;
				}
				if (canProceedWithCrud && !canProceedWithCrud()) {
					return;
				}
				const selection = getSelection();
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
				if (getIsEditorDisabledByParent()) {
					return;
				}
				if (getInheritedEditorMode() === EDITOR_MODE__VIEW) {
					return;
				}
				if (canUser && !canUser(DELETE)) {
					showPermissionsError(DELETE);
					return;
				}
				if (canProceedWithCrud && !canProceedWithCrud()) {
					return;
				}
				let cb = null;
				if (_.isFunction(args)) {
					cb = args;
				}
				const selection = getSelection();
				const hasTreeSelection = isTree || _.some(selection, (selected) => !!selected?.isTree);
				if (
					_.isEmpty(selection) ||
					(_.isArray(selection) && (
						selection[0]?.isDestroyed ||
						(selection.length > 1 && (!enableMultiDelete || hasTreeSelection))
					))
				) {
					return;
				}
				if (onBeforeDelete) {
					// This listener is set by parent components using a prop
					const listenerResult = await onBeforeDelete(selection);
					if (listenerResult === false) {
						return;
					}
				}
				if (getListeners().onBeforeDelete) {
					// This listener is set by child components using setWithEditListeners()
					const listenerResult = await getListeners().onBeforeDelete();
					if (listenerResult === false) {
						return;
					}
				}
				const
					isSingle = selection.length === 1,
					firstSelection = selection[0],
					isTreeNode = firstSelection?.isTree,
					hasChildren = isTreeNode ? firstSelection?.hasChildren : false,
					isPhantom = firstSelection?.isPhantom;

				if (isSingle && isTreeNode && hasChildren) {
					alert({
						title: 'Move up children?',
						message: 'The node you have selected for deletion has children. ' + 
								'Should these children be moved up to this node\'s parent, or be deleted?',
						buttons: [
							<Button
								key="moveBtn"
								colorScheme="danger"
								onPress={() => doMoveChildren(cb)}
								text="Move Children"
							/>,
							<Button
								key="deleteBtn"
								colorScheme="danger"
								onPress={() => doDeleteChildren(cb)}
								text="Delete Children"
							/>
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
				if (canUser && !canUser(DELETE)) {
					showPermissionsError(DELETE);
					return;
				}
				const selection = getSelection();
				if (onBeforeDelete) {
					// This listener is set by parent components using a prop
					const listenerResult = await onBeforeDelete(selection);
					if (listenerResult === false) {
						return;
					}
				}
				if (getListeners().onBeforeDelete) {
					// This listener is set by child components using setWithEditListeners()
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
				if (getIsEditorDisabledByParent()) {
					return;
				}
				const inheritedEditorMode = getInheritedEditorMode();
				if (inheritedEditorMode === EDITOR_MODE__EDIT) {
					await doEdit();
					return;
				}
				if (inheritedEditorMode === EDITOR_MODE__VIEW) {
					allowEditing = false;
				}
				if (!userCanView) {
					return;
				}
				if (canUser && !canUser(VIEW)) {
					showPermissionsError(VIEW);
					return;
				}
				if (canProceedWithCrud && !canProceedWithCrud()) {
					return;
				}
				if (editorType === EDITOR_TYPE__INLINE) {
					alert('Cannot view in inline editor.');
					return; // inline editor doesn't have a view mode
				}

				// check permissions for view

				const selection = getSelection();
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
				if (getIsEditorDisabledByParent()) {
					return;
				}
				if (getInheritedEditorMode() === EDITOR_MODE__VIEW) {
					return;
				}
				if (!userCanEdit || disableDuplicate) {
					return;
				}
				if (canUser && !canUser(DUPLICATE)) {
					showPermissionsError(DUPLICATE);
					return;
				}
				if (canProceedWithCrud && !canProceedWithCrud()) {
					return;
				}

				const selection = getSelection();
				if (selection.length !== 1) {
					return;
				}

				if (useRemoteDuplicate) {
					return await onRemoteDuplicate();
				}

				let isSuccess = false,
					duplicateEntity;
				try {
					const
						entity = selection[0],
						idProperty = Repository.getSchema().model.idProperty,
						rawValues = getDuplicateValues ? getDuplicateValues(entity) : _.omit(entity.getOriginalData(), idProperty);
					rawValues.id = null; // unset the id of the duplicate

					setIsWaitModalShown(true);

					duplicateEntity = await Repository.add(rawValues, false, true);
					isSuccess = true;

				} catch(err) {
					// do nothing
				} finally {
					setIsWaitModalShown(false);
				}

				if (isSuccess) {
					setIsIgnoreNextSelectionChange(true);
					setSelection([duplicateEntity]);
					setEditorMode(EDITOR_MODE__EDIT);
					setIsEditorShown(true);
				}
			},
			onRemoteDuplicate = async () => {
				let isSuccess = false,
					duplicateEntity;
				try {
					const
						selection = getSelection(),
						entity = selection[0];
					
					setIsWaitModalShown(true);

					duplicateEntity = await Repository.remoteDuplicate(entity);
					isSuccess = true;
					
				} catch(err) {
					// do nothing
				} finally {
					setIsWaitModalShown(false);
				}
				if (isSuccess) {
					setIsIgnoreNextSelectionChange(true);
					setSelection([duplicateEntity]);
					doEdit();
					return duplicateEntity;
				}
			},
			doEditorSave = async (data, e) => {
				if (getIsEditorDisabledByParent()) {
					return false;
				}
				let mode = getEditorMode() === EDITOR_MODE__ADD ? ADD : EDIT;
				if (canUser && !canUser(mode)) {
					showPermissionsError(mode);
					return;
				}

				// NOTE: The Form submits onSave for both adds (when not isAutoSsave) and edits.
				const
					selection = getSelection(),
					isSingle = selection.length === 1;
				let useStaged = false;
				if (isSingle) {
					// just update this one entity
					selection[0].setValues(data);

					// In ADD mode, if record is phantom and nothing is dirty, stage it so save() still submits and solidifies.
					if (getEditorMode() === EDITOR_MODE__ADD && selection[0].isPhantom && !selection[0].isDirty) {
						selection[0].markStaged();
						useStaged = true;
					}

				} else if (selection.length > 1) {
					// Edit multiple entities

					// Loop through all entities and change fields that are not null
					const propertyNames = Object.getOwnPropertyNames(data);
					_.each(propertyNames, (propertyName) => {
						if (!_.isNil(data[propertyName])) {
							_.each(selection, (rec) => {
								rec[propertyName] = data[propertyName]
							});
						}
					});
				}

				if (getListeners().onBeforeSave) {
					const listenerResult = await getListeners().onBeforeSave(selection);
					if (listenerResult === false) {
						return;
					}
				}

				setIsSaving(true);
				let success = true;
				const tempListener = (msg, data) => {
					success = false;
				};

				Repository.on('error', tempListener); // add a temporary listener for the error event
				await Repository.save(null, useStaged);
				Repository.off('error', tempListener); // remove the temporary listener
				
				setIsSaving(false);

				if (_.isBoolean(success) && success) {
					if (onChange) {
						onChange(selection);
					}
					if (getEditorMode() === EDITOR_MODE__ADD) {
						if (onAdd) {
							await onAdd(selection);
						}
						if (getListeners().onAfterAddSave) {
							await getListeners().onAfterAddSave(selection);
						}
						setIsAdding(false);
						if (!canUser || canUser(EDIT)) {
							setEditorMode(EDITOR_MODE__EDIT);
						} else {
							setEditorMode(EDITOR_MODE__VIEW);
						}
					} else if (getEditorMode() === EDITOR_MODE__EDIT) {
						if (getListeners().onAfterEdit) {
							await getListeners().onAfterEdit(selection);
						}
						if (onSave) {
							onSave(selection);
						}
					}
					if (editorType === EDITOR_TYPE__INLINE) {
						setIsEditorShown(false);
					}
				}

				return success;
			},
			doEditorCancel =  () => {
				async function doIt() {
					const
						selection = getSelection(),
						isSingle = selection.length === 1,
						isPhantom = selection[0] && !selection[0]?.isDestroyed && selection[0].isPhantom;
					if (isSingle && isPhantom) {
						await deleteRecord();
					}
					
					setIsAdding(false);
					setIsEditorShown(false);
				}
				const formState = editorStateRef.current;
				if (!formState) {
					setIsAdding(false);
					setIsEditorShown(false);
					return;
				}
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
				if (getIsEditorDisabledByParent()) {
					return;
				}
				if (getInheritedEditorMode() === EDITOR_MODE__VIEW) {
					return;
				}
				if (canUser && !canUser(DELETE)) {
					showPermissionsError(DELETE);
					return;
				}

				doDelete(() => {
					setEditorMode(EDITOR_MODE__VIEW);
					setIsEditorShown(false);
				});
			},
			calculateEditorMode = () => {
				// Calculate the editor's effective mode based on parent inheritance, permissions, and local selection state.
				// Priority order:
				// 1. If parent is save-locked (unsaved ancestor), force VIEW mode
				// 2. If parent forces VIEW mode via inheritance, return VIEW (child cannot edit if parent is view-only)
				// 3. If parent forces EDIT mode via inheritance, check child permissions:
				//    a. If parent disabled, child disabled, or child cannot edit, return VIEW
				//    b. If single phantom record, return ADD (new record being created)
				//    c. Otherwise return EDIT or VIEW based on selection count
				// 4. Fall back to local selection heuristics (multiple→EDIT, single→VIEW, stays in previous mode if configured)
				const
					selection = getSelection(),
					inheritedEditorMode = getInheritedEditorMode();

				if (getIsEditorDisabledByParent()) {
					return EDITOR_MODE__VIEW;
				}

				if (inheritedEditorMode === EDITOR_MODE__VIEW) {
					return EDITOR_MODE__VIEW;
				}

				if (inheritedEditorMode === EDITOR_MODE__EDIT) {
					if (!getCanEditorBeInEditMode()) {
						return EDITOR_MODE__VIEW;
					}
					if (canEditorViewOnly || !userCanEdit || disableEdit) {
						return EDITOR_MODE__VIEW;
					}
					if (canUser && !canUser(EDIT)) {
						return EDITOR_MODE__VIEW;
					}
					if (canRecordBeEdited && canRecordBeEdited(selection) === false) {
						return EDITOR_MODE__VIEW;
					}
					if (selection.length === 1 && !selection[0].isDestroyed && selection[0].isPhantom && !disableAdd) {
						return EDITOR_MODE__ADD;
					}
					return selection.length ? EDITOR_MODE__EDIT : EDITOR_MODE__VIEW;
				}

				if (!getCanEditorBeInEditMode()) { // this is a result of canRecordBeEdited returning false
					return EDITOR_MODE__VIEW;
				}

				let isIgnoreNextSelectionChange = getIsIgnoreNextSelectionChange(),
					doStayInEditModeOnSelectionChange = stayInEditModeOnSelectionChange;
				if (!_.isNil(UiGlobals.stayInEditModeOnSelectionChange)) {
					// allow global override to for this property
					doStayInEditModeOnSelectionChange = UiGlobals.stayInEditModeOnSelectionChange;
				}
				if (doStayInEditModeOnSelectionChange) {
					isIgnoreNextSelectionChange = true;
				}

				// calculateEditorMode gets called only on selection changes
				let mode;
				if (editorType === EDITOR_TYPE__SIDE && !_.isNil(UiGlobals.isSideEditorAlwaysEditMode) && UiGlobals.isSideEditorAlwaysEditMode) {
					// special case: side editor is always edit mode
					mode = EDITOR_MODE__EDIT;
				} else {
					if (isIgnoreNextSelectionChange) {
						mode = getEditorMode();
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
					} else {
						mode = selection.length > 1 ? EDITOR_MODE__EDIT : EDITOR_MODE__VIEW;
					}
				}
				return mode;
			},
			setEditMode = () => {
				if (getIsEditorDisabledByParent() || getIsEditorModeControlledByParent()) {
					return;
				}
				if (canUser && !canUser(EDIT)) {
					showPermissionsError(EDIT);
					return;
				}

				setEditorMode(EDITOR_MODE__EDIT);
			},
			setViewMode = () => {
				if (getIsEditorDisabledByParent() || getIsEditorModeControlledByParent()) {
					return;
				}
				if (canUser && !canUser(VIEW)) {
					showPermissionsError(VIEW);
					return;
				}

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

		const
			inheritedEditorMode = getInheritedEditorMode(),
			isEditorDisabledByParent = getIsEditorDisabledByParent(),
			isEditorModeControlledByParent = getIsEditorModeControlledByParent(),
			isCurrentSelectionUnsaved = getIsCurrentSelectionUnsaved(),
			isAnyAncestorUnsaved = getIsParentSaveLocked() || isCurrentSelectionUnsaved,
			isCrudBlockedByInheritedView = inheritedEditorMode === EDITOR_MODE__VIEW;

		useEffect(() => {

			if (editorType === EDITOR_TYPE__SIDE) {
				if (isEditorDisabledByParent) {
					setIsEditorShown(false);
				} else if (selection?.length) { // || isAdding
					// there is a selection, so show the editor
					setIsEditorShown(true);
				} else {
					// no selection, so close the editor
					setIsEditorShown(false);
				}
			}

			if (canRecordBeEdited && canRecordBeEdited(selection) === false) {
				setCanEditorBeInEditMode(false);
			} else {
				setCanEditorBeInEditMode(true);
			}

			if (isEditorDisabledByParent || inheritedEditorMode === EDITOR_MODE__VIEW) {
				setIsEditorViewOnly(true);
			} else if (inheritedEditorMode === EDITOR_MODE__EDIT) {
				const canEditInInheritedMode =
					!canEditorViewOnly &&
					userCanEdit &&
					!disableEdit &&
					(!canUser || canUser(EDIT)) &&
					(!canRecordBeEdited || canRecordBeEdited(selection));
				setIsEditorViewOnly(!canEditInInheritedMode);
			}

			setEditorMode(calculateEditorMode());
			setLastSelection(selection);
			
			// Push isIgnoreNextSelectionChange until after a microtask to ensure all
			// synchronous operations (including listener callbacks) are complete
			// (this is to prevent the editor from immediately switching modes on doAdd in Tree)
			Promise.resolve().then(() => {
				setIsIgnoreNextSelectionChange(false);
			});
		}, [selection, inheritedEditorMode, isEditorDisabledByParent]);

		if (self) {
			self.add = doAdd;
			self.edit = doEdit;
			self.delete = doDelete;
			self.moveChildren = doMoveChildren;
			self.deleteChildren = doDeleteChildren;
			self.duplicate = doDuplicate;
			self.setIsEditorShown = setIsEditorShown;
		}
		setNewEntityDisplayValue(newEntityDisplayValue);
		setDefaultValues(defaultValues);

		if (lastSelection !== selection) {
			// NOTE: If I don't calculate this on the fly for selection changes,
			// we see a flash of the previous state, since useEffect hasn't yet run.
			// (basically redo what's in the useEffect, above)
			setEditorMode(calculateEditorMode());
		}

		const editorModeContextValue = {
			effectiveEditorMode: getEditorMode(),
			isAnyAncestorUnsaved,
		};

		return <EditorModeContext.Provider value={editorModeContextValue}>
				<WrappedComponent
					{...props}
					ref={ref}
					disableWithEditor={false}
					alreadyHasWithEditor={true}
					currentRecord={currentRecord}
					setCurrentRecord={setCurrentRecord}
					isEditorShown={getIsEditorShown()}
					getIsEditorShown={getIsEditorShown}
					isEditorViewOnly={isEditorViewOnly}
					isEditorModeControlledByParent={isEditorModeControlledByParent}
					isEditorDisabledByParent={isEditorDisabledByParent}
					isAdding={isAdding}
					isSaving={isSaving}
					editorMode={getEditorMode()}
					getEditorMode={getEditorMode}
					onEditMode={(isEditorModeControlledByParent || isEditorDisabledByParent) ? null : setEditMode}
					onViewMode={(isEditorModeControlledByParent || isEditorDisabledByParent) ? null : setViewMode}
					editorStateRef={editorStateRef}
					setIsEditorShown={setIsEditorShown}
					setIsIgnoreNextSelectionChange={setIsIgnoreNextSelectionChange}
					onAdd={(isEditorDisabledByParent || isCrudBlockedByInheritedView || !userCanEdit || disableAdd) ? null : doAdd}
					onEdit={(isEditorDisabledByParent || isCrudBlockedByInheritedView || !userCanEdit || disableEdit || (canRecordBeEdited && !canRecordBeEdited(selection))) ? null : doEdit}
					onDelete={(isEditorDisabledByParent || isCrudBlockedByInheritedView || !userCanEdit || disableDelete || (canRecordBeDeleted && !canRecordBeDeleted(selection))) ? null : doDelete}
					onView={isEditorDisabledByParent ? null : doView}
					onDuplicate={(isEditorDisabledByParent || isCrudBlockedByInheritedView) ? null : doDuplicate}
					onEditorSave={doEditorSave}
					onEditorCancel={doEditorCancel}
					onEditorDelete={(isEditorDisabledByParent || isCrudBlockedByInheritedView || !userCanEdit || disableDelete) ? null : doEditorDelete}
					onEditorClose={doEditorClose}
					setWithEditListeners={setListeners}
					isEditor={true}
					userCanEdit={userCanEdit}
					userCanView={userCanView}
					enableMultiDelete={enableMultiDelete}
					disableAdd={disableAdd || isEditorDisabledByParent || isCrudBlockedByInheritedView}
					disableEdit={disableEdit || isEditorDisabledByParent || isCrudBlockedByInheritedView}
					disableDelete={disableDelete || isEditorDisabledByParent || isCrudBlockedByInheritedView}
					disableDuplicate={disableDuplicate || isEditorDisabledByParent || isCrudBlockedByInheritedView}
					disableView ={disableView || isEditorDisabledByParent}
					setSelection={setSelectionDecorated}
					isTree={isTree}
				/>
			</EditorModeContext.Provider>;
	});
}