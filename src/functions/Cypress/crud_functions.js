import {
	fixInflector,
	getLastPartOfPath,
} from './utilities.js';
import {
	login,
	logout,
	navigateViaTabOrHomeButtonTo,
} from './navigation_functions.js';
import {
	getDomNode,
	getDomNodes,
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


// Form fields
export function crudCombo(selector, newData, editData, schema, ancillaryData, level = 0) {
	cy.then(() => {
		Cypress.log({ name: 'crudCombo' });
	});

	const
		fieldName = selector[1].match(/^field-(.*)$/)[1],
		gridSelector = selector[0] + '/' + fieldName + '/grid';
	
	clickTrigger(selector);

	crudWindowedGridRecord(gridSelector, newData, editData, schema, ancillaryData, level +1);

	clickTrigger(selector);
}
export function crudTag(selector, newData, editData, schema, ancillaryData, level = 0) {
	cy.then(() => {
		Cypress.log({ name: 'crudTag' });
	});

	const
		fieldName = selector[1].match(/^field-(.*)$/)[1],
		gridSelector = selector[0] + '/' + fieldName + '/combo/grid';
	
	clickTrigger(selector);

	// When crudding a tag, on edit, re-selecting the row can put up "already selected value" error box.
	// Need to explicitly ignore this, dismiss the error, and continue on

	crudWindowedGridRecord(gridSelector, newData, editData, schema, ancillaryData, level +1);

	clickTrigger(selector);
}


// Grid
export function crudWindowedGridRecord(gridSelector, newData, editData, schema, ancillaryData, level = 0) {

	cy.then(() => {
		Cypress.log({ name: 'crudWindowedGridRecord ' + gridSelector });
	});

	getDomNode(gridSelector).scrollIntoView();

	// add
	addWindowedGridRecord(gridSelector, newData, schema, ancillaryData, level); // saves the id in @id
	
	cy.get('@id' + level).then((id) => {

		cy.then(() => {
			Cypress.log({ name: 'crudWindowedGridRecord: continue thru CRUD ' + gridSelector });
		});

		// read
		clickReloadButton(gridSelector);
		cy.wait(1000); // allow time for grid to load
		verifyGridRecordExistsById(gridSelector, id);

		// edit
		editWindowedGridRecord(gridSelector, editData, schema, id);

		// delete
		verifyGridRecordExistsById(gridSelector, id);
		deleteGridRecord(gridSelector, id);
		verifyGridRecordDoesNotExistById(gridSelector, id);
	});
}
export function crudInlineGridRecord(gridSelector, newData, editData, schema, ancillaryData, level = 0) {

	cy.then(() => {
		Cypress.log({ name: 'crudInlineGridRecord ' + gridSelector });
	});

	getDomNode(gridSelector).scrollIntoView();

	// add
	addInlineGridRecord(gridSelector, newData, schema, ancillaryData, level); // saves the id in @id
	
	cy.get('@id' + level).then((id) => {

		cy.then(() => {
			Cypress.log({ name: 'crudWindowedGridRecord: continue thru CRUD ' + gridSelector });
		});

		// read
		clickReloadButton(gridSelector);
		cy.wait(1000); // allow time for grid to load
		verifyGridRecordExistsById(gridSelector, id);

		// edit
		editInlineGridRecord(gridSelector, editData, schema, id);

		// delete
		verifyGridRecordExistsById(gridSelector, id);
		deleteGridRecord(gridSelector, id);
		verifyGridRecordDoesNotExistById(gridSelector, id);
	});
}
export function crudSideGridRecord(gridSelector, newData, editData, schema, ancillaryData, level = 0) {
	// NOTE: the 'level' arg allows this fn to be called recursively 
	// and to use the @id alias correctly, keeping track of the level of recursion
	// so the CRUD operations don't step on each other at different levels.
	cy.then(() => {
		Cypress.log({ name: 'crudSideGridRecord ' + gridSelector });
	});
	
	getDomNode(gridSelector).scrollIntoView();

	// add
	addGridRecord(gridSelector, newData, schema, ancillaryData, level); // saves the id in @id

	cy.get('@id' + level).then((id) => {

		// read
		clickReloadButton(gridSelector);
		cy.wait(1000); // allow time for grid to load
		verifyGridRecordExistsById(gridSelector, id);

		// edit
		editGridRecord(gridSelector, editData, schema, id);

		// delete
		verifyGridRecordExistsById(gridSelector, id);
		deleteGridRecord(gridSelector, id);
		verifyGridRecordDoesNotExistById(gridSelector, id);
	});
}
export function addGridRecord(gridSelector, fieldValues, schema, ancillaryData, level = 0) {

	cy.then(() => {
		Cypress.log({ name: 'addGridRecord ' + gridSelector });
	});

	const
		editorSelector = gridSelector + '/editor',
		viewerSelector = editorSelector + '/viewer',
		formSelector = editorSelector + '/form';

	clickAddButton(gridSelector);
	getDomNode(formSelector).should('exist');

	fillForm(formSelector, fieldValues, schema, level +1);
	cy.wait(500); // allow validator to enable save button
	// TODO: Change this to wait until save button is enabled

	let method = 'add';
	if (schema.repository.isRemotePhantomMode) {
		method = 'edit';
	}
	cy.intercept('POST', '**/' + method + '**').as('waiter');
	clickSaveButton(formSelector); // it's labeled 'Add' in the form, but is really the save button
	cy.wait('@waiter');

	verifyNoErrorBox();

	cy.wait(1000); // allow temp id to be replaced by real one

	// Get and save id of new record
	getDomNode([gridSelector, 'row-selected']).then((row) => {
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
				ancillaryGridSelector = formSelector + '/' + (gridType || Models + 'GridEditor');
			crudWindowedGridRecord(ancillaryGridSelector, newData, editData, schema, ancillaryData, level+1);
		});
	}
}
export function addWindowedGridRecord(gridSelector, fieldValues, schema, ancillaryData, level = 0) {
	// adds the record as normal, then closes the editor window

	cy.then(() => {
		Cypress.log({ name: 'addWindowedGridRecord ' + gridSelector });
	});

	addGridRecord(gridSelector, fieldValues, schema, ancillaryData, level);

	cy.then(() => {
		Cypress.log({ name: 'addWindowedGridRecord: close window ' + gridSelector });
	});
	const formSelector = gridSelector + '/editor/form';
	clickCloseButton(formSelector);
	cy.wait(500); // allow window to close
	// TODO: Change this to wait until window is closed
}
export function addInlineGridRecord(gridSelector, fieldValues, schema, ancillaryData, level = 0) {
	// adds the record as normal, then closes the editor window

	cy.then(() => {
		Cypress.log({ name: 'addInlineGridRecord ' + gridSelector });
	});

	addGridRecord(gridSelector, fieldValues, schema, ancillaryData, level);

	cy.then(() => {
		Cypress.log({ name: 'addWindowedGridRecord: close window ' + gridSelector });
	});
	const formSelector = gridSelector + '/editor/form';
	clickCloseButton(formSelector);
	cy.wait(500); // allow window to close
	// TODO: Change this to wait until window is closed
}
export function editGridRecord(gridSelector, fieldValues, schema, id, level = 0) {
	
	cy.then(() => {
		Cypress.log({ name: 'editGridRecord ' + gridSelector + ' ' + id});
	});
	
	selectGridRowIfNotAlreadySelectedById(gridSelector, id);

	const
		editorSelector = gridSelector + '/editor',
		viewerSelector = editorSelector + '/viewer',
		formSelector = editorSelector + '/form';

	const gridName = getLastPartOfPath(gridSelector);
	if (gridName.match(/SideGrid/)) { // as opposed to 'SideA' -- we want the side editor, not particular sides of another editor
		// side editor
		// switch to Edit mode if necessary
		clickToEditButtonIfExists(viewerSelector);
	} else {
		// windowed or inline editor
		clickEditButton(gridSelector);
	}
	cy.wait(1500); // allow form to build
	getDomNode(formSelector).should('exist');

	fillForm(formSelector, fieldValues, schema, level +1);
	cy.wait(500); // allow validator to enable save button
	// TODO: Change this to wait until save button is enabled

	cy.intercept('POST', '**/edit**').as('waiter');
	clickSaveButton(formSelector);
	cy.wait('@waiter');

	verifyNoErrorBox();
	// cy.wait(1000);
	
}
export function editWindowedGridRecord(gridSelector, fieldValues, schema, id, level = 0) {
	// edits the record as normal, then closes the editor window

	cy.then(() => {
		Cypress.log({ name: 'editWindowedGridRecord ' + gridSelector + ' ' + id});
	});
	
	editGridRecord(gridSelector, fieldValues, schema, id, level);

	const formSelector = gridSelector + '/editor/form';
	clickCloseButton(formSelector);
	cy.wait(500); // allow window to close
	// TODO: Change this to wait until window is closed
}
export function editInlineGridRecord(gridSelector, fieldValues, schema, id, level = 0) {
	// edits the record as normal, then closes the editor window

	cy.then(() => {
		Cypress.log({ name: 'editWindowedGridRecord ' + gridSelector + ' ' + id});
	});
	
	editGridRecord(gridSelector, fieldValues, schema, id, level);

	const formSelector = gridSelector + '/editor/form';
	clickCloseButton(formSelector);
	cy.wait(500); // allow window to close
	// TODO: Change this to wait until window is closed
}
export function deleteGridRecord(gridSelector, id) {

	cy.then(() => {
		Cypress.log({ name: 'deleteGridRecord ' + gridSelector + ' ' + id });
	});
	
	selectGridRowIfNotAlreadySelectedById(gridSelector, id);
	clickDeleteButton(gridSelector);
	cy.wait(500); // allow confirmation box to appear
	
	// Click OK on confirmation box
	cy.intercept('POST', '**/delete**').as('waiter');
	clickYesButton('AlertDialog');
	cy.wait('@waiter');

	verifyNoErrorBox();
	// cy.wait(1000);
}
export function switchToEditModeIfNecessary(editorSelector) {
	cy.then(() => {
		Cypress.log({ name: 'switchToEditModeIfNecessary ' + editorSelector });
	});
	
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
	cy.then(() => {
		Cypress.log({ name: 'switchToViewModeIfNecessary ' + editorSelector });
	});

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
export function crudWindowedTreeRecord(treeSelector, newData, editData, schema, ancillaryData, level = 0) {

	cy.then(() => {
		Cypress.log({ name: 'crudWindowedTreeRecord ' + treeSelector });
	});

	getDomNode(treeSelector).scrollIntoView();

	// add
	addWindowedTreeRecord(treeSelector, newData, schema, ancillaryData, level); // saves the id in @id
	
	cy.get('@id' + level).then((id) => {

		cy.then(() => {
			Cypress.log({ name: 'crudWindowedTreeRecord: continue thru CRUD ' + treeSelector });
		});
		
		// read
		clickReloadButton(treeSelector);
		cy.wait(1000); // allow time for tree to load
		verifyTreeRecordExistsById(treeSelector, id);

		// edit
		editWindowedTreeRecord(treeSelector, editData, schema, id);

		// delete
		verifyTreeRecordExistsById(treeSelector, id);
		deleteTreeRecord(treeSelector, id);
		verifyTreeRecordDoesNotExistById(treeSelector, id);
	});
}
export function crudSideTreeRecord(treeSelector, newData, editData, schema, ancillaryData, level = 0) {
	// NOTE: the 'level' arg allows this fn to be called recursively 
	// and to use the @id alias correctly, keeping track of the level of recursion
	// so the CRUD operations don't step on each other at different levels.
	cy.then(() => {
		Cypress.log({ name: 'crudSideTreeRecord ' + treeSelector });
	});
	
	getDomNode(treeSelector).scrollIntoView();

	// add
	addTreeRecord(treeSelector, newData, schema, ancillaryData, level); // saves the id in @id

	cy.get('@id' + level).then((id) => {

		// read
		clickReloadButton(treeSelector);
		cy.wait(1000); // allow time for tree to load
		verifyTreeRecordExistsById(treeSelector, id);

		// edit
		editTreeRecord(treeSelector, editData, schema, id);

		// delete
		verifyTreeRecordExistsById(treeSelector, id);
		deleteTreeRecord(treeSelector, id);
		verifyTreeRecordDoesNotExistById(treeSelector, id);
	});
}
export function addTreeRecord(treeSelector, fieldValues, schema, ancillaryData, level = 0) {

	cy.then(() => {
		Cypress.log({ name: 'addTreeRecord ' + treeSelector });
	});

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
	cy.intercept('POST', '**/' + method + '**').as('waiter');
	clickSaveButton(formSelector); // it's labeled 'Add' in the form, but is really the save button
	cy.wait('@waiter');

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
				ancillaryGridSelector = formSelector + '/' + (gridType || Models + 'GridEditor');
			crudWindowedGridRecord(ancillaryGridSelector, newData, editData, schema, ancillaryData, level+1);
		});
	}
}
export function addWindowedTreeRecord(treeSelector, fieldValues, schema, ancillaryData, level = 0) {
	// adds the record as normal, then closes the editor window

	cy.then(() => {
		Cypress.log({ name: 'addWindowedTreeRecord ' + treeSelector });
	});

	addTreeRecord(treeSelector, fieldValues, schema, ancillaryData, level);

	cy.then(() => {
		Cypress.log({ name: 'addWindowedTreeRecord: close window ' + treeSelector });
	});
	const formSelector = treeSelector + '/editor/form';
	clickCloseButton(formSelector);
	cy.wait(500); // allow window to close
	// TODO: Change this to wait until window is closed
}
export function editTreeRecord(treeSelector, fieldValues, schema, id, level = 0) {
	
	cy.then(() => {
		Cypress.log({ name: 'editTreeRecord ' + treeSelector + ' ' + id});
	});
	
	selectTreeNodeIfNotAlreadySelectedById(treeSelector, id);

	const
		editorSelector = treeSelector + '/editor',
		viewerSelector = editorSelector + '/viewer',
		formSelector = editorSelector + '/form';

	const treeName = getLastPartOfPath(treeSelector);
	if (treeName.match(/SideTree/)) { // as opposed to 'SideA' -- we want the side editor, not particular sides of another editor
		// side editor
		// switch to Edit mode if necessary
		clickToEditButtonIfExists(viewerSelector);
	} else {
		// windowed or inline editor
		clickEditButton(treeSelector);
	}
	cy.wait(1500); // allow form to build
	getDomNode(formSelector).should('exist');

	fillForm(formSelector, fieldValues, schema, level +1);
	cy.wait(500); // allow validator to enable save button
	// TODO: Change this to wait until save button is enabled

	cy.intercept('POST', '**/edit**').as('waiter');
	clickSaveButton(formSelector);
	cy.wait('@waiter');

	verifyNoErrorBox();
	// cy.wait(1000);
	
}
export function editWindowedTreeRecord(treeSelector, fieldValues, schema, id, level = 0) {
	// edits the record as normal, then closes the editor window

	cy.then(() => {
		Cypress.log({ name: 'editWindowedTreeRecord ' + treeSelector + ' ' + id});
	});
	
	editTreeRecord(treeSelector, fieldValues, schema, id, level);

	const formSelector = treeSelector + '/editor/form';
	clickCloseButton(formSelector);
	cy.wait(500); // allow window to close
	// TODO: Change this to wait until window is closed
}
export function deleteTreeRecord(treeSelector, id) {

	cy.then(() => {
		Cypress.log({ name: 'deleteTreeRecord ' + treeSelector + ' ' + id });
	});
	
	selectTreeNodeIfNotAlreadySelectedById(treeSelector, id);
	clickDeleteButton(treeSelector);
	cy.wait(500); // allow confirmation box to appear
	
	// Click OK on confirmation box
	cy.intercept('POST', '**/delete**').as('waiter');
	clickYesButton('AlertDialog');
	cy.wait('@waiter');

	verifyNoErrorBox();
	// cy.wait(1000);
}


