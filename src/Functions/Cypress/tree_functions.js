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
export function hasNodeWithFieldValue(treeSelector, field, value) {
	cy.log('hasNodeWithFieldValue ' + treeSelector + ' ' + field + ' ' + value);
	return getDomNodes([treeSelector, 'row', 'cell-' + field]).contains(value);
}
export function getNodeWithFieldValue(treeSelector, field, value) {
	cy.log('getNodeWithFieldValue ' + treeSelector + ' ' + field + ' ' + value);
	return getDomNodes([treeSelector, 'row', 'cell-' + field]).contains(value).then((cells) => {
		if (!cells.length) {
			return null;
		}
		
		const cell = cells[0];
		return $(cell).closest('[data-testid="row"]')[0];
	});
}
export function getFirstTreeRootNode(treeSelector) {
	cy.log('getFirstTreeRootNode ' + treeSelector);
	return cy.get('[data-testid="' + treeSelector + '"]:first ' + 
					'[data-testid="ScrollView"]:first > div > div:first'); // this is fragile!
}
// export function getNodeWithText(tree, text) {
// 	return getNodes(tree).contains(text);
// }
// export function getNodeWithId(tree, id) {
// 	return getNodes(tree, '[data-cy-recordid=' + id + ']');
// }
// export function getNodeWithIx(tree, ix) {
// 	return getNodes(tree, '[data-recordindex=' + ix + ']');
// }


// Select rows
export function selectTreeNodeById(treeSelector, id) {
	cy.log('selectTreeNodeById ' + treeSelector + ' ' + id);
	const rowSelector = getTreeNodeSelectorById(treeSelector, id);
	getDomNode([treeSelector, rowSelector])
		.click();
}
export function selectTreeNodeIfNotAlreadySelectedById(treeSelector, id) {
	cy.log('selectTreeNodeIfNotAlreadySelectedById ' + treeSelector + ' ' + id);
	const rowSelector = getTreeNodeSelectorById(treeSelector, id);
	getDomNode([treeSelector, rowSelector]).then((row) => {
		const found = row.find('[data-testid="node-selected"]')
		if (!found.length) {
			selectTreeNodeById(treeSelector, id);
		}
	})
}
// export function selectNodeWithText(tree, text) {
// 	getNodeWithText(tree, text).click(5, 5);
// }
// export function selectNodeWithIx(tree, ix) {
// 	getNodeWithIx(tree, ix).click(5, 5);
// }
// export function cmdClickNodeWithId(tree, id) {
// 	getNodeWithId(tree, id).click('left', { metaKey: true });
// }


// // Double-click rows
// export function doubleClickNodeWithText(tree, text) {
// 	getNodeWithText(tree, text).dblclick();
// }
// export function doubleClickNodeWithId(tree, id) {
// 	getNodeWithId(tree, id).dblclick();
// }
// export function doubleClickNodeWithIx(tree, ix) {
// 	getNodeWithIx(tree, ix).dblclick();
// }


export function verifyTreeRecordDoesNotExistByValue(treeSelector, fieldValues, schema) {
	const
		field = schema.model.displayProperty,
		value = fieldValues[field];
		
	cy.log('verifyTreeRecordDoesNotExistByValue ' + treeSelector + ' ' + value);
	getDomNodes([treeSelector, 'row', 'cell-' + field])
		.contains(value, { timeout: 500 })
		.should('not.exist');
}
export function verifyTreeRecordExistsByValue(treeSelector, fieldValues, schema) {
	const
		field = schema.model.displayProperty,
		value = fieldValues[field];
		
	cy.log('verifyTreeRecordExistsByValue ' + treeSelector + ' ' + value);
	getDomNodes([treeSelector, 'row', 'cell-' + field])
		.contains(value, { timeout: 500 })
		.should('exist');
}
export function verifyTreeRecordExistsById(treeSelector, id) {
	cy.log('verifyTreeRecordExistsById ' + treeSelector + ' ' + id);
	
	const rowSelector = getTreeNodeSelectorById(treeSelector, id);
	getDomNodes([treeSelector, rowSelector])
		.should('exist');
}
export function verifyTreeRecordDoesNotExistById(treeSelector, id) {
	cy.log('verifyTreeRecordDoesNotExistById ' + treeSelector + ' ' + id);
	const rowSelector = getTreeNodeSelectorById(treeSelector, id);
	getDomNodes([treeSelector, rowSelector])
		.should('not.exist');
}
export function verifyTreeNodeIsSelectedById(treeSelector, id) {
	cy.log('verifyTreeNodeIsSelectedById ' + treeSelector + ' ' + id);
	const rowSelector = getTreeNodeSelectorById(treeSelector, id);
	getDomNodes([treeSelector, rowSelector, 'node-selected'])
		.should('exist');
}





