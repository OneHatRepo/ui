import {
	fixInflector,
	getLastPartOfPath,
} from './utilities.js';
import {
	getDomNode,
	getDomNodes,
} from './dom_functions.js';
import Inflector from 'inflector-js';
import _ from 'lodash';
const $ = Cypress.$;



// Get rows
export function hasRowWithFieldValue(gridSelector, field, value) {
	return getDomNodes([gridSelector, 'row', 'cell-' + field]).contains(value);
}
export function getRowWithFieldValue(gridSelector, field, value) {
	return getDomNodes([gridSelector, 'row', 'cell-' + field]).contains(value).then((cells) => {
		if (!cells.length) {
			return null;
		}
		
		const cell = cells[0];
		return $(cell).closest('[data-testid="row"]')[0];
	});
}
// export function getRowWithText(grid, text) {
// 	return getRows(grid).contains(text);
// }
// export function getRowWithId(grid, id) {
// 	return getRows(grid, '[data-cy-recordid=' + id + ']');
// }
// export function getRowWithIx(grid, ix) {
// 	return getRows(grid, '[data-recordindex=' + ix + ']');
// }


// Select rows
export function selectGridRowById(gridSelector, id) {
	cy.log('selectGridRowById ' + gridSelector + ' ' + id);
	const rowSelector = getGridRowSelectorById(gridSelector, id);
	getDomNode([gridSelector, rowSelector])
		.click();
}
export function selectGridRowIfNotAlreadySelectedById(gridSelector, id) {
	cy.log('selectGridRowIfNotAlreadySelectedById ' + gridSelector + ' ' + id);
	const rowSelector = getGridRowSelectorById(gridSelector, id);
	getDomNode([gridSelector, rowSelector]).then((row) => {
		const found = row.find('[data-testid="row-selected"]')
		if (!found.length) {
			selectGridRowById(gridSelector, id);
		}
	})
}
// export function selectRowWithText(grid, text) {
// 	getRowWithText(grid, text).click(5, 5);
// }
// export function selectRowWithIx(grid, ix) {
// 	getRowWithIx(grid, ix).click(5, 5);
// }
// export function cmdClickRowWithId(grid, id) {
// 	getRowWithId(grid, id).click('left', { metaKey: true });
// }


// // Double-click rows
// export function doubleClickRowWithText(grid, text) {
// 	getRowWithText(grid, text).dblclick();
// }
// export function doubleClickRowWithId(grid, id) {
// 	getRowWithId(grid, id).dblclick();
// }
// export function doubleClickRowWithIx(grid, ix) {
// 	getRowWithIx(grid, ix).dblclick();
// }


export function verifyGridRecordDoesNotExistByValue(gridSelector, fieldValues, schema) {
	const
		field = schema.model.displayProperty,
		value = fieldValues[field];
		
	getDomNodes([gridSelector, 'row', 'cell-' + field])
		.contains(value, { timeout: 500 })
		.should('not.exist');
}
export function verifyGridRecordExistsByValue(gridSelector, fieldValues, schema) {
	const
		field = schema.model.displayProperty,
		value = fieldValues[field];
		
	getDomNodes([gridSelector, 'row', 'cell-' + field])
		.contains(value, { timeout: 500 })
		.should('exist');
}
export function verifyGridRecordExistsById(gridSelector, id) {
	cy.log('verifyGridRecordExistsById ' + gridSelector + ' ' + id);
	
	const rowSelector = getGridRowSelectorById(gridSelector, id);
	getDomNodes([gridSelector, rowSelector])
		.should('exist');
}
export function verifyGridRecordDoesNotExistById(gridSelector, id) {
	cy.log('verifyGridRecordDoesNotExistById ' + gridSelector + ' ' + id);
	const rowSelector = getGridRowSelectorById(gridSelector, id);
	getDomNodes([gridSelector, rowSelector])
		.should('not.exist');
}
export function verifyGridRowIsSelectedById(gridSelector, id) {
	cy.log('verifyGridRowIsSelectedById ' + gridSelector + ' ' + id);
	const rowSelector = getGridRowSelectorById(gridSelector, id);
	getDomNodes([gridSelector, rowSelector, 'row-selected'])
		.should('exist');
}





