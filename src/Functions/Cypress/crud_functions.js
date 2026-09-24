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
	clickToEditButtonIfExists,
	clickToViewButton,
	clickToViewButtonIfExists,
	clickTrigger,
	clickButton,
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
		selector: gridSelector,
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
		comboGridSelector = selector[0] + '/' + fieldName + '/combo/grid',
		flatGridSelector = selector[0] + '/' + fieldName + '/grid';
	
	clickTrigger(selector);

	// When crudding a tag, on edit, re-selecting the row can put up "already selected value" error box.
	// Need to explicitly ignore this, dismiss the error, and continue on

	const
		startedAt = Date.now(),
		timeout = 10000,
		interval = 100,
		resolveGridSelector = () => cy.get('body', { log: false }).then(($body) => {
			if ($body.find('[data-testid="' + comboGridSelector + '"]').length) {
				return comboGridSelector;
			}

			if ($body.find('[data-testid="' + flatGridSelector + '"]').length) {
				return flatGridSelector;
			}

			const dynamicGridTestId = $body
				.find('.dropdownMenu-ModalContent [data-testid$="/grid"]:visible')
				.first()
				.attr('data-testid');
			if (dynamicGridTestId) {
				return dynamicGridTestId;
			}

			if (Date.now() - startedAt >= timeout) {
				cy.log(
					'crudTag: no ancillary CRUD grid found; skipping ancillary CRUD for selectors: '
					+ comboGridSelector
					+ ' or '
					+ flatGridSelector
				);
				return null;
			}

			return cy.wait(interval, { log: false }).then(resolveGridSelector);
		});

	return resolveGridSelector().then((resolvedGridSelector) => {
		if (!resolvedGridSelector) {
			return;
		}

		return cy.get('body', { log: false }).then(($body) => {
			const candidateCrudSelectors = [
				resolvedGridSelector,
				resolvedGridSelector.replace(/\/grid$/, ''),
			];

			const crudSelector = _.find(candidateCrudSelectors, (candidateSelector) => {
				if (!candidateSelector) {
					return false;
				}
				const gridRootSelector = '[data-testid="' + candidateSelector + '"]';
				return $body.find(gridRootSelector + ' [data-testid="addBtn"]').length > 0;
			});

			if (!crudSelector) {
				cy.log('crudTag: resolved selector has no addBtn; skipping ancillary CRUD for ' + resolvedGridSelector);
				return;
			}

			crudWindowedGridRecord({
				selector: crudSelector,
				newData,
				editData,
				schema,
				ancillaryData,
				level: level +1,
				options,
			});
		});
	}).then(() => {
		clickTrigger(selector);
	});
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
		selector,
		newData,
		editData,
		schema,
		ancillaryData,
		level = 0,
		options = {},
	} = args;

	cy.log('crudWindowedGridRecord ' + selector);

	const {
		skipView = false,
		skipAdd = false,
		skipEdit = false,
		skipDelete = false,
		idObj = null,
	} = options || {};

	getDomNode(selector).scrollIntoView();

	const runCrudById = (id) => {

		cy.log('crudWindowedGridRecord: continue thru CRUD ' + selector);

		// read
		if (!skipView) {
			clickReloadButton(selector);
			cy.wait(1000); // allow time for grid to load
			verifyGridRecordExistsById(selector, id);
		}

		// edit
		if (!skipEdit) {
			editWindowedGridRecord({
				selector,
				fieldValues: editData,
				schema,
				id,
				options,
			});
		}

		// delete
		if (!skipDelete) {
			verifyGridRecordExistsById(selector, id);
			deleteGridRecord(selector, id);
			verifyGridRecordDoesNotExistById(selector, id);
		}
	};

	if (!skipAdd) {
		// add
		addWindowedGridRecord({ // saves the id in @id
			selector,
			fieldValues: newData,
			schema,
			ancillaryData,
			level,
			options,
		});
		cy.get('@id' + level).then((id) => {
			runCrudById(id);
		});
		return;
	}

	// skipAdd = true, see if an idObj with id was provided in the options
	if (!_.isNil(idObj) && !_.isNil(idObj.id)) {
		// If so, run the CRUD operations using the provided idObj.id.
		runCrudById(idObj.id);
		return;
	}

	cy.log('crudWindowedGridRecord: skipAdd was true with no options.idObj.id; skipping id-based phases.');
}
export function crudInlineGridRecord(args) {

	const {
		selector,
		newData,
		editData,
		schema,
		ancillaryData,
		level = 0,
		options = {},
	} = args;

	cy.log('crudInlineGridRecord ' + selector);

	const {
		skipView = false,
		skipAdd = false,
		skipEdit = false,
		skipDelete = false,
		idObj = null,
	} = options || {};

	getDomNode(selector).scrollIntoView();

	const runCrudById = (id) => {

		cy.log('crudInlineGridRecord: continue thru CRUD ' + selector);

		// read
		if (!skipView) {
			clickReloadButton(selector);
			cy.wait(1000); // allow time for grid to load
			verifyGridRecordExistsById(selector, id);
		}

		// edit
		if (!skipEdit) {
			editInlineGridRecord({ 
				selector,
				fieldValues: editData,
				schema,
				id,
				options,
			});
		}

		// delete
		if (!skipDelete) {
			verifyGridRecordExistsById(selector, id);
			deleteGridRecord(selector, id);
			verifyGridRecordDoesNotExistById(selector, id);
		}
	};

	if (!skipAdd) {
		// add
		addInlineGridRecord({ // saves the id in @id
			selector,
			fieldValues: newData,
			schema,
			ancillaryData,
			level,
			options,
		});
		cy.get('@id' + level).then((id) => {
			runCrudById(id);
		});
		return;
	}

	if (!_.isNil(idObj) && !_.isNil(idObj.id)) {
		runCrudById(idObj.id);
		return;
	}

	cy.log('crudInlineGridRecord: skipAdd was true with no options.idObj.id; skipping id-based phases.');
}
export function crudSideGridRecord(args) {

	const {
		selector,
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

	cy.log('crudSideGridRecord ' + selector);

	const {
		skipView = false,
		skipAdd = false,
		skipEdit = false,
		skipDelete = false,
		idObj = null,
	} = options || {};
	
	getDomNode(selector).scrollIntoView();

	const runCrudById = (id) => {

		// read
		if (!skipView) {
			clickReloadButton(selector);
			cy.wait(1000); // allow time for grid to load
			verifyGridRecordExistsById(selector, id);
		}

		// edit
		if (!skipEdit) {
			editGridRecord({
				selector,
				fieldValues: editData,
				schema,
				id,
				level: 0,
				whichEditor: SIDE,
				options,
			});
		}

		// delete
		if (!skipDelete) {
			verifyGridRecordExistsById(selector, id);
			deleteGridRecord(selector, id);
			verifyGridRecordDoesNotExistById(selector, id);
		}
	};

	if (!skipAdd) {
		// add
		addGridRecord({ // saves the id in @id
			selector,
			fieldValues: newData,
			schema,
			ancillaryData,
			level,
			options,
		});
		cy.get('@id' + level).then((id) => {
			runCrudById(id);
		});
		return;
	}

	if (!_.isNil(idObj) && !_.isNil(idObj.id)) {
		runCrudById(idObj.id);
		return;
	}

	cy.log('crudSideGridRecord: skipAdd was true with no options.idObj.id; skipping id-based phases.');
}
export function addGridRecord(args) {

	const {
		selector,
		fieldValues,
		schema,
		ancillaryData,
		level = 0,
		options = {},
	} = args;

	cy.log('addGridRecord ' + selector);

	const
		editorSelector = selector + '/editor' + (options.editorReference ? '/' + options.editorReference : ''),
		viewerSelector = editorSelector + '/viewer',
		formSelector = editorSelector + '/form',
		isRemotePhantomMode = schema.repository.isRemotePhantomMode;

	clickAddButton(selector);
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
	getDomNode([selector, 'Row-selected']).then((row) => {
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
			crudWindowedGridRecord({
				selector: ancillaryGridSelector,
				newData,
				editData,
				schema,
				ancillaryData,
				level: level+1,
				options,
			});
		});
	}
}
export function addWindowedGridRecord(args) {

	const {
		selector,
		fieldValues,
		schema,
		ancillaryData,
		level = 0,
		options = {},
	} = args;
	// adds the record as normal, then closes the editor window

	cy.log('addWindowedGridRecord ' + selector);

	addGridRecord({
		selector,
		fieldValues,
		schema,
		ancillaryData,
		level,
		options,
	});

	cy.log('addWindowedGridRecord: close window ' + selector);
	const formSelector = selector + '/editor/form';
	clickCloseButton(formSelector);
	cy.wait(500); // allow window to close
	// TODO: Change this to wait until window is closed
}
export function addInlineGridRecord(args) {

	const {
		selector,
		fieldValues,
		schema,
		ancillaryData,
		level = 0,
		options = {},
	} = args;
	// adds the record as normal, then closes the editor window

	cy.log('addInlineGridRecord ' + selector);

	addGridRecord({ // NOTE: ancillaryData is not passed to addGridRecord because can't edit ancillary data in an inline editor
		selector,
		fieldValues,
		schema,
		ancillaryData: [],
		level,
		options,
	});

	cy.log('addInlineGridRecord: close window ' + selector);
	const formSelector = selector + '/editor/form';
	clickCloseButton(formSelector);
	cy.wait(500); // allow window to close
	// TODO: Change this to wait until window is closed
}
export function editGridRecord(args) {

	const {
		selector,
		fieldValues,
		schema,
		id,
		level = 0,
		whichEditor = WINDOWED,
		options = {},
	} = args;
	
	cy.log('editGridRecord ' + selector + ' ' + id);
	
	selectGridRowIfNotAlreadySelectedById(selector, id);

	const
		editorSelector = selector + '/editor' + (options.editorReference ? '/' + options.editorReference : ''),
		viewerSelector = editorSelector + '/viewer',
		formSelector = editorSelector + '/form';

	if (whichEditor === SIDE) {
		cy.log('switch to Edit mode if necessary ' + viewerSelector);
		clickToEditButtonIfExists(viewerSelector);
	} else {
		// windowed or inline editor
		cy.log('click editBtn ' + selector);
		clickEditButton(selector);
	}
	getDomNode(formSelector).should('exist');

	fillForm(formSelector, fieldValues, schema, level +1);
	cy.wait(500); // allow validator to enable save button
	// TODO: Change this to wait until save button is enabled
	
	clickSaveButton(formSelector);
	cy.wait('@editWaiter');

	verifyNoErrorBox();

	if (whichEditor !== INLINE) {
		viewPdf(editorSelector, formSelector);
		emailPdf(editorSelector, formSelector);
	}
}
export function editWindowedGridRecord(args) {

	const {
		selector,
		fieldValues,
		schema,
		id,
		level = 0,
		options = {},
	} = args;

	// edits the record as normal, then closes the editor window

	cy.log('editWindowedGridRecord ' + selector + ' ' + id);
	
	editGridRecord({
		selector,
		fieldValues,
		schema,
		id,
		level,
		whichEditor: WINDOWED,
		options
	});

	const formSelector = selector + '/editor/form';
	clickCloseButton(formSelector);
	cy.wait(500); // allow window to close
	// TODO: Change this to wait until window is closed
}
export function editInlineGridRecord(args) {

	const {
		selector,
		fieldValues,
		schema,
		id,
		level = 0,
		options = {},
	} = args;

	// edits the record as normal, then closes the editor window

	cy.log('editInlineGridRecord ' + selector + ' ' + id);
	
	editGridRecord({
		selector,
		fieldValues,
		schema,
		id,
		level,
		whichEditor: INLINE,
		options,
	});

	const formSelector = selector + '/editor/form';
	clickCloseButton(formSelector);
	cy.wait(500); // allow window to close
	// TODO: Change this to wait until window is closed
}
export function deleteGridRecord(selector, id) {
	cy.log('deleteGridRecord ' + selector + ' ' + id);
	
	selectGridRowIfNotAlreadySelectedById(selector, id);
	clickDeleteButton(selector);
	cy.wait(500); // allow confirmation box to appear
	
	// Click OK on confirmation box
	clickYesButton('ConfirmModal');
	cy.wait('@deleteWaiter');

	verifyNoErrorBox();
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
		selector,
		newData,
		editData,
		schema,
		ancillaryData,
		level = 0,
		options = {},
	} = args;

	cy.log('crudWindowedTreeRecord ' + selector);

	const {
		skipView = false,
		skipAdd = false,
		skipEdit = false,
		skipDelete = false,
		idObj = null,
	} = options || {};

	getDomNode(selector).scrollIntoView();

	const runCrudById = (id) => {

		cy.log('crudWindowedTreeRecord: continue thru CRUD ' + selector);
		
		// read
		if (!skipView) {
			clickReloadButton(selector);
			cy.wait(1000); // allow time for tree to load
			verifyTreeRecordExistsById(selector, id);
		}

		// edit
		if (!skipEdit) {
			editWindowedTreeRecord({
				selector,
				fieldValues: editData,
				schema,
				id,
				level,
				whichEditor: WINDOWED,
				options,
			});
		}

		// delete
		if (!skipDelete) {
			verifyTreeRecordExistsById(selector, id);
			deleteTreeRecord(selector, id);
			verifyTreeRecordDoesNotExistById(selector, id);
		}
	};

	if (!skipAdd) {
		// add
		addWindowedTreeRecord({ // saves the id in @id
			selector,
			fieldValues: newData,
			schema,
			ancillaryData,
			level,
			options,
		});
		cy.get('@id' + level).then((id) => {
			runCrudById(id);
		});
		return;
	}

	if (!_.isNil(idObj) && !_.isNil(idObj.id)) {
		runCrudById(idObj.id);
		return;
	}

	cy.log('crudWindowedTreeRecord: skipAdd was true with no options.idObj.id; skipping id-based phases.');
}
export function crudSideTreeRecord(args) {

	const {
		selector,
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
	
	cy.log('crudSideTreeRecord ' + selector);

	const {
		skipView = false,
		skipAdd = false,
		skipEdit = false,
		skipDelete = false,
		idObj = null,
	} = options || {};
	
	getDomNode(selector).scrollIntoView();

	const runCrudById = (id) => {

		// read
		if (!skipView) {
			clickReloadButton(selector);
			cy.wait(1000); // allow time for tree to load
			verifyTreeRecordExistsById(selector, id);
		}

		// edit
		if (!skipEdit) {
			editTreeRecord({
				selector,
				fieldValues: editData,
				schema,
				id,
				level,
				whichEditor: SIDE,
				options,
			});
		}

		// delete
		if (!skipDelete) {
			verifyTreeRecordExistsById(selector, id);
			deleteTreeRecord(selector, id);
			verifyTreeRecordDoesNotExistById(selector, id);
		}
	};

	if (!skipAdd) {
		// add
		addTreeRecord({ // saves the id in @id
			selector,
			fieldValues: newData,
			schema,
			ancillaryData,
			level,
			options,
		});
		cy.get('@id' + level).then((id) => {
			runCrudById(id);
		});
		return;
	}

	if (!_.isNil(idObj) && !_.isNil(idObj.id)) {
		runCrudById(idObj.id);
		return;
	}

	cy.log('crudSideTreeRecord: skipAdd was true with no options.idObj.id; skipping id-based phases.');
}
export function addTreeRecord(args) {

	const {
		selector,
		fieldValues,
		schema,
		ancillaryData,
		level = 0,
		options,
	} = args;

	cy.log('addTreeRecord ' + selector);

	const
		editorSelector = selector + '/editor' + (options.editorReference ? '/' + options.editorReference : ''),
		viewerSelector = editorSelector + '/viewer',
		formSelector = editorSelector + '/form';

	// BEGIN MOD
	// select the root node
	getFirstTreeRootNode(selector).then ((rootNode) => {

		// get the rootNodeId
		const id = rootNode.attr('data-testid').split('-')[1];
		selectTreeNodeIfNotAlreadySelectedById(selector, id)
	});
	// END MOD


	clickAddButton(selector);
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
	getDomNode([selector, 'node-selected']).then((row) => {
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
			crudWindowedGridRecord({
				selector: ancillaryGridSelector,
				newData,
				editData,
				schema,
				ancillaryData,
				level: level+1,
				options,
			});
		});
	}
}
export function addWindowedTreeRecord(args) {

	const {
		selector,
		fieldValues,
		schema,
		ancillaryData,
		level = 0,
		options,
	} = args;

	// adds the record as normal, then closes the editor window

	cy.log('addWindowedTreeRecord ' + selector);

	addTreeRecord({
		selector,
		fieldValues,
		schema,
		ancillaryData,
		level,
		options,
	});

	cy.log('addWindowedTreeRecord: close window ' + selector);
	const formSelector = selector + '/editor/form';
	clickCloseButton(formSelector);
	cy.wait(500); // allow window to close
	// TODO: Change this to wait until window is closed
}
export function editTreeRecord(args) {

	const {
		selector,
		fieldValues,
		schema,
		id,
		level = 0,
		whichEditor = WINDOWED,
		options,
	} = args;
	
	cy.log('editTreeRecord ' + selector + ' ' + id);
	
	selectTreeNodeIfNotAlreadySelectedById(selector, id);

	const
		editorSelector = selector + '/editor' + (options.editorReference ? '/' + options.editorReference : ''),
		viewerSelector = editorSelector + '/viewer',
		formSelector = editorSelector + '/form';

	if (whichEditor === SIDE) {
		cy.log('switch to Edit mode if necessary ' + viewerSelector);
		clickToEditButtonIfExists(viewerSelector);
	} else {
		cy.log('click editBtn ' + selector);
		clickEditButton(selector);
	}
	getDomNode(formSelector).should('exist');

	fillForm(formSelector, fieldValues, schema, level +1);
	cy.wait(500); // allow validator to enable save button
	// TODO: Change this to wait until save button is enabled

	clickSaveButton(formSelector);
	cy.wait('@editWaiter');

	verifyNoErrorBox();

	if (whichEditor !== INLINE) {
		viewPdf(editorSelector, formSelector);
		emailPdf(editorSelector, formSelector);
	}
	
}
export function editWindowedTreeRecord(args) {

	const {
		selector,
		fieldValues,
		schema,
		id,
		level = 0,
		options,
	} = args;

	// edits the record as normal, then closes the editor window

	cy.log('editWindowedTreeRecord ' + selector + ' ' + id);
	
	editTreeRecord({
		selector,
		fieldValues,
		schema,
		id,
		level,
		whichEditor: WINDOWED,
		options,
	});

	const formSelector = selector + '/editor/form';
	clickCloseButton(formSelector);
	cy.wait(500); // allow window to close
	// TODO: Change this to wait until window is closed
}
export function deleteTreeRecord(selector, id) {

	cy.log('deleteTreeRecord ' + selector + ' ' + id);
	
	selectTreeNodeIfNotAlreadySelectedById(selector, id);
	clickDeleteButton(selector);
	cy.wait(500); // allow confirmation box to appear
	
	// Click OK on confirmation box
	clickYesButton('ConfirmModal');
	cy.wait('@deleteWaiter');

	verifyNoErrorBox();
}


