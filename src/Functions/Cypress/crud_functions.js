import {
	fixInflector,
	getLastPartOfPath,
	bootstrapRouteWaiters,
	stubWindowOpen,
} from './utilities.js';
import {
	login,
	logout,
	navigateViaTabOrHomeButtonTo,
} from './navigation_functions.js';
import {
	getDomNode,
	getDomNodes,
	ifExists,
} from './dom_functions.js';
import {
	hasRowWithFieldValue,
	getRowWithFieldValue,
	selectGridRowById,
	selectGridRowIfNotAlreadySelectedById,
	verifyGridRecordDoesNotExistByValue,
	verifyGridRecordExistsByValue,
	verifyGridRecordExistsById,
	verifyGridRecordDoesNotExistById,
	verifyGridRowIsSelectedById,
	getModelFromGridName,
	getModelFromGridSelector,
	getGridRowSelectorById,
} from './grid_functions.js';
import {
	hasNodeWithFieldValue,
	getNodeWithFieldValue,
	selectTreeNodeById,
	selectTreeNodeIfNotAlreadySelectedById,
	verifyTreeRecordDoesNotExistByValue,
	verifyTreeRecordExistsByValue,
	verifyTreeRecordExistsById,
	verifyTreeRecordDoesNotExistById,
	verifyTreeNodeIsSelectedById,
	getModelFromTreeName,
	getModelFromTreeSelector,
	getTreeNodeSelectorById,
	getFirstTreeRootNode,
} from './tree_functions.js';
import {
	verifyNoErrorBox,
} from './common_functions.js';
import {
	fillForm,
	getFormValues,
} from './form_functions.js';
import {
	clickAddButton,
	clickSaveButton,
	clickEditButton,
	clickDeleteButton,
	clickDuplicateButton,
	clickReloadButton,
	clickCloseButton,
	clickCancelButton,
	clickOkButton,
	clickYesButton,
	clickNoButton,
	clickToEditButton,
	clickToEditButtonIfExists,
	clickToViewButton,
	clickToViewButtonIfExists,
	clickTrigger,
	clickButton,
	clickButtonIfExists,
	toFullMode,
	toSideMode,
} from './button_functions.js';
import Inflector from 'inflector-js';
import _ from 'lodash';
const $ = Cypress.$;

export const WINDOWED = 'WINDOWED';
export const INLINE = 'INLINE';
export const SIDE = 'SIDE';
export const FULL = 'FULL';


// Form fields
export function crudCombo(args) {
	const {
		selector,
		newData,
		editData,
		schema,
		ancillaryData,
		level = 0,
		options = {},
	} = args;

	cy.log('crudCombo');

	const
		fieldName = selector[1].match(/^field-(.*)$/)[1],
		gridSelector = selector[0] + '/' + fieldName + '/grid';
	
	clickTrigger(selector);

	crudWindowedGridRecord({
		gridSelector,
		newData,
		editData,
		schema,
		ancillaryData,
		level: level +1,
		options,
	});

	clickTrigger(selector);
}
export function crudTag(args) {

	const {
		selector,
		newData,
		editData,
		schema,
		ancillaryData,
		level = 0,
		options = {},
	} = args;
	cy.log('crudTag');

	const
		fieldName = selector[1].match(/^field-(.*)$/)[1],
		gridSelector = selector[0] + '/' + fieldName + '/combo/grid';
	
	clickTrigger(selector);

	// When crudding a tag, on edit, re-selecting the row can put up "already selected value" error box.
	// Need to explicitly ignore this, dismiss the error, and continue on

	crudWindowedGridRecord({
		gridSelector,
		newData,
		editData,
		schema,
		ancillaryData,
		level: level +1,
		options,
	});

	clickTrigger(selector);
}
export function crudJson(args) {

	const {
		selector,
		newData,
		editData,
		schema,
		ancillaryData,
		level = 0,
		options = {},
	} = args;
	cy.log('crudJson');

	// do nothing for now
}

