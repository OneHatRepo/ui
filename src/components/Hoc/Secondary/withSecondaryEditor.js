import { useEffect, useState, useRef, } from 'react';
import {
	Button,
} from 'native-base';
import {
	EDITOR_MODE__VIEW,
	EDITOR_MODE__ADD,
	EDITOR_MODE__EDIT,
} from '../../../Constants/Editor.js';
import UiGlobals from '../../UiGlobals.js';
import _ from 'lodash';

// NOTE: This is a modified version of @onehat/ui/src/Hoc/withEditor
// This HOC will eventually get out of sync with that one, and may need to be updated.

export default function withSecondaryEditor(WrappedComponent, isTree = false) {
	return (props) => {

		if (props.secondaryDisableWithEditor) {
			return <WrappedComponent {...props} />;
		}

		let [secondaryEditorMode, secondarySetEditorMode] = useState(EDITOR_MODE__VIEW); // Can change below, so use 'let'
		const {
				secondaryUserCanEdit = true,
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
				secondaryRecord,
				secondaryOnChange,
				secondaryOnSave,
				secondaryNewEntityDisplayValue,
				secondaryDefaultValues,

				// withComponent
				self,

				// parent container
				secondarySelectorId,
				secondarySelectorSelected,

				// withSecondaryData
				SecondaryRepository,

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
			[secondaryCurrentRecord, secondarySetCurrentRecord] = useState(null),
			[secondaryIsAdding, setIsAdding] = useState(false),
			[secondaryIsSaving, setIsSaving] = useState(false),
			[secondaryIsEditorShown, secondarySetIsEditorShown] = useState(false),
			[secondaryIsEditorViewOnly, setIsEditorViewOnly] = useState(secondaryCanEditorViewOnly), // current state of whether editor is in view-only mode
			[secondaryLastSelection, setLastSelection] = useState(),
			secondarySetSelectionDecorated = (newSelection) => {
				function doIt() {
					secondarySetSelection(newSelection);
				}
				const formState = secondaryEditorStateRef.current;
				if (!_.isEmpty(formState?.dirtyFields) && newSelection !== secondarySelection && secondaryEditorMode === EDITOR_MODE__EDIT) {
					confirm('This record has unsaved changes. Are you sure you want to cancel editing? Changes will be lost.', doIt);
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
			secondaryOnAdd = async (e, values) => {
				let addValues = values;

				if (!values) {
					// you can either:
					// 1. directlty submit 'values' to use in onAdd(), or
					// 2. Use the repository's default values (defined on each property as 'defaultValue'), or
					// 3. Individually override the repository's default values with submitted 'defaultValues' (given as a prop to this HOC)
					let defaultValuesToUse = Repository.getSchema().getDefaultValues();
					if (secondaryDefaultValues) {
						_.merge(defaultValuesToUse, secondaryDefaultValues);
					}
					addValues = _.clone(defaultValuesToUse);
				}

				if (secondarySelectorId && !_.isEmpty(secondarySelectorSelected)) {
					addValues[secondarySelectorId] = secondarySelectorSelected.id;
				}

				if (!values && getNewEntityDisplayValue()) {
					const displayPropertyName = SecondaryRepository.getSchema().model.displayProperty;
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
					if (currentSorter.name !== SecondaryRepository.schema.model.idProperty || currentSorter.direction !== 'DESC') {
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
				secondarySetSelection([entity]);
				setIsEditorViewOnly(false);
				secondarySetEditorMode(EDITOR_MODE__ADD);
				secondarySetIsEditorShown(true);

				if (getListeners().onAfterAdd) {
					await getListeners().onAfterAdd(entity);
				}
				if (secondaryOnChange) {
					secondaryOnChange();
				}
			},
			secondaryOnEdit = async () => {
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
			secondaryOnDelete = async (args) => {
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
							<Button colorScheme="danger" onPress={() => secondaryOnMoveChildren(cb)} key="moveBtn">
								Move Children
							</Button>,
							<Button colorScheme="danger" onPress={() => secondaryOnDeleteChildren(cb)} key="deleteBtn">
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
			secondaryOnMoveChildren = (cb) => {
				hideAlert();
				deleteRecord(true, cb);
			},
			secondaryOnDeleteChildren = (cb) => {
				hideAlert();
				deleteRecord(false, cb);
			},
			deleteRecord = async (moveSubtreeUp, cb) => {
				if (getListeners().onBeforeDeleteSave) {
					await getListeners().onBeforeDeleteSave(secondarySelection);
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
					cb();
				}
				if (secondaryOnChange) {
					secondaryOnChange();
				}
			},
			secondaryOnView = async () => {
				if (!secondaryUserCanView) {
					return;
				}
				if (secondarySelection.length !== 1) {
					return;
				}
				setIsEditorViewOnly(true);
				secondarySetEditorMode(EDITOR_MODE__VIEW);
				secondarySetIsEditorShown(true);

				if (getListeners().onAfterView) {
					await getListeners().onAfterView();
				}
			},
			secondaryOnDuplicate = async () => {
				if (!secondaryUserCanEdit || secondaryDisableDuplicate) {
					return;
				}
				if (secondarySelection.length !== 1) {
					return;
				}
				if (secondaryUseRemoteDuplicate) {
					return onRemoteDuplicate();
				}
				const
					entity = secondarySelection[0],
					idProperty = SecondaryRepository.getSchema().model.idProperty,
					rawValues = _.omit(entity.rawValues, idProperty),
					duplicate = await SecondaryRepository.add(rawValues, false, true);
				secondarySetSelection([duplicate]);
				secondarySetEditorMode(EDITOR_MODE__EDIT);
				secondarySetIsEditorShown(true);
			},
			onRemoteDuplicate = async () => {
				const
					entity = secondarySelection[0],
					duplicateEntity = await SecondaryRepository.remoteDuplicate(entity);

				secondarySetSelection([duplicateEntity]);
				secondaryOnEdit();
			},
			secondaryOnEditorSave = async (data, e) => {
				const
					what = secondaryRecord || secondarySelection,
					isSingle = what.length === 1;
				if (isSingle) {
					// just update this one entity
					what[0].setValues(data);

				} else if (secondarySelection.length > 1) {
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

				setIsSaving(true);
				let success;
				try {
					await SecondaryRepository.save();
					success = true;
				} catch (e) {
					alert(e.context);
					success = false;
				}
				setIsSaving(false);

				if (success) {
					setIsAdding(false);
					
					secondarySetEditorMode(EDITOR_MODE__EDIT);
					// secondarySetIsEditorShown(false);
					
					if (getListeners().onAfterEdit) {
						await getListeners().onAfterEdit(what);
					}
					if (secondaryOnChange) {
						secondaryOnChange();
					}
					if (secondaryOnSave) {
						secondaryOnSave(what);
					}
				}

				return success;
			},
			secondaryOnEditorCancel =  () => {
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
				if (!_.isEmpty(formState.dirtyFields)) {
					confirm('This record has unsaved changes. Are you sure you want to cancel editing? Changes will be lost.', doIt);
				} else {
					doIt();
				}
			},
			secondaryOnEditorClose = () => {
				if (secondaryIsAdding) {
					secondaryOnEditorCancel();
				}
				secondarySetIsEditorShown(false);
			},
			secondaryOnEditorDelete = async () => {
				secondaryOnDelete(() => {
					secondarySetEditorMode(EDITOR_MODE__VIEW);
					secondarySetIsEditorShown(false);
				});
			},
			calculateEditorMode = () => {
				let mode = secondaryEditorMode;
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
				return mode;
			},
			secondaryOnEditMode = () => {
				secondarySetEditorMode(EDITOR_MODE__EDIT);
			},
			secondaryOnViewMode = () => {
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
			// When secondarySelection changes, set the mode appropriately
			if (UiGlobals.editorStaysInEditModeOnChangeSelection) {
				const mode = calculateEditorMode();
				secondarySetEditorMode(mode);
			} else {
				secondarySetEditorMode(EDITOR_MODE__VIEW);
			}

			setLastSelection(secondarySelection);
		}, [secondarySelection]);

		if (self) {
			self.secondaryAdd = secondaryOnAdd;
			self.secondaryEdit = secondaryOnEdit;
			self.secondaryDelete = secondaryOnDelete;
			self.secondarnMoveChildren = secondaryOnMoveChildren;
			self.secondaryDeleteChildren = secondaryOnDeleteChildren;
			self.secondaryDuplicate = secondaryOnDuplicate;
		}
		secondaryNewEntityDisplayValueRef.current = secondaryNewEntityDisplayValue;

		if (secondaryLastSelection !== secondarySelection) {
			// NOTE: If I don't calculate this on the fly for secondarySelection changes,
			// we see a flash of the previous state, since useEffect hasn't yet run.
			secondaryEditorMode = calculateEditorMode();
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
					secondaryOnEditMode={secondaryOnEditMode}
					secondaryOnViewMode={secondaryOnViewMode}
					secondaryEditorStateRef={secondaryEditorStateRef}
					secondarySetIsEditorShown={secondarySetIsEditorShown}
					secondaryOnAdd={(!secondaryUserCanEdit || secondaryDisableAdd) ? null : secondaryOnAdd}
					secondaryOnEdit={(!secondaryUserCanEdit || secondaryDisableEdit) ? null : secondaryOnEdit}
					secondaryOnDelete={(!secondaryUserCanEdit || secondaryDisableDelete) ? null : secondaryOnDelete}
					secondaryOnView={secondaryOnView}
					secondaryOnDuplicate={secondaryOnDuplicate}
					secondaryOnEditorSave={secondaryOnEditorSave}
					secondaryOnEditorCancel={secondaryOnEditorCancel}
					secondaryOnEditorDelete={(!secondaryUserCanEdit || secondaryDisableDelete) ? null : secondaryOnEditorDelete}
					secondaryOnEditorClose={secondaryOnEditorClose}
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
				/>;
	};
}