// Manager screen
export function runClosureTreeControlledManagerScreenCrudTests(args) {
	// this alias is for backward compatibility.
	return runTreeManagerScreenCrudTests(args);
}
export function runClosureTreeManagerScreenCrudTests(args) {
	// this alias is for backward compatibility.
	return runTreeManagerScreenCrudTests(args);
}
export function runTreeManagerScreenCrudTests(args) {
	return runManagerScreenCrudTests({ ...args, type: 'Tree' });
}
export function runGridManagerScreenCrudTests(args) {
	// This is just an alias, as runManagerScreenCrudTests defaults to 'Grid' type.
	return runManagerScreenCrudTests(args);
}
export function runManagerScreenCrudTests(args) {

	const {
			model,
			schema,
			type = 'Grid',
			newData,
			editData,
			ancillaryData,
			fullIsInline = false,
			isSetup = false,
			options = {},
		} = args,
		Models = fixInflector(Inflector.camelize(Inflector.pluralize(model))),
		url = fixInflector(Inflector.dasherize(Inflector.underscore(Models))),
		managerSelector = '/' + Models + 'Manager',
		typeSelector = managerSelector + '/' + Models + type + 'Editor';

	if (!options.hasOwnProperty('skipFull')) {
		options.skipFull = false;
	}
	if (!options.hasOwnProperty('skipSide')) {
		options.skipSide = false;
	}

	describe(Models + 'Manager', () => {

		beforeEach(function () {
			bootstrapRouteWaiters();
			if (options.preBeforeEach) {
				options.preBeforeEach();
			}
			login();
			cy.restoreLocalStorage();
			cy.url().then((currentUrl) => {
				if (!currentUrl.endsWith(url)) {
					navigateViaTabOrHomeButtonTo(url, isSetup);
				}
			});
			if (options.beforeEach) {
				options.beforeEach();
			}
			stubWindowOpen();
		});
		
		// afterEach(function () {
		// 	cy.saveLocalStorage();
		// 	logout();
		// });
		const crudMethods = {
			crudWindowedGridRecord,
			crudInlineGridRecord,
			crudWindowedTreeRecord,
			crudSideGridRecord,
			crudSideTreeRecord,
		};

		if (!options.skipFull) {
			it('CRUD in full mode', function() {
	
				toFullMode(managerSelector);
				cy.wait(500); // wait for grid to load

				let editorType = 'Windowed';
				if (type === 'Grid' && fullIsInline) {
					editorType = 'Inline';
				}

				const
					methodName = 'crud' + editorType + type + 'Record',
					crudMethod = crudMethods[methodName];

				if (!crudMethod) {
					throw new Error('Unknown CRUD method: ' + methodName);
				}

				crudMethod({
					selector: typeSelector,
					selector: typeSelector,
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
	
				toSideMode(managerSelector);
				cy.wait(500); // wait for grid to load
	
				const
					methodName = 'crudSide' + type + 'Record', // e.g. 'crudSideGridRecord'
					crudMethod = crudMethods[methodName];
				crudMethod({
					selector: typeSelector,
					selector: typeSelector,
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