// Editor
export function viewPdf(editorSelector, formSelector) {
	ifExists(formSelector, 'viewPdfBtn', (btn) => {
		clickButton(formSelector, 'viewPdfBtn');

		cy.wait(1000); // allow time for modal to render
		const modalSelector = editorSelector + '/chooseFieldsForm';
		clickButton(modalSelector, 'submitBtn');
		cy.wait(1000); // allow time for pdf to download
		cy.get('@windowOpen').should('be.calledWithMatch', /viewModelPdf/);
	});
}
export function emailPdf(editorSelector, formSelector) {
	ifExists(formSelector, 'emailPdfBtn', (btn) => {
		clickButton(formSelector, 'emailPdfBtn');
	
		cy.wait(1000); // allow time for modal to render
		const modalSelector = editorSelector + '/chooseFieldsForm';
		clickButton(modalSelector, 'submitBtn');
		cy.wait(1000); // allow time for new modal to render
	
		// UI now shows the email modal
		fillForm(modalSelector, { email: 'scott@onehat.com', message: 'Sample message', }, { email: 'Input', message: 'TextArea', });
		clickButton(modalSelector, 'submitBtn');
		cy.wait('@emailModelPdf');

		getDomNode('InfoModal')
			.should('exist')
			.should('contain', 'Email sent successfully.');
		clickButton('InfoModal', 'okBtn');
	});
}