// export function addRecordWithInlineEditor(tree, fieldValues, schema) {
// 	clickTreeAddButton(tree, true);
// 	fillInlineForm(tree, fieldValues, schema);
// 	cy.route('POST', '**/extAdd**').as('addWaiter');
// 	submitInlineForm(tree);
// 	cy.wait('@addWaiter');
// 	verifyNoErrorBox();
// 	getSelectedNodeId(tree); // Adds @id alias
// 	cy.wait(1000);
// }
// export function addRecordWithWindowedEditor(tree, editorCls, fieldValues, schema) {
// 	clickTreeAddButton(tree, true);
// 	fillWindowedForm(editorCls, fieldValues, schema);
// 	cy.route('POST', '**/extAdd**').as('addWaiter');
// 	submitWindowedForm(editorCls);
// 	cy.wait('@addWaiter');
// 	verifyNoErrorBox();
// 	getSelectedNodeId(tree); // Adds @id alias
// 	cy.wait(1000);
// }
// export function editRecordWithInlineEditor(tree, fieldValues, schema) {
// 	cy.get("@id").then((id) => {
// 		doubleClickNodeWithId(tree, id);
// 		fillInlineForm(tree, fieldValues, schema);
// 		cy.route('POST', '**/extEdit**').as('editWaiter');
// 		submitInlineForm(tree);
// 		cy.wait('@editWaiter');
// 		verifyNoErrorBox();
// 		cy.wait(500);
// 	});
// }
// export function editRecordWithWindowedEditor(tree, editorCls, fieldValues, schema) {
// 	cy.get("@id").then((id) => {
// 		doubleClickNodeWithId(tree, id);
// 		fillWindowedForm(editorCls, fieldValues, schema);
// 		cy.route('POST', '**/extEdit**').as('editWaiter');
// 		submitWindowedForm(editorCls);
// 		cy.wait('@editWaiter');
// 		verifyNoErrorBox();
// 	});
// }
// export function removeRecord(tree) {
// 	cy.get("@id").then((id) => {
// 		cy.wait(500);
// 		clickTreeRemoveButton(tree);
// 		cy.route('POST', '**/extDelete**').as('removeWaiter');
// 		clickMessageBoxDefaultButton();
// 		cy.wait('@removeWaiter');
// 		verifyNoErrorBox();
// 	});
// }


// Tree Utilities
export function getModelFromTreeName(treeName) {
	// try to match with something like 'EquipmentFilteredTreeEditor'
	const
		pattern = '^' + // start
						'([\\w]+?)' + // model name
						'(?=Filtered|Inline|Side|Tree)' + // positive lookahead to guarantee one of these is the next word
						'(Filtered)?' + // optional
						'(Inline)?' + // optional
						'(Side)?' + // optional
						'Tree' + // required
						'(Editor)?' + // optional
						'(Side[AB])?' + // optional
					'$', // end
		regex = new RegExp(pattern),
		match = treeName.match(regex);
	return match?.length ? match[1] : null;
}
export function getModelFromTreePath(treePath) {
	// try to match with something like '...__eq_manufacturer_id/tree'
	let
		pattern = '^' + // start
						'.*' + // previous selector path (ignore)
						'(?=__)' + // positive lookahead to guarantee '__' is the next word
						'__' + // required
						'([A-Za-z_]+)' + // field name (model name underscored, singularized)
						'([\\d]+)?' + // optional (digit, e.g. eq_engine_model1_id)
						'_id/(combo/)?tree' + // required
					'$', // end
		regex = new RegExp(pattern),
		match = treePath.match(regex);
	if (!match) {
		// try to match with something like '.../work_orders__equipment/combo/tree"'
		pattern = '^' + // start
						'.*' + // previous selector path (ignore)
						'(?=__)' + // positive lookahead to guarantee '__' is the next word
						'__' + // required
						'([A-Za-z_]+)' + // field name (model name underscored, pluralized)
						'/(combo/)?tree' + // required
					'$', // end
		regex = new RegExp(pattern);
		match = treePath.match(regex);
	}
	return match?.length ? match[1] : null;
}
export function getModelFromTreeSelector(treeSelector) {
	const treeName = getLastPartOfPath(treeSelector);
	let model = getModelFromTreeName(treeName);
	if (!model) {
		model = getModelFromTreePath(treeSelector);
		if (model) {
			model = fixInflector(Inflector.camelize(Inflector.pluralize(model)));
		}
	}
	return model;
}
export function getTreeNodeSelectorById(treeSelector, id) {
	const
		model = getModelFromTreeSelector(treeSelector);

		if (!model) {
			debugger;
		}
		const inflected = fixInflector(Inflector.camelize(Inflector.pluralize(model)));
	return inflected + '-' + id;
}