// export function addRecordWithInlineEditor(grid, fieldValues, schema) {
// 	clickGridAddButton(grid, true);
// 	fillInlineForm(grid, fieldValues, schema);
// 	cy.route('POST', '**/extAdd**').as('addWaiter');
// 	submitInlineForm(grid);
// 	cy.wait('@addWaiter');
// 	verifyNoErrorBox();
// 	getSelectedRowId(grid); // Adds @id alias
// 	cy.wait(1000);
// }
// export function addRecordWithWindowedEditor(grid, editorCls, fieldValues, schema) {
// 	clickGridAddButton(grid, true);
// 	fillWindowedForm(editorCls, fieldValues, schema);
// 	cy.route('POST', '**/extAdd**').as('addWaiter');
// 	submitWindowedForm(editorCls);
// 	cy.wait('@addWaiter');
// 	verifyNoErrorBox();
// 	getSelectedRowId(grid); // Adds @id alias
// 	cy.wait(1000);
// }
// export function editRecordWithInlineEditor(grid, fieldValues, schema) {
// 	cy.get("@id").then((id) => {
// 		doubleClickRowWithId(grid, id);
// 		fillInlineForm(grid, fieldValues, schema);
// 		cy.route('POST', '**/extEdit**').as('editWaiter');
// 		submitInlineForm(grid);
// 		cy.wait('@editWaiter');
// 		verifyNoErrorBox();
// 		cy.wait(500);
// 	});
// }
// export function editRecordWithWindowedEditor(grid, editorCls, fieldValues, schema) {
// 	cy.get("@id").then((id) => {
// 		doubleClickRowWithId(grid, id);
// 		fillWindowedForm(editorCls, fieldValues, schema);
// 		cy.route('POST', '**/extEdit**').as('editWaiter');
// 		submitWindowedForm(editorCls);
// 		cy.wait('@editWaiter');
// 		verifyNoErrorBox();
// 	});
// }
// export function removeRecord(grid) {
// 	cy.get("@id").then((id) => {
// 		cy.wait(500);
// 		clickGridRemoveButton(grid);
// 		cy.route('POST', '**/extDelete**').as('removeWaiter');
// 		clickMessageBoxDefaultButton();
// 		cy.wait('@removeWaiter');
// 		verifyNoErrorBox();
// 	});
// }


// Grid Utilities
export function getModelFromGridName(gridName) {
	// try to match with something like 'EquipmentFilteredGridEditor'
	const
		pattern = '^' + // start
						'([\\w]+?)' + // model name
						'(?=Filtered|Inline|Side|Grid)' + // positive lookahead to guarantee one of these is the next word
						'(Filtered)?' + // optional
						'(Inline)?' + // optional
						'(Side)?' + // optional
						'Grid' + // required
						'(Editor)?' + // optional
						'(Side[AB])?' + // optional
					'$', // end
		regex = new RegExp(pattern),
		match = gridName.match(regex);
	return match?.length ? match[1] : null;
}
export function getModelFromGridPath(gridPath) {
	// try to match with something like '...__eq_manufacturer_id/grid'
	let
		pattern = '^' + // start
						'.*' + // previous selector path (ignore)
						'(?=__)' + // positive lookahead to guarantee '__' is the next word
						'__' + // required
						'([A-Za-z_]+)' + // field name (model name underscored, singularized)
						'([\\d]+)?' + // optional (digit, e.g. eq_engine_model1_id)
						'_id/(combo/)?grid' + // required
					'$', // end
		regex = new RegExp(pattern),
		match = gridPath.match(regex);
	if (!match) {
		// try to match with something like '.../work_orders__equipment/combo/grid"'
		pattern = '^' + // start
						'.*' + // previous selector path (ignore)
						'(?=__)' + // positive lookahead to guarantee '__' is the next word
						'__' + // required
						'([A-Za-z_]+)' + // field name (model name underscored, pluralized)
						'/(combo/)?grid' + // required
					'$', // end
		regex = new RegExp(pattern);
		match = gridPath.match(regex);
	}
	return match?.length ? match[1] : null;
}
export function getModelFromGridSelector(gridSelector) {
	const gridName = getLastPartOfPath(gridSelector);
	let model = getModelFromGridName(gridName);
	if (!model) {
		model = getModelFromGridPath(gridSelector);
		if (model) {
			model = fixInflector(Inflector.camelize(Inflector.pluralize(model)));
		}
	}
	return model;
}
export function getGridRowSelectorById(gridSelector, id) {
	const
		model = getModelFromGridSelector(gridSelector);

		if (!model) {
			debugger;
		}
		const inflected = fixInflector(Inflector.camelize(Inflector.pluralize(model)));
	return inflected + '-' + id;
}



// function fillInlineForm(grid, fieldValues, schema) {
// 	getInlineEditor(grid)
// 		.then((editor) => {
// 			fillForm(editor, fieldValues, schema);
// 		});
// }
// function submitInlineForm(grid) {
// 	cy.wait(1000);
// 	getInlineEditorButtons(grid)
// 		.filter('.x-row-editor-update-button')
// 		// .then((el) => {
// 		// 	cy.get(el[0]).click();
// 		// 	// el[0].click();
// 		// });
// 		.click({ force: true });
// }