// Grid
export function crudWindowedGridRecord(args) {
	const {
		gridSelector,
		newData,
		editData,
		schema,
		ancillaryData,
		level = 0,
		options = {},
	} = args;

	cy.log('crudWindowedGridRecord ' + gridSelector);
	const {
		skipView = false,
		skipAdd = false,
		skipEdit = false,
		skipDelete = false,
		id: existingId = null,
	} = options || {};

	getDomNode(gridSelector).scrollIntoView();

	const runCrudById = (id) => {

		cy.log('crudWindowedGridRecord: continue thru CRUD ' + gridSelector);

		// read
		if (!skipView) {
			clickReloadButton(gridSelector);
			cy.wait(1000); // allow time for grid to load
			verifyGridRecordExistsById(gridSelector, id);
		}

		// edit
		if (!skipEdit) {
			editWindowedGridRecord({
				gridSelector,
				fieldValues: editData,
				schema,
				id,
			});
		}

		// delete
		if (!skipDelete) {
			verifyGridRecordExistsById(gridSelector, id);
			deleteGridRecord(gridSelector, id);
			verifyGridRecordDoesNotExistById(gridSelector, id);
		}
	};

	if (!skipAdd) {
		// add
		addWindowedGridRecord({
			gridSelector,
			fieldValues: newData,
			schema,
			ancillaryData,
			level,
		}); // saves the id in @id
		cy.get('@id' + level).then((id) => {
			runCrudById(id);
		});
		return;
	}

	// skipAdd = true, see if an id was provided in the options
	if (!_.isNil(existingId)) {
		// If so, run the CRUD operations using the provided existingId.
		runCrudById(existingId);
		return;
	}

	cy.log('crudWindowedGridRecord: skipAdd was true with no options.id; skipping id-based phases.');
}
export function crudInlineGridRecord(args) {

	const {
		gridSelector,
		newData,
		editData,
		schema,
		ancillaryData,
		level = 0,
		options = {},
	} = args;

	cy.log('crudInlineGridRecord ' + gridSelector);
	const {
		skipView = false,
		skipAdd = false,
		skipEdit = false,
		skipDelete = false,
		id: existingId = null,
	} = options || {};

	getDomNode(gridSelector).scrollIntoView();

	const runCrudById = (id) => {

		cy.log('crudInlineGridRecord: continue thru CRUD ' + gridSelector);

		// read
		if (!skipView) {
			clickReloadButton(gridSelector);
			cy.wait(1000); // allow time for grid to load
			verifyGridRecordExistsById(gridSelector, id);
		}

		// edit
		if (!skipEdit) {
			editInlineGridRecord({ gridSelector, fieldValues: editData, schema, id });
		}

		// delete
		if (!skipDelete) {
			verifyGridRecordExistsById(gridSelector, id);
			deleteGridRecord(gridSelector, id);
			verifyGridRecordDoesNotExistById(gridSelector, id);
		}
	};

	if (!skipAdd) {
		// add
		addInlineGridRecord({
			gridSelector,
			fieldValues: newData,
			schema,
			ancillaryData,
			level,
		}); // saves the id in @id
		cy.get('@id' + level).then((id) => {
			runCrudById(id);
		});
		return;
	}

	if (!_.isNil(existingId)) {
		runCrudById(existingId);
		return;
	}

	cy.log('crudInlineGridRecord: skipAdd was true with no options.id; skipping id-based phases.');
}
export function crudSideGridRecord(args) {

	const {
		gridSelector,
		newData,
		editData,
		schema,
		ancillaryData,
		level = 0,
		options = {},
	} = args;

	// NOTE: the 'level' arg allows this fn to be called recursively 
	// and to use the @id alias correctly, keeping track of the level of recursion
	// so the CRUD operations don't step on each other at different levels.
	cy.log('crudSideGridRecord ' + gridSelector);
	const {
		skipView = false,
		skipAdd = false,
		skipEdit = false,
		skipDelete = false,
		id: existingId = null,
	} = options || {};
	
	getDomNode(gridSelector).scrollIntoView();

	const runCrudById = (id) => {

		// read
		if (!skipView) {
			clickReloadButton(gridSelector);
			cy.wait(1000); // allow time for grid to load
			verifyGridRecordExistsById(gridSelector, id);
		}

		// edit
		if (!skipEdit) {
			editGridRecord({ gridSelector, fieldValues: editData, schema, id, level: 0, whichEditor: SIDE });
		}

		// delete
		if (!skipDelete) {
			verifyGridRecordExistsById(gridSelector, id);
			deleteGridRecord(gridSelector, id);
			verifyGridRecordDoesNotExistById(gridSelector, id);
		}
	};

	if (!skipAdd) {
		// add
		addGridRecord({ gridSelector, fieldValues: newData, schema, ancillaryData, level }); // saves the id in @id
		cy.get('@id' + level).then((id) => {
			runCrudById(id);
		});
		return;
	}

	if (!_.isNil(existingId)) {
		runCrudById(existingId);
		return;
	}

	cy.log('crudSideGridRecord: skipAdd was true with no options.id; skipping id-based phases.');
}
export function addGridRecord(args) {

	const {
		gridSelector,
		fieldValues,
		schema,
		ancillaryData,
		level = 0,
	} = args;

	cy.log('addGridRecord ' + gridSelector);

	const
		editorSelector = gridSelector + '/editor',
		viewerSelector = editorSelector + '/viewer',
		formSelector = editorSelector + '/form',
		isRemotePhantomMode = schema.repository.isRemotePhantomMode;

	clickAddButton(gridSelector);
	if (isRemotePhantomMode) {
		cy.wait('@addWaiter');
	}
	getDomNode(formSelector).should('exist');

	fillForm(formSelector, fieldValues, schema, level +1);
	cy.wait(500); // allow validator to enable save button
	// TODO: Change this to wait until save button is enabled

	let method = 'add';
	if (isRemotePhantomMode) {
		method = 'edit';
	}
	clickSaveButton(formSelector); // it's labeled 'Add' in the form, but is really the save button
	cy.wait('@' + method + 'Waiter');

	verifyNoErrorBox();

	cy.wait(1000); // allow temp id to be replaced by real one

	// Get and save id of new record
	getDomNode([gridSelector, 'Row_row-selected']).then((row) => {
		const parent = row[0].parentNode;
		cy.wrap(parent).invoke('attr', 'data-testid').then((testId) => {
			const id = testId.split('-')[1];
			cy.wrap(id).as('id' + level);
		});
	});

	if (!_.isEmpty(ancillaryData)) {
		_.each(ancillaryData, (data) => {
			const
				model = data.model,
				Models = fixInflector(Inflector.camelize(Inflector.pluralize(model))),
				gridType = data.gridType,
				schema = data.schema,
				newData = data.newData,
				editData = data.editData,
				ancillaryData = data.ancillaryData,
				options = data.options;
			let ancillaryGridSelector = formSelector + '/' + (gridType || Models + 'GridEditor');
			if (ancillaryGridSelector.match(/^(.*)Side(A|B)(.*)$/)) {
				ancillaryGridSelector = ancillaryGridSelector.replace(/^(.*)Side(A|B)(.*)$/, '$1$3Side$2');
			}
			crudWindowedGridRecord({ gridSelector: ancillaryGridSelector, newData, editData, schema, ancillaryData, level: level+1, options });
		});
	}
}
export function addWindowedGridRecord(args) {

	const {
		gridSelector,
		fieldValues,
		schema,
		ancillaryData,
		level = 0,
	} = args;
	// adds the record as normal, then closes the editor window

	cy.log('addWindowedGridRecord ' + gridSelector);

	addGridRecord({ gridSelector, fieldValues, schema, ancillaryData, level });

	cy.log('addWindowedGridRecord: close window ' + gridSelector);
	const formSelector = gridSelector + '/editor/form';
	clickCloseButton(formSelector);
	cy.wait(500); // allow window to close
	// TODO: Change this to wait until window is closed
}
export function addInlineGridRecord(args) {

	const {
		gridSelector,
		fieldValues,
		schema,
		ancillaryData,
		level = 0,
	} = args;
	// adds the record as normal, then closes the editor window

	cy.log('addInlineGridRecord ' + gridSelector);

	addGridRecord({ gridSelector, fieldValues, schema, ancillaryData: [], level }); // NOTE: ancillaryData is not passed to addGridRecord because can't edit ancillary data in an inline editor

	cy.log('addInlineGridRecord: close window ' + gridSelector);
	const formSelector = gridSelector + '/editor/form';
	clickCloseButton(formSelector);
	cy.wait(500); // allow window to close
	// TODO: Change this to wait until window is closed
}
export function editGridRecord(args) {

	const {
		gridSelector,
		fieldValues,
		schema,
		id,
		level = 0,
		whichEditor = WINDOWED,
	} = args;
	
	cy.log('editGridRecord ' + gridSelector + ' ' + id);
	
	selectGridRowIfNotAlreadySelectedById(gridSelector, id);

	const
		editorSelector = gridSelector + '/editor',
		viewerSelector = editorSelector + '/viewer',
		formSelector = editorSelector + '/form';

	if (whichEditor === SIDE) {
		cy.log('switch to Edit mode if necessary ' + viewerSelector);
		clickToEditButtonIfExists(viewerSelector);
	} else {
		// windowed or inline editor
		cy.log('click editBtn ' + gridSelector);
		clickEditButton(gridSelector);
	}
	cy.wait(1500); // allow form to build
	getDomNode(formSelector).should('exist');

	fillForm(formSelector, fieldValues, schema, level +1);
	cy.wait(500); // allow validator to enable save button
	// TODO: Change this to wait until save button is enabled
	
	clickSaveButton(formSelector);
	cy.wait('@editWaiter');

	verifyNoErrorBox();
	// cy.wait(1000);

	if (whichEditor !== INLINE) {
		viewPdf(editorSelector, formSelector);
		emailPdf(editorSelector, formSelector);
	}
}
export function editWindowedGridRecord(args) {

	const {
		gridSelector,
		fieldValues,
		schema,
		id,
		level = 0,
	} = args;

	// edits the record as normal, then closes the editor window

	cy.log('editWindowedGridRecord ' + gridSelector + ' ' + id);
	
	editGridRecord({ gridSelector, fieldValues, schema, id, level, whichEditor: WINDOWED });

	const formSelector = gridSelector + '/editor/form';
	clickCloseButton(formSelector);
	cy.wait(500); // allow window to close
	// TODO: Change this to wait until window is closed
}
export function editInlineGridRecord(args) {

	const {
		gridSelector,
		fieldValues,
		schema,
		id,
		level = 0,
	} = args;

	// edits the record as normal, then closes the editor window

	cy.log('editInlineGridRecord ' + gridSelector + ' ' + id);
	
	editGridRecord({ gridSelector, fieldValues, schema, id, level, whichEditor: INLINE });

	const formSelector = gridSelector + '/editor/form';
	clickCloseButton(formSelector);
	cy.wait(500); // allow window to close
	// TODO: Change this to wait until window is closed
}
export function deleteGridRecord(gridSelector, id) {
	cy.log('deleteGridRecord ' + gridSelector + ' ' + id);
	
	selectGridRowIfNotAlreadySelectedById(gridSelector, id);
	clickDeleteButton(gridSelector);
	cy.wait(500); // allow confirmation box to appear
	
	// Click OK on confirmation box
	clickYesButton('ConfirmModal');
	cy.wait('@deleteWaiter');

	verifyNoErrorBox();
	// cy.wait(1000);
}
export function switchToEditModeIfNecessary(editorSelector) {
	cy.log('switchToEditModeIfNecessary ' + editorSelector);
	
	getDomNode(editorSelector).then((editor) => {
		const btn = editor.find('.toEditBtn');
		if (btn.length) {
			cy.wrap(btn)
				.click()
				.wait(500); // allow form to switch to edit mode
		}
	});
}
export function switchToViewModeIfNecessary(editorSelector) {
	cy.log('switchToViewModeIfNecessary ' + editorSelector);

	getDomNode(editorSelector).then((editor) => {
		const btn = editor.find('.toViewBtn');
		if (btn.length) {
			cy.wrap(btn)
				.click()
				.wait(500); // allow form to switch to edit mode
		}
	});
}


// Tree
export function crudWindowedTreeRecord(args) {

	const {
		treeSelector,
		newData,
		editData,
		schema,
		ancillaryData,
		level = 0,
		options = {},
	} = args;

	cy.log('crudWindowedTreeRecord ' + treeSelector);
	const {
		skipView = false,
		skipAdd = false,
		skipEdit = false,
		skipDelete = false,
		id: existingId = null,
	} = options || {};

	getDomNode(treeSelector).scrollIntoView();

	const runCrudById = (id) => {

		cy.log('crudWindowedTreeRecord: continue thru CRUD ' + treeSelector);
		
		// read
		if (!skipView) {
			clickReloadButton(treeSelector);
			cy.wait(1000); // allow time for tree to load
			verifyTreeRecordExistsById(treeSelector, id);
		}

		// edit
		if (!skipEdit) {
			editWindowedTreeRecord({
				treeSelector,
				fieldValues: editData,
				schema,
				id,
				level,
			});
		}

		// delete
		if (!skipDelete) {
			verifyTreeRecordExistsById(treeSelector, id);
			deleteTreeRecord(treeSelector, id);
			verifyTreeRecordDoesNotExistById(treeSelector, id);
		}
	};

	if (!skipAdd) {
		// add
		addWindowedTreeRecord({
			treeSelector,
			fieldValues: newData,
			schema,
			ancillaryData,
			level,
		}); // saves the id in @id
		cy.get('@id' + level).then((id) => {
			runCrudById(id);
		});
		return;
	}

	if (!_.isNil(existingId)) {
		runCrudById(existingId);
		return;
	}

	cy.log('crudWindowedTreeRecord: skipAdd was true with no options.id; skipping id-based phases.');
}
export function crudSideTreeRecord(args) {

	const {
		treeSelector,
		newData,
		editData,
		schema,
		ancillaryData,
		level = 0,
		options = {},
	} = args;

	// NOTE: the 'level' arg allows this fn to be called recursively 
	// and to use the @id alias correctly, keeping track of the level of recursion
	// so the CRUD operations don't step on each other at different levels.
	cy.log('crudSideTreeRecord ' + treeSelector);
	const {
		skipView = false,
		skipAdd = false,
		skipEdit = false,
		skipDelete = false,
		id: existingId = null,
	} = options || {};
	
	getDomNode(treeSelector).scrollIntoView();

	const runCrudById = (id) => {

		// read
		if (!skipView) {
			clickReloadButton(treeSelector);
			cy.wait(1000); // allow time for tree to load
			verifyTreeRecordExistsById(treeSelector, id);
		}

		// edit
		if (!skipEdit) {
			editTreeRecord({
				treeSelector,
				fieldValues: editData,
				schema,
				id,
				level,
				whichEditor: SIDE,
			});
		}

		// delete
		if (!skipDelete) {
			verifyTreeRecordExistsById(treeSelector, id);
			deleteTreeRecord(treeSelector, id);
			verifyTreeRecordDoesNotExistById(treeSelector, id);
		}
	};

	if (!skipAdd) {
		// add
		addTreeRecord({
			treeSelector,
			fieldValues: newData,
			schema,
			ancillaryData,
			level,
		}); // saves the id in @id
		cy.get('@id' + level).then((id) => {
			runCrudById(id);
		});
		return;
	}

	if (!_.isNil(existingId)) {
		runCrudById(existingId);
		return;
	}

	cy.log('crudSideTreeRecord: skipAdd was true with no options.id; skipping id-based phases.');
}
export function addTreeRecord(args) {

	const {
		treeSelector,
		fieldValues,
		schema,
		ancillaryData,
		level = 0,
	} = args;

	cy.log('addTreeRecord ' + treeSelector);

	const
		editorSelector = treeSelector + '/editor',
		viewerSelector = editorSelector + '/viewer',
		formSelector = editorSelector + '/form';

	// BEGIN MOD
	// select the root node
	getFirstTreeRootNode(treeSelector).then ((rootNode) => {

		// get the rootNodeId
		const id = rootNode.attr('data-testid').split('-')[1];
		selectTreeNodeIfNotAlreadySelectedById(treeSelector, id)
	});
	// END MOD


	clickAddButton(treeSelector);
	getDomNode(formSelector).should('exist');

	fillForm(formSelector, fieldValues, schema, level +1);
	cy.wait(500); // allow validator to enable save button
	// TODO: Change this to wait until save button is enabled

	let method = 'add';
	if (schema.repository.isRemotePhantomMode) {
		method = 'edit';
	}
	clickSaveButton(formSelector); // it's labeled 'Add' in the form, but is really the save button
	cy.wait('@' + method + 'Waiter');

	verifyNoErrorBox();

	cy.wait(1000); // allow temp id to be replaced by real one

	// Get and save id of new record
	getDomNode([treeSelector, 'node-selected']).then((row) => {
		const parent = row[0].parentNode;
		cy.wrap(parent).invoke('attr', 'data-testid').then((testId) => {
			const id = testId.split('-')[1];
			cy.wrap(id).as('id' + level);
		});
	});

	if (!_.isEmpty(ancillaryData)) {
		_.each(ancillaryData, (data) => {
			const
				model = data.model,
				Models = fixInflector(Inflector.camelize(Inflector.pluralize(model))),
				gridType = data.gridType,
				schema = data.schema,
				newData = data.newData,
				editData = data.editData,
				ancillaryData = data.ancillaryData,
				options = data.options;
			let ancillaryGridSelector = formSelector + '/' + (gridType || Models + 'GridEditor');
			if (ancillaryGridSelector.match(/^(.*)Side(A|B)(.*)$/)) {
				ancillaryGridSelector = ancillaryGridSelector.replace(/^(.*)Side(A|B)(.*)$/, '$1$3Side$2');
			}
			crudWindowedGridRecord({ gridSelector: ancillaryGridSelector, newData, editData, schema, ancillaryData, level: level+1, options });
		});
	}
}
export function addWindowedTreeRecord(args) {

	const {
		treeSelector,
		fieldValues,
		schema,
		ancillaryData,
		level = 0,
	} = args;

	// adds the record as normal, then closes the editor window

	cy.log('addWindowedTreeRecord ' + treeSelector);

	addTreeRecord({ treeSelector, fieldValues, schema, ancillaryData, level });

	cy.log('addWindowedTreeRecord: close window ' + treeSelector);
	const formSelector = treeSelector + '/editor/form';
	clickCloseButton(formSelector);
	cy.wait(500); // allow window to close
	// TODO: Change this to wait until window is closed
}
export function editTreeRecord(args) {

	const {
		treeSelector,
		fieldValues,
		schema,
		id,
		level = 0,
		whichEditor = WINDOWED,
	} = args;
	
	cy.log('editTreeRecord ' + treeSelector + ' ' + id);
	
	selectTreeNodeIfNotAlreadySelectedById(treeSelector, id);

	const
		editorSelector = treeSelector + '/editor',
		viewerSelector = editorSelector + '/viewer',
		formSelector = editorSelector + '/form';

	if (whichEditor === SIDE) {
		cy.log('switch to Edit mode if necessary ' + viewerSelector);
		clickToEditButtonIfExists(viewerSelector);
	} else {
		cy.log('click editBtn ' + treeSelector);
		clickEditButton(treeSelector);
	}
	cy.wait(1500); // allow form to build
	getDomNode(formSelector).should('exist');

	fillForm(formSelector, fieldValues, schema, level +1);
	cy.wait(500); // allow validator to enable save button
	// TODO: Change this to wait until save button is enabled

	clickSaveButton(formSelector);
	cy.wait('@editWaiter');

	verifyNoErrorBox();
	// cy.wait(1000);

	if (whichEditor !== INLINE) {
		viewPdf(editorSelector, formSelector);
		emailPdf(editorSelector, formSelector);
	}
	
}
export function editWindowedTreeRecord(args) {

	const {
		treeSelector,
		fieldValues,
		schema,
		id,
		level = 0,
	} = args;

	// edits the record as normal, then closes the editor window

	cy.log('editWindowedTreeRecord ' + treeSelector + ' ' + id);
	
	editTreeRecord({ treeSelector, fieldValues, schema, id, level, whichEditor: WINDOWED });

	const formSelector = treeSelector + '/editor/form';
	clickCloseButton(formSelector);
	cy.wait(500); // allow window to close
	// TODO: Change this to wait until window is closed
}
export function deleteTreeRecord(treeSelector, id) {

	cy.log('deleteTreeRecord ' + treeSelector + ' ' + id);
	
	selectTreeNodeIfNotAlreadySelectedById(treeSelector, id);
	clickDeleteButton(treeSelector);
	cy.wait(500); // allow confirmation box to appear
	
	// Click OK on confirmation box
	clickYesButton('ConfirmModal');
	cy.wait('@deleteWaiter');

	verifyNoErrorBox();
	// cy.wait(1000);
}


// Manager screen
export function runClosureTreeControlledManagerScreenCrudTests(args) {

	const {
			model,
			schema,
			newData,
			editData,
			ancillaryData,
			isSetup = false,
			options = {},
		} = args,
		Models = fixInflector(Inflector.camelize(Inflector.pluralize(model))),
		url = fixInflector(Inflector.dasherize(Inflector.underscore(Models)));

	if (!options.hasOwnProperty('skipFull')) {
		options.skipFull = false;
	}
	if (!options.hasOwnProperty('skipSide')) {
		options.skipSide = false;
	}

	describe(Models + 'Manager', () => {

		beforeEach(function () {
			bootstrapRouteWaiters();
			login();
			cy.restoreLocalStorage();
			cy.url().then((currentUrl) => {
				if (!currentUrl.endsWith(url)) {
					navigateViaTabOrHomeButtonTo('/' + url, isSetup);
				}
			});
			stubWindowOpen();
		});
		
		// afterEach(function () {
		// 	cy.saveLocalStorage();
		// 	logout();
		// });

		if (!options.skipFull) {
			it('CRUD in full mode', function () {

				const
					managerSelector = '/' + Models + 'Manager',
					gridSelector = '/' + Models + 'FilteredGridEditor';

				toFullMode(managerSelector);
				cy.wait(500); // allow filtered grid to load

				crudWindowedGridRecord({
					gridSelector,
					newData,
					editData,
					schema,
					ancillaryData,
					options,
				});

			});
		}

		if (!options.skipSide) {
			it('CRUD in side mode', function () {

				const
					managerSelector = '/' + Models + 'Manager',
					gridSelector = '/' + Models + 'FilteredSideGridEditor';

				toSideMode(managerSelector);
				cy.wait(1000); // allow filtered grid to load

				crudSideGridRecord({
					gridSelector,
					newData,
					editData,
					schema,
					ancillaryData,
					options,
				});

			});
		}

	});

}
export function runClosureTreeManagerScreenCrudTests(args) {

	const {
			model,
			schema,
			newData,
			editData,
			ancillaryData,
			isSetup = false,
			options = {},
		} = args,
		Models = fixInflector(Inflector.camelize(Inflector.pluralize(model))),
		url = fixInflector(Inflector.dasherize(Inflector.underscore(Models)));

	if (!options.hasOwnProperty('skipFull')) {
		options.skipFull = false;
	}
	if (!options.hasOwnProperty('skipSide')) {
		options.skipSide = false;
	}

	describe(Models + 'Manager', () => {

		beforeEach(function () {
			bootstrapRouteWaiters();
			login();
			cy.restoreLocalStorage();
			cy.url().then((currentUrl) => {
				if (!currentUrl.endsWith(url)) {
					navigateViaTabOrHomeButtonTo(url, isSetup);
				}
			});
			stubWindowOpen();
		});
		
		// afterEach(function () {
		// 	cy.saveLocalStorage();
		// 	logout();
		// });

		if (!options.skipFull) {
			it('CRUD in full mode', function() {

				const
					managerSelector = '/' + Models + 'Manager',
					treeSelector = '/' + Models + 'TreeEditor';

				toFullMode(managerSelector);
				cy.wait(500); // wait for grid to load

				crudWindowedTreeRecord({
					treeSelector,
					newData,
					editData,
					schema,
					ancillaryData,
					options,
				});

			});
		}

		if (!options.skipSide) {
			it('CRUD in side mode', function() {

				const
					managerSelector = '/' + Models + 'Manager',
					treeSelector = '/' + Models + 'TreeEditor';

				toSideMode(managerSelector);
				cy.wait(1000); // wait for grid to load

				crudSideTreeRecord({
					treeSelector,
					newData,
					editData,
					schema,
					ancillaryData,
					options,
				});

			});
		}

	});

}
export function runManagerScreenCrudTests(args) {

	const {
			model,
			schema,
			newData,
			editData,
			ancillaryData,
			fullIsInline = false,
			isSetup = false,
			options = {},
		} = args,
		Models = fixInflector(Inflector.camelize(Inflector.pluralize(model))),
		url = fixInflector(Inflector.dasherize(Inflector.underscore(Models)));

	if (!options.hasOwnProperty('skipFull')) {
		options.skipFull = false;
	}
	if (!options.hasOwnProperty('skipSide')) {
		options.skipSide = false;
	}

	describe(Models + 'Manager', () => {

		beforeEach(function () {
			bootstrapRouteWaiters();
			login();
			cy.restoreLocalStorage();
			cy.url().then((currentUrl) => {
				if (!currentUrl.endsWith(url)) {
					navigateViaTabOrHomeButtonTo(url, isSetup);
				}
			});
			stubWindowOpen();
		});
		
		// afterEach(function () {
		// 	cy.saveLocalStorage();
		// 	logout();
		// });

		if (!options.skipFull) {
			it('CRUD in full mode', function() {
	
				const
					managerSelector = '/' + Models + 'Manager',
					gridSelector = '/' + Models + 'GridEditor';
	
				toFullMode(managerSelector);
				cy.wait(500); // wait for grid to load
	
				if (fullIsInline) {
					crudInlineGridRecord({
						gridSelector,
						newData,
						editData,
						schema,
						ancillaryData,
						options,
					});
				} else {
					crudWindowedGridRecord({
						gridSelector,
						newData,
						editData,
						schema,
						ancillaryData,
						options,
					});
				}
	
			});
		}

		if (!options.skipSide) {
			it('CRUD in side mode', function() {
	
				const
					managerSelector = '/' + Models + 'Manager',
					gridSelector = '/' + Models + 'GridEditor';
	
				toSideMode(managerSelector);
				cy.wait(1000); // wait for grid to load
	
				crudSideGridRecord({ gridSelector, newData, editData, schema, ancillaryData, options });
	
			});
		}

	});

}
export function runReportsManagerTests(args) {

	const {
			reportData,
			isSetup = false,
		} = args,
		url = 'reports';

	describe('ReportsManager', () => {

		beforeEach(function () {
			bootstrapRouteWaiters();
			login();
			cy.restoreLocalStorage();
			cy.url().then((currentUrl) => {
				if (!currentUrl.endsWith(url)) {
					navigateViaTabOrHomeButtonTo(url, isSetup);
				}
			});
			stubWindowOpen();
		});

		_.each(reportData, (report) => {

			it('Report ' + report.id, function() {

				cy.log('report ' + report.id);

				const selector = 'Report-' + report.id;

				if (report.fieldValues && !_.isEmpty(report.fieldValues)) {
					fillForm(selector, report.fieldValues, report.schema);
				}


				// Press Excel button
				clickButton(selector, 'excelBtn');
				cy.wait('@getReportWaiter', { timeout: 10000 }).then((interception) => {
					expect(interception.response.headers['content-type']).to.include('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
				});


				// Press PDF button
				clickButton(selector, 'pdfBtn');
				cy.wait('@postReportWaiter', { timeout: 10000 }).then((interception) => {
					expect(interception.response.headers['content-type']).to.include('pdf');
				});

			});

		});

	});

}
