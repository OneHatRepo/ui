import { useEffect, useState, useRef, } from 'react';
import {
	Button,
} from 'native-base';
import {
	ADD,
	EDIT,
	DELETE,
	VIEW,
	DUPLICATE,
} from '../../../Constants/Commands.js';
import {
	EDITOR_MODE__VIEW,
	EDITOR_MODE__ADD,
	EDITOR_MODE__EDIT,
	EDITOR_TYPE__SIDE,
} from '../../../Constants/Editor.js';
import _ from 'lodash';

// NOTE: This is a modified version of @onehat/ui/src/Hoc/withEditor
// This HOC will eventually get out of sync with that one, and may need to be updated.

export default function withSecondaryEditor(WrappedComponent, isTree = false) {
	return (props) => {

		if (props.secondaryDisableWithEditor) {
			return <WrappedComponent {...props} isTree={isTree} />;
		}

		let [secondaryEditorMode, secondarySetEditorMode] = useState(EDITOR_MODE__VIEW); // Can change below, so use 'let'
		const {
				secondaryUserCanEdit = true, // not permissions, but capability
				secondaryUserCanView = true,
				secondaryCanEditorViewOnly = false, // whether the editor can *ever* change state out of 'View' mode
				secondaryDisableAdd = false,
				secondaryDisableEdit = false,
				secondaryDisableDelete = false,
				secondaryDisableDuplicate = false,
				secondaryDisableView = false,
				secondaryUseRemoteDuplicate = false, // call specific copyToNew function on server, rather than simple duplicate on client
				secondaryGetRecordIdentifier = (secondarySelection) => {
					if (secondarySelection.length > 1) {
						return 'records?';
					}
					return 'record' + (secondarySelection[0].displayValue ? ' "' + secondarySelection[0].displayValue + '"' : '') + '?';
				},
				secondaryEditorType,
				secondaryOnAdd,
				secondaryOnChange, // any kind of crud change
				secondaryOnDelete,
				secondaryOnSave, // this could also be called 'onEdit'
				secondaryOnEditorClose,
				secondaryNewEntityDisplayValue,
				secondaryNewEntityDisplayProperty, // in case the field to set for newEntityDisplayValue is different from model
				secondaryDefaultValues,

				// withComponent
				self,

				// parent container
				secondarySelectorId,
				secondarySelectorSelected,
				secondarySelectorSelectedField = 'id',

				// withSecondaryData
				SecondaryRepository,

				// withPermissions
				canUser,
				showPermissionsError,

				// withSecondarySelection
				secondarySelection,
				secondarySetSelection,

				// withAlert
				alert,
				confirm,
				hideAlert,
			} = props,
			secondaryListeners = useRef({}),
			secondaryEditorStateRef = useRef(),
			secondaryNewEntityDisplayValueRef = useRef(),
			secondaryModel = SecondaryRepository?.schema?.name,
			[secondaryCurrentRecord, secondarySetCurrentRecord] = useState(null),
			[secondaryIsAdding, setIsAdding] = useState(false),
			[secondaryIsSaving, setIsSaving] = useState(false),
			[secondaryIsEditorShown, secondarySetIsEditorShownRaw] = useState(false),
			[secondaryIsEditorViewOnly, setIsEditorViewOnly] = useState(secondaryCanEditorViewOnly), // current state of whether editor is in view-only mode
			[secondaryIsIgnoreNextSelectionChange, setSecondaryIsIgnoreNextSelectionChange] = useState(false),
			[secondaryLastSelection, setLastSelection] = useState(),
			secondarySetIsEditorShown = (bool) => {
				secondarySetIsEditorShownRaw(bool);
				if (!bool && secondaryOnEditorClose) {
					secondaryOnEditorClose();
				}
			},
			secondarySetSelectionDecorated = (newSelection) => {
				function doIt() {
					secondarySetSelection(newSelection);
				}
				const formState = secondaryEditorStateRef.current;
				if (!_.isEmpty(formState?.dirtyFields) && newSelection !== secondarySelection && secondaryEditorMode === EDITOR_MODE__EDIT) {
					confirm('This record has unsaved changes. Are you sure you want to cancel editing? Changes will be lost.', doIt);
				} else if (secondarySelection && secondarySelection[0] && !secondarySelection[0].isDestroyed && (secondarySelection[0]?.isPhantom || secondarySelection[0]?.isRemotePhantom)) {
					confirm('This new record is unsaved. Are you sure you want to cancel editing? Changes will be lost.', async () => {
						await secondarySelection[0].delete();
						doIt();
					});
				} else {
					doIt();
				}
			},
			getListeners = () => {
				return secondaryListeners.current;
			},
			setListeners = (obj) => {
				secondaryListeners.current = obj;
				// forceUpdate(); // we don't want to get into an infinite loop of renders. Simply directly assign the secondaryListeners in every child render
			},
			getNewEntityDisplayValue = () => {
				return secondaryNewEntityDisplayValueRef.current;
			},
			secondaryDoAdd = async (e, values) => {
				if (canUser && !canUser(ADD, secondaryModel)) {
					showPermissionsError(ADD, secondaryModel);
					return;
				}

				let addValues = values;

				if (SecondaryRepository?.isLoading) {
					// NOTE: This is a hack to prevent adding a new record while the repository is still loading.
					// This can happen when the repository is still loading, and the user clicks the 'Add' button.
					setTimeout(() => {
						doAdd(e, values);
					}, 500);
					return;
				}

				if (!values) {
					// you can either:
					// 1. directlty submit 'values' to use in secondaryDoAdd(), or
					// 2. Use the repository's default values (defined on each property as 'defaultValue'), or
					// 3. Individually override the repository's default values with submitted 'defaultValues' (given as a prop to this HOC)
					let defaultValuesToUse = SecondaryRepository.getSchema().getDefaultValues();
					if (secondaryDefaultValues) {
						_.merge(defaultValuesToUse, secondaryDefaultValues);
					}
					addValues = _.clone(defaultValuesToUse);
				}

				if (secondarySelectorId && !_.isEmpty(secondarySelectorSelected)) {
					addValues[secondarySelectorId] = secondarySelectorSelected[secondarySelectorSelectedField];
				}

				if (getNewEntityDisplayValue()) {
					const displayPropertyName = secondaryNewEntityDisplayProperty || SecondaryRepository.getSchema().model.displayProperty;
					addValues[displayPropertyName] = getNewEntityDisplayValue();
				}

				if (getListeners().onBeforeAdd) {
					const listenerResult = await getListeners().onBeforeAdd();
					if (listenerResult === false) {
						return;
					}
				}

				if (isTree) {
					if (!secondarySelection[0]) {
						throw Error('Must select a parent node.');
					}
					addValues.parentId = secondarySelection[0].id;
				} else {
					// Set repository to sort by id DESC and switch to page 1, so this new entity is guaranteed to show up on the current page, even after saving
					const currentSorter = SecondaryRepository.sorters[0];
					if (currentSorter.name.match(/__sort_order$/)) { // when it's using a sort column, keep using it
						if (currentSorter.direction !== 'DESC') {
							SecondaryRepository.pauseEvents();
							SecondaryRepository.sort(currentSorter.name, 'DESC');
							SecondaryRepository.setPage(1);
							SecondaryRepository.resumeEvents();
							await SecondaryRepository.reload();
						}
					} else if (currentSorter.name !== SecondaryRepository.schema.model.idProperty || currentSorter.direction !== 'DESC') {
						SecondaryRepository.pauseEvents();
						SecondaryRepository.sort(SecondaryRepository.schema.model.idProperty, 'DESC');
						SecondaryRepository.setPage(1);
						SecondaryRepository.resumeEvents();
						await SecondaryRepository.reload();
					}
				}

				// Unmap the values, so we can input true originalData
				addValues = SecondaryRepository.unmapData(addValues);


				setIsAdding(true);
				setIsSaving(true);
				const entity = await SecondaryRepository.add(addValues, false, true);
				setIsSaving(false);
				setSecondaryIsIgnoreNextSelectionChange(true);
				secondarySetSelection([entity]);
				if (SecondaryRepository.isAutoSave) {
					// for isAutoSave Repositories, submit the handers right away
					if (getListeners().onAfterAdd) {
						await getListeners().onAfterAdd(entity);
					}
					if (secondaryOnAdd) {
						await secondaryOnAdd(entity);
					}
				}
				setIsEditorViewOnly(false);
				secondarySetEditorMode(SecondaryRepository.isAutoSave ? EDITOR_MODE__EDIT : EDITOR_MODE__ADD);
				secondarySetIsEditorShown(true);
			},
			secondaryDoEdit = async () => {
				if (canUser && !canUser(EDIT, secondaryModel)) {
					showPermissionsError(EDIT, secondaryModel);
					return;
				}
				if (_.isEmpty(secondarySelection) || (_.isArray(secondarySelection) && (secondarySelection.length > 1 || secondarySelection[0]?.isDestroyed))) {
					return;
				}
				if (getListeners().onBeforeEdit) {
					const listenerResult = await getListeners().onBeforeEdit();
					if (listenerResult === false) {
						return;
					}
				}
				setIsEditorViewOnly(false);
				secondarySetEditorMode(EDITOR_MODE__EDIT);
				secondarySetIsEditorShown(true);
			},
			secondaryDoDelete = async (args) => {
				if (canUser && !canUser(DELETE, secondaryModel)) {
					showPermissionsError(DELETE, secondaryModel);
					return;
				}
				let cb = null;
				if (_.isFunction(args)) {
					cb = args;
				}
				if (_.isEmpty(secondarySelection) || (_.isArray(secondarySelection) && (secondarySelection.length > 1 || secondarySelection[0]?.isDestroyed))) {
					return;
				}
				if (getListeners().onBeforeDelete) {
					const listenerResult = await getListeners().onBeforeDelete();
					if (listenerResult === false) {
						return;
					}
				}
				const
					isSingle = secondarySelection.length === 1,
					firstSelection = secondarySelection[0],
					isTree = firstSelection?.isTree,
					hasChildren = isTree ? firstSelection?.hasChildren : false,
					isPhantom = firstSelection?.isPhantom;

				if (isSingle && isTree && hasChildren) {
					alert({
						title: 'Move up children?',
						message: 'The node you have selected for deletion has children. ' + 
								'Should these children be moved up to this node\'s parent, or be deleted?',
						buttons: [
							<Button colorScheme="danger" onPress={() => secondaryDoMoveChildren(cb)} key="moveBtn">
								Move Children
							</Button>,
							<Button colorScheme="danger" onPress={() => secondaryDoDeleteChildren(cb)} key="deleteBtn">
								Delete Children
							</Button>
						],
						includeCancel: true,
					});
				} else
				if (isSingle && isPhantom) {
					deleteRecord(cb);
				} else {
					const identifier = secondaryGetRecordIdentifier(secondarySelection);
					confirm('Are you sure you want to delete the ' + identifier, () => deleteRecord(null, cb));
				}
			},
			secondaryDoMoveChildren = (cb) => {
				hideAlert();
				deleteRecord(true, cb);
			},
			secondaryDoDeleteChildren = (cb) => {
				hideAlert();
				deleteRecord(false, cb);
			},
			deleteRecord = async (moveSubtreeUp, cb) => {
				if (canUser && !canUser(DELETE, secondaryModel)) {
					showPermissionsError(DELETE, secondaryModel);
					return;
				}
				if (getListeners().onBeforeDelete) {
					const listenerResult = await getListeners().onBeforeDelete(secondarySelection);
					if (listenerResult === false) {
						return;
					}
				}

				await SecondaryRepository.delete(secondarySelection, moveSubtreeUp);
				if (!SecondaryRepository.isAutoSave) {
					await SecondaryRepository.save();
				}
				if (getListeners().onAfterDelete) {
					await getListeners().onAfterDelete(secondarySelection);
				}
				secondarySetSelection([]);
				if (cb) {
					cb(secondarySelection);
				}
				if (secondaryOnChange) {
					secondaryOnChange(secondarySelection);
				}
				if (secondaryOnDelete) {
					secondaryOnDelete(secondarySelection);
				}
			},
			secondaryDoView = async (allowEditing = false) => {
				if (!secondaryUserCanView) {
					return;
				}
				if (canUser && !canUser(VIEW, secondaryModel)) {
					showPermissionsError(VIEW, secondaryModel);
					return;
				}
				if (secondarySelection.length !== 1) {
					return;
				}
				setIsEditorViewOnly(!allowEditing);
				secondarySetEditorMode(EDITOR_MODE__VIEW);
				secondarySetIsEditorShown(true);

				if (getListeners().onAfterView) {
					await getListeners().onAfterView();
				}
			},
			secondaryDoDuplicate = async () => {
				if (!secondaryUserCanEdit || secondaryDisableDuplicate) {
					return;
				}
				if (canUser && !canUser(DUPLICATE, secondaryModel)) {
					showPermissionsError(DUPLICATE, secondaryModel);
					return;
				}
				if (secondarySelection.length !== 1) {
					return;
				}
				if (secondaryUseRemoteDuplicate) {
					const results = await onRemoteDuplicate();
					return results;
				}
				const
					entity = secondarySelection[0],
					idProperty = SecondaryRepository.getSchema().model.idProperty,
					rawValues = _.omit(entity.getOriginalData(), idProperty);
				rawValues.id = null; // unset the id of the duplicate
				const duplicate = await SecondaryRepository.add(rawValues, false, true);
				setSecondaryIsIgnoreNextSelectionChange(true);
				secondarySetSelection([duplicate]);
				secondarySetEditorMode(EDITOR_MODE__EDIT);
				secondarySetIsEditorShown(true);
			},
			onRemoteDuplicate = async () => {
				const
					entity = secondarySelection[0],
					duplicateEntity = await SecondaryRepository.remoteDuplicate(entity);

				setSecondaryIsIgnoreNextSelectionChange(true);
				secondarySetSelection([duplicateEntity]);
				secondaryDoEdit();
			},
			secondaryDoEditorSave = async (data, e) => {
				let mode = secondaryEditorMode === EDITOR_MODE__ADD ? ADD : EDIT;
				if (canUser && !canUser(mode, secondaryModel)) {
					showPermissionsError(mode, secondaryModel);
					return;
				}

				// NOTE: The Form submits onSave for both adds (when not isAutoSsave) and edits.
				const isSingle = secondarySelection.length === 1;
				let useStaged = false;
				if (isSingle) {
					// just update this one entity
					secondarySelection[0].setValues(data);

					// If this is a remote phantom, and nothing is dirty, stage it so it actually gets saved to server and solidified
					if (secondarySelection[0].isRemotePhantom && !secondarySelection[0].isDirty) {
						secondarySelection[0].markStaged();
						useStaged = true;
					}

				} else if (secondarySelection.length > 1) {
					// Edit multiple entities

					// Loop through all entities and change fields that are not null
					const propertyNames = Object.getOwnPropertyNames(data);
					_.each(propertyNames, (propertyName) => {
						if (!_.isNil(data[propertyName])) {
							_.each(secondarySelection, (rec) => {
								rec[propertyName] = data[propertyName]
							});
						}
					});
				}

				if (getListeners().onBeforeSave) {
					const listenerResult = await getListeners().onBeforeSave(secondarySelection);
					if (listenerResult === false) {
						return;
					}
				}

				setIsSaving(true);
				let success;
				try {
					await SecondaryRepository.save(null, useStaged);
					success = true;
				} catch (e) {
					success = e;
				}
				setIsSaving(false);

				if (_.isBoolean(success) && success) {
					if (secondaryOnChange) {
						secondaryOnChange(secondarySelection);
					}
					if (secondaryEditorMode === EDITOR_MODE__ADD) {
						if (secondaryOnAdd) {
							await secondaryOnAdd(secondarySelection);
						}
						if (getListeners().onAfterAdd) {
							await getListeners().onAfterAdd(secondarySelection);
						}
						setIsAdding(false);
						if (!canUser || canUser(EDIT, secondaryModel)) {
							secondarySetEditorMode(EDITOR_MODE__EDIT);
						} else {
							secondarySetEditorMode(EDITOR_MODE__VIEW);
						}
					} else if (secondaryEditorMode === EDITOR_MODE__EDIT) {
						if (getListeners().onAfterEdit) {
							await getListeners().onAfterEdit(secondarySelection);
						}
						if (secondaryOnSave) {
							secondaryOnSave(secondarySelection);
						}
					}
					// setIsEditorShown(false);
				}

				return success;
			},
			secondaryDoEditorCancel =  () => {
				async function doIt() {
					const
						isSingle = secondarySelection.length === 1,
						isPhantom = secondarySelection[0] && !secondarySelection[0]?.isDestroyed && secondarySelection[0].isPhantom;
					if (isSingle && isPhantom) {
						await deleteRecord();
					}
					
					setIsAdding(false);
					secondarySetIsEditorShown(false);
				}
				const formState = secondaryEditorStateRef.current;
				if (!formState) {
					setIsAdding(false);
					secondarySetIsEditorShown(false);
					return;
				}
				if (!_.isEmpty(formState.dirtyFields)) {
					confirm('This record has unsaved changes. Are you sure you want to cancel editing? Changes will be lost.', doIt);
				} else {
					doIt();
				}
			},
			secondaryDoEditorClose = () => {
				if (secondaryIsAdding) {
					secondaryDoEditorCancel();
				}
				secondarySetIsEditorShown(false);
			},
			secondaryDoEditorDelete = async () => {
				if (canUser && !canUser(DELETE, secondaryModel)) {
					showPermissionsError(DELETE, secondaryModel);
					return;
				}

				secondaryDoDelete(() => {
					secondarySetEditorMode(EDITOR_MODE__VIEW);
					secondarySetIsEditorShown(false);
				});
			},
			calculateEditorMode = (secondaryIsIgnoreNextSelectionChange = false) => {
				// calculateEditorMode gets called only on selection changes
				let mode;
				if (secondaryEditorType === EDITOR_TYPE__SIDE && !_.isNil(UiGlobals.isSideEditorAlwaysEditMode) && UiGlobals.isSideEditorAlwaysEditMode) {
					// special case: side editor is always edit mode
					mode = EDITOR_MODE__EDIT;
				} else {
					if (secondaryIsIgnoreNextSelectionChange) {
						mode = secondaryEditorMode;
						if (!secondaryCanEditorViewOnly && secondaryUserCanEdit) {
							if (secondarySelection.length > 1) {
								if (!secondaryDisableEdit) {
									// For multiple entities selected, change it to edit multiple mode
									mode = EDITOR_MODE__EDIT;
								}
							} else if (secondarySelection.length === 1 && !secondarySelection[0].isDestroyed && secondarySelection[0].isPhantom) {
								if (!secondaryDisableAdd) {
									// When a phantom entity is selected, change it to add mode.
									mode = EDITOR_MODE__ADD;
								}
							}
						}
					} else {
						mode = secondarySelection.length > 1 ? EDITOR_MODE__EDIT : EDITOR_MODE__VIEW;
					}
				}
				return mode;
			},
			secondarySetEditMode = () => {
				if (canUser && !canUser(EDIT, secondaryModel)) {
					showPermissionsError(EDIT, secondaryModel);
					return;
				}

				secondarySetEditorMode(EDITOR_MODE__EDIT);
			},
			secondarySetViewMode = () => {
				if (canUser && !canUser(VIEW, secondaryModel)) {
					showPermissionsError(VIEW, secondaryModel);
					return;
				}

				function doIt() {
					secondarySetEditorMode(EDITOR_MODE__VIEW);
				}
				const formState = secondaryEditorStateRef.current;
				if (!_.isEmpty(formState.dirtyFields)) {
					confirm('This record has unsaved changes. Are you sure you want to switch to "View" mode? Changes will be lost.', doIt);
				} else {
					doIt();
				}
			};

		useEffect(() => {
			secondarySetEditorMode(calculateEditorMode(secondaryIsIgnoreNextSelectionChange));

			setSecondaryIsIgnoreNextSelectionChange(false);
			setLastSelection(secondarySelection);
		}, [secondarySelection]);
	
		if (self) {
			self.secondaryAdd = secondaryDoAdd;
			self.secondaryEdit = secondaryDoEdit;
			self.secondaryDelete = secondaryDoDelete;
			self.secondarnMoveChildren = secondaryDoMoveChildren;
			self.secondaryDeleteChildren = secondaryDoDeleteChildren;
			self.secondaryDuplicate = secondaryDoDuplicate;
			self.secondarySetIsEditorShown = secondarySetIsEditorShown;
		}
		secondaryNewEntityDisplayValueRef.current = secondaryNewEntityDisplayValue;

		if (secondaryLastSelection !== secondarySelection) {
			// NOTE: If I don't calculate this on the fly for selection changes,
			// we see a flash of the previous state, since useEffect hasn't yet run.
			// (basically redo what's in the useEffect, above)
			secondaryEditorMode = calculateEditorMode(secondaryIsIgnoreNextSelectionChange);
		}

		return <WrappedComponent
					{...props}
					secondaryDisableWithEditor={false}
					secondaryCurrentRecord={secondaryCurrentRecord}
					secondarySetCurrentRecord={secondarySetCurrentRecord}
					secondaryIsEditorShown={secondaryIsEditorShown}
					secondaryIsEditorViewOnly={secondaryIsEditorViewOnly}
					secondaryIsAdding={secondaryIsAdding}
					secondaryIsSaving={secondaryIsSaving}
					secondaryEditorMode={secondaryEditorMode}
					secondaryOnEditMode={secondarySetEditMode}
					secondaryOnViewMode={secondarySetViewMode}
					secondaryEditorStateRef={secondaryEditorStateRef}
					secondarySetIsEditorShown={secondarySetIsEditorShown}
					secondaryOnAdd={(!secondaryUserCanEdit || secondaryDisableAdd) ? null : secondaryDoAdd}
					secondaryOnEdit={(!secondaryUserCanEdit || secondaryDisableEdit) ? null : secondaryDoEdit}
					secondaryOnDelete={(!secondaryUserCanEdit || secondaryDisableDelete) ? null : secondaryDoDelete}
					secondaryOnView={secondaryDoView}
					secondaryOnDuplicate={secondaryDoDuplicate}
					secondaryOnEditorSave={secondaryDoEditorSave}
					secondaryOnEditorCancel={secondaryDoEditorCancel}
					secondaryOnEditorDelete={(!secondaryUserCanEdit || secondaryDisableDelete) ? null : secondaryDoEditorDelete}
					secondaryOnEditorClose={secondaryDoEditorClose}
					secondarySetWithEditListeners={setListeners}
					secondaryIsEditor={true}
					secondaryUserCanEdit={secondaryUserCanEdit}
					secondaryUserCanView={secondaryUserCanView}
					secondaryDisableAdd={secondaryDisableAdd}
					secondaryDisableEdit={secondaryDisableEdit}
					secondaryDisableDelete={secondaryDisableDelete}
					secondaryDisableDuplicate={secondaryDisableDuplicate}
					secondaryDisableView ={secondaryDisableView}
					secondarySetSelection={secondarySetSelectionDecorated}
					isTree={isTree}
				/>;
	};
}