// Manager screen
export function runClosureTreeControlledManagerScreenCrudTests(model, schema, newData, editData) {

	const
		Models = Inflector.camelize(Inflector.pluralize(model)),
		url = '/' + Inflector.dasherize(Inflector.underscore(Models));

	describe(Models + 'Manager', () => {

		beforeEach(function () {
			login();
			cy.restoreLocalStorage();
			cy.url().then((currentUrl) => {
				if (!currentUrl.endsWith(url)) {
					navigateViaTabOrHomeButtonTo(url);
				}
			});
		});
		
		afterEach(function () {
			cy.saveLocalStorage();
			logout();
		});

		// TODO: This takes the standard runManagerScreenCrudTests
		// and adds the control of the Fleet Tree. i.e. Check that the grids
		// respond to the tree selection.



		// it('CRUD in full mode', function() {

		// 	const gridSelector = '/' + Models + 'FilteredGridEditor';

		// 	toFullMode();
		// 	cy.wait(500); // wait for grid to load

		// 	// add
		// 	addWindowedGridRecord(gridSelector, newData, schema); // saves the id in @id
			
		// 	// cy.wrap(39).as('id');
		// 	cy.get('@id').then((id) => {

		// 		// read
		// 		clickReloadButton(gridSelector);
		// 		cy.wait(1000); // allow time for grid to load
		// 		verifyGridRecordExistsById(gridSelector, id);

		// 		// edit
		// 		editWindowedGridRecord(gridSelector, editData, schema, id);
		
		// 		// delete
		// 		verifyGridRecordExistsById(gridSelector, id);
		// 		deleteGridRecord(gridSelector, id);
		// 		verifyGridRecordDoesNotExistById(gridSelector, id);
		// 	});

		// });

		// it('CRUD in side mode', function() {

		// 	const gridSelector = '/' + Models + 'FilteredSideGridEditor';

		// 	toSideMode();
		// 	cy.wait(1000); // wait for grid to load

		// 	// add
		// 	addGridRecord(gridSelector, newData, schema); // saves the id in @id

		// 	cy.get('@id').then((id) => {

		// 		// read
		// 		clickReloadButton(gridSelector);
		// 		cy.wait(1000); // allow time for grid to load
		// 		verifyGridRecordExistsById(gridSelector, id);

		// 		// edit
		// 		editGridRecord(gridSelector, editData, schema, id);
		
		// 		// delete
		// 		verifyGridRecordExistsById(gridSelector, id);
		// 		deleteGridRecord(gridSelector, id);
		// 		verifyGridRecordDoesNotExistById(gridSelector, id);
		// 	});

		// });

	});

}
export function runClosureTreeManagerScreenCrudTests(model, schema, newData, editData, ancillaryData) {

	const
		Models = fixInflector(Inflector.camelize(Inflector.pluralize(model))),
		url = '/' + fixInflector(Inflector.dasherize(Inflector.underscore(Models)));

	describe(Models + 'Manager', () => {

		beforeEach(function () {
			login();
			cy.restoreLocalStorage();
			cy.url().then((currentUrl) => {
				if (!currentUrl.endsWith(url)) {
					navigateViaTabOrHomeButtonTo(url);
				}
			});
		});
		
		// afterEach(function () {
		// 	cy.saveLocalStorage();
		// 	logout();
		// });

		it('CRUD in full mode', function() {

			const
				managerSelector = '/' + Models + 'Manager',
				treeSelector = '/' + Models + 'TreeEditor';

			toFullMode(managerSelector);
			cy.wait(500); // wait for grid to load

			crudWindowedTreeRecord(treeSelector, newData, editData, schema, ancillaryData);

		});

		it('CRUD in side mode', function() {

			const
				managerSelector = '/' + Models + 'Manager',
				treeSelector = '/' + Models + 'SideTreeEditor';

			toSideMode(managerSelector);
			cy.wait(1000); // wait for grid to load

			crudSideTreeRecord(treeSelector, newData, editData, schema, ancillaryData);

		});

	});

}
export function runInlineManagerScreenCrudTests(model, schema, newData, editData, ancillaryData) {

	const
		Models = fixInflector(Inflector.camelize(Inflector.pluralize(model))),
		url = '/' + fixInflector(Inflector.dasherize(Inflector.underscore(Models)));

	describe(Models + 'Manager', () => {

		beforeEach(function () {
			login();
			cy.restoreLocalStorage();
			cy.url().then((currentUrl) => {
				if (!currentUrl.endsWith(url)) {
					navigateViaTabOrHomeButtonTo(url);
				}
			});
		});
		
		afterEach(function () {
			cy.saveLocalStorage();
			logout();
		});

		it('CRUD with inline editor in full mode', function() {

			const
				managerSelector = '/' + Models + 'Manager',
				gridSelector = '/' + Models + 'FilteredInlineGridEditor';

			toFullMode(managerSelector);
			cy.wait(500); // wait for grid to load

			crudInlineGridRecord(gridSelector, newData, editData, schema, ancillaryData);

		});

		it('CRUD in side mode', function() {

			const
				managerSelector = '/' + Models + 'Manager',
				gridSelector = '/' + Models + 'FilteredSideGridEditor';

			toSideMode(managerSelector);
			cy.wait(1000); // wait for grid to load

			crudSideGridRecord(gridSelector, newData, editData, schema, ancillaryData);

		});

	});

}
export function runManagerScreenCrudTests(model, schema, newData, editData, ancillaryData) {

	const
		Models = fixInflector(Inflector.camelize(Inflector.pluralize(model))),
		url = '/' + fixInflector(Inflector.dasherize(Inflector.underscore(Models)));

	describe(Models + 'Manager', () => {

		beforeEach(function () {
			login();
			cy.restoreLocalStorage();
			cy.url().then((currentUrl) => {
				if (!currentUrl.endsWith(url)) {
					navigateViaTabOrHomeButtonTo(url);
				}
			});
		});
		
		// afterEach(function () {
		// 	cy.saveLocalStorage();
		// 	logout();
		// });

		it('CRUD in full mode', function() {

			const
				managerSelector = '/' + Models + 'Manager',
				gridSelector = '/' + Models + 'FilteredGridEditor';

			toFullMode(managerSelector);
			cy.wait(500); // wait for grid to load

			crudWindowedGridRecord(gridSelector, newData, editData, schema, ancillaryData);

		});

		it.skip('CRUD in side mode', function() {

			const
				managerSelector = '/' + Models + 'Manager',
				gridSelector = '/' + Models + 'FilteredSideGridEditor';

			toSideMode(managerSelector);
			cy.wait(1000); // wait for grid to load

			crudSideGridRecord(gridSelector, newData, editData, schema, ancillaryData);

		});

	});

}
export function runReportsManagerTests(reportData) {

	const url = '/reports';

	describe('ReportsManager', () => {

		beforeEach(function () {
			login();
			cy.url().then((currentUrl) => {
				if (!currentUrl.endsWith(url)) {
					navigateViaTabOrHomeButtonTo(url);
				}
			});
		});

		_.each(reportData, (report) => {

			it('Report ' + report.id, function() {

				cy.then(() => {
					Cypress.log({ name: 'report ' + report.id });
				});

				const selector = 'Report-' + report.id;

				if (report.fieldValues && !_.isEmpty(report.fieldValues)) {
					fillForm(selector, report.fieldValues, report.schema);
				}


				// Press Excel button
				cy.intercept('GET', '**/getReport**').as('waiter');
				clickButton(selector, 'excelBtn');
				cy.wait('@waiter', { timeout: 10000 }).then((interception) => {
					expect(interception.response.headers['content-type']).to.include('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
				});


				// Press PDF button
				cy.intercept('POST', '**/getReport**').as('waiter');
				clickButton(selector, 'pdfBtn');
				cy.wait('@waiter', { timeout: 10000 }).then((interception) => {
					expect(interception.response.headers['content-type']).to.include('pdf');
				});

			});

		});

	});

}
