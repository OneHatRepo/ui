import {
	getPropertyDefinitionFromSchema,
	getLastPartOfPath,
} from './utilities.js';
import {
	getDomNode,
	getDomNodes,
	getTestIdSelectors,
} from './dom_functions.js';
import {
	crudCombo,
	crudTag,
} from './crud_functions.js';
import natsort from 'natsort';
import _ from 'lodash';
const $ = Cypress.$;


export const customFormFunctions = {};
export function setCustomFormFunctions(fns) {
	_.merge(customFormFunctions, fns);
}


/**
 * Take data and shove it into a form, using keypresses, clicks, etc
 * @param {object} fieldValues - fieldName/value pairs
 * @param {object} schema - fieldName/fieldType pairs
 */
export function fillForm(selector, fieldValues, schema, level = 0) {
	_.each(fieldValues, (value, fieldName) => {

		const selectors = [selector, 'field-' + fieldName];
		getDomNode(selectors).scrollIntoView();

		let editorType = null;
		if (schema.model) {
			// OneHatData schema
			const propertyDefinition = getPropertyDefinitionFromSchema(fieldName, schema);
			if (propertyDefinition.isEditingDisabled) {
				return;
			}
			editorType = propertyDefinition?.editorType?.type;
		} else {
			// basic schema (for ReportsManager, etc.)
			editorType = schema[fieldName];
		}
		
		if (editorType === 'Input') {
			setTextValue(selectors, value);
		} else
		if (editorType === 'TextArea') {
			setTextAreaValue(selectors, value);
		} else
		if (editorType?.match(/ArrayCombo/)) {
			setArrayComboValue(selectors, value);
		} else
		if (editorType?.match(/Combo/)) {
			if (value?.value) {
				// First test the CRUD operations of this combo
				crudCombo(selectors, value.newData, value.editData, value.schema, value.ancillaryData, level);
				value = value.value;
			}
			setComboValue(selectors, value);
		} else
		if (editorType === 'Date') {
			setDateValue(selectors, value);
		} else
		if (editorType === 'Number') {
			setNumberValue(selectors, value);
		} else
		if (editorType?.match(/Tag/)) {
			if (value?.value) {
				// First test the CRUD operations of this combo
				crudTag(selectors, value.newData, value.editData, value.schema, value.ancillaryData, level);
				value = value.value;
			}
			setTagValue(selectors, value);
		} else
		if (editorType === 'Toggle') {
			setToggleValue(selectors, value);
		} else
		if (editorType?.match(/Checkbox/)) {
			// 	setCheckboxValue(selectors, value);
		} else
		if (editorType?.match(/Radio/)) {
			// setRadioValue(selectors, value);
		} else
		if (editorType === 'File') {
			// setFileValue(selectors, value);
		} else {
			const editorFn = customFormFunctions.getCustomEditorSetFn(editorType);
			if (editorFn) {
				editorFn(selectors, value);
			}
		}
	});
}



//    _____      __  __
//   / ___/___  / /_/ /____  __________
//   \__ \/ _ \/ __/ __/ _ \/ ___/ ___/
//  ___/ /  __/ /_/ /_/  __/ /  (__  )
// /____/\___/\__/\__/\___/_/  /____/

// export function setCheckboxValue(field, value) {
// }
// export function setRadioValue(field, value) {
// }
// export function setFileValue(field, value) {
// }
export function setArrayComboValue(selectors, value) {
	getDomNode([...selectors, 'input']).then((field) => {
		cy.get(field).clear({ force: true });
		if (value) {
			cy.get(field)
				.type(value, { delay: 40, force: true }) // slow it down a bit, so React has time to re-render
				.wait(1000) // allow time to load dropdown

				.type('{enter}')
				.wait(250); // allow time to register enter key
		}
	});
}
export function setComboValue(selectors, value) {
	getDomNode([...selectors, 'input']).then((field) => {
		cy.get(field).clear({ force: true });
		if (value) {
			cy.intercept('GET', '**/get**').as('getWaiter'); // set up waiter
			cy.get(field)
				.type(value, { delay: 40, force: true }) // slow it down a bit, so React has time to re-render
				.wait('@getWaiter'); // allow dropdown to load
				
			cy.get(field)
				.wait(1000) // render
				.type('{downarrow}')
				.wait(250) // allow time for selection

				.type('{enter}')
				.wait(250); // allow time to register enter key
		}
	});
}
export function setTagValue(selectors, value) {
	const values = !_.isEmpty(value) ? JSON.parse(value) : null;

	// Clear any previously selected tags
	function clickButtonsWithRemove(selector) {
		// This function allows Cypress to click on multiple elements in one command,
		// when clicking the elements removes them from the DOM.
		cy.get('body').then((body) => {
			if (body.find(selector).length === 0) {
				return;
			}
			cy.get(selector).eq(0)
				.click()
				.then(() => {
					clickButtonsWithRemove(selector); // Recursive call for the next element
				});
		});
	}
	clickButtonsWithRemove(getTestIdSelectors([...selectors, 'xBtn']));

	// Now add the new tags
	getDomNode([...selectors, 'input']).then((field) => {
		cy.get(field).clear({ force: true });
		if (!_.isEmpty(values)) {
			_.each(values, (value) => {
				const id = value.id;
				cy.intercept('GET', '**/get**').as('getWaiter'); // set up waiter
				cy.get(field)
					.type('id:' + id, { delay: 40, force: true }) // slow it down a bit, so React has time to re-render
					.wait('@getWaiter'); // allow dropdown to load
					
				cy.get(field)
					.wait(1000) // render
					.type('{downarrow}')
					.wait(500); // allow time for selection
			});

			// press trigger to hide dropdown
			getDomNode([...selectors, 'trigger']).click({ force: true });
		}
	});
}
export function setDateValue(selectors, value) {
	getDomNode(selectors).then((field) => {
		cy.get(field).clear({ force: true });
		if (value) {
			cy.get(field)
				.type(value, { force: true }) // slow it down a bit, so React has time to re-render
				.type('{enter}');
		}
	});
}
export function setNumberValue(selectors, value) {
	// setTextValue(selectors, value);

	getDomNode(selectors).clear({ force: true });
	if (value !== null && value !== '') {
		getDomNode(selectors)
			.type(value, { delay: 500 }) // WorkOrdersEditor was not working when there was no delay!
			.type('{enter}');
	}
}
export function setToggleValue(selectors, value) {
	selectors.push('input[role="switch"]');
	if (value) {
		getToggleState(selectors).then((isYes) => {
			if (!isYes) {
				clickToggle(selectors, { force: true, metaKey: false });
			}
		});
	} else if (value === false) {
		getToggleState(selectors).then((isYes) => {
			if (isYes) {
				clickToggle(selectors, { force: true, metaKey: false });
			}
		});
	} else if (_.isNil(value)) {
		clickToggle(selectors, { force: true, metaKey: true });
	}
}
export function getToggleState(selectors) {
	return getDomNode(selectors).then((node) => {
		if (!node.length) {
			return null;
		}
		return !!node[0].checked;
	});
}
export function clickToggle(selectors, options = {}) {
	getDomNode(selectors).click(options);
}
export function setTextValue(selectors, value) {
	getDomNode(selectors).clear({ force: true });
	if (value !== null && value !== '') {
		getDomNode(selectors)
			.type(value)
			.type('{enter}');
	}
}
export function setTextAreaValue(selectors, value) {
	getDomNode(selectors).clear({ force: true });
	if (value !== null && value !== '') {
		getDomNode(selectors)
			.type(value);
	}
}
export function setInputValue(selectors, value) {
	setTextValue(selectors, value);
}


// /**
//  * Given a form,
//  * return a url-encoded string representing all keys and values
//  *
//  * @param {jQuery} form
//  * @return {String}
//  */
// export function formSerialize(form) {
// 	'use strict';
// 	var i, j, len, jLen, formElement, 
// 		q = [],
// 		theForm = form[0],
// 		varCounters = {};

// 	function addNameValue(name, value) { // create this function so I can use varCounters for 
// 		var matches = name.match(/([\w\d]+)\[\]/i),
// 			varName,
// 			ix = 0;
// 		if (matches && matches[1]) {
// 			varName = matches[1];
// 			if (typeof varCounters[varName] === 'undefined') {
// 				varCounters[varName] = ix;
// 			} else {
// 				ix = ++varCounters[varName];
// 			}
// 			name = varName + '[' + ix + ']';
// 		}
// 		q.push(urlencode(name) + '=' + urlencode(value));
// 	}

// 	if (!theForm || !theForm.nodeName || theForm.nodeName.toLowerCase() !== 'form') {
// 		throw 'You must supply a form element';
// 	}
// 	for (i = 0, len = theForm.elements.length; i < len; i++) {
// 		formElement = theForm.elements[i];
// 		if (formElement.name === '' || formElement.disabled) {
// 			continue;
// 		}
// 		switch (formElement.nodeName.toLowerCase()) {
// 			case 'input':
// 				switch (formElement.type) {
// 					case 'text':
// 					case 'hidden':
// 					case 'password':
// 					case 'button': // Not submitted when submitting form manually, though jQuery does serialize this and it can be an HTML4 successful control
// 					case 'submit':
// 						addNameValue(formElement.name, formElement.value);
// 						break;
// 					case 'checkbox':
// 					case 'radio':
// 						if (formElement.checked) {
// 							addNameValue(formElement.name, formElement.value);
// 						} else if (formElement.value === '1') {
// 							addNameValue(formElement.name, '0'); // Submit actual value of zero for booleans, instead of no value at all
// 						}
// 						break;
// 					case 'file':
// 						// addNameValue(formElement.name, formElement.value); // Will work and part of HTML4 "successful controls", but not used in jQuery
// 						break;
// 					case 'reset':
// 						break;
// 				}
// 				break;
// 			case 'textarea':
// 				addNameValue(formElement.name, formElement.value);
// 				break;
// 			case 'select':
// 				switch (formElement.type) {
// 					case 'select-one':
// 						addNameValue(formElement.name, formElement.value);
// 						break;
// 					case 'select-multiple':
// 						for (j = 0, jLen = formElement.options.length; j < jLen; j++) {
// 							if (formElement.options[j].selected) {
// 								addNameValue(formElement.name, formElement.options[j].value);
// 							}
// 						}
// 						break;
// 				}
// 				break;
// 			case 'button': // jQuery does not submit these, though it is an HTML4 successful control
// 				switch (formElement.type) {
// 					case 'reset':
// 					case 'submit':
// 					case 'button':
// 						addNameValue(formElement.name, formElement.value);
// 						break;
// 				}
// 				break;
// 		}
// 	}
// 	return q.join('&');
// }



//    ______     __  __
//   / ____/__  / /_/ /____  __________
//  / / __/ _ \/ __/ __/ _ \/ ___/ ___/
// / /_/ /  __/ /_/ /_/  __/ /  (__  )
// \____/\___/\__/\__/\___/_/  /____/

// /**
//  * Get data from a form
//  * @param {object} schema - fieldName/fieldType pairs
//  * @returns {object} formValues - object of fieldName/value pairs
//  */
// export function getFormValues(editor, schema) {
// 	const fields = editor.find('.x-form-field'),
// 		formValues = {};

// 	_.each(fields, (field) => {
// 		const fieldType = schema[field.name];
// 		switch(fieldType) {
// 			case 'checkbox':
// 				formValues[fieldName] = getCheckboxValue(fieldName);
// 				break;
// 			case 'combo':
// 				formValues[fieldName] = getComboValue(fieldName);
// 				break;
// 			case 'date':
// 				formValues[fieldName] = getDateValue(fieldName);
// 				break;
// 			case 'datetime':
// 				formValues[fieldName] = getDatetimeValue(fieldName);
// 				break;
// 			case 'file':
// 				formValues[fieldName] = getFileValue(fieldName);
// 				break;
// 			case 'number':
// 				formValues[fieldName] = getNumberValue(fieldName);
// 				break;
// 			case 'radio':
// 				formValues[fieldName] = getRadioValue(fieldName);
// 				break;
// 			case 'tag':
// 				formValues[fieldName] = getTagValue(fieldName);
// 				break;
// 			case 'text':
// 			case 'textarea':
// 				formValues[fieldName] = getTextValue(fieldName);
// 				break;
// 			case 'time':
// 				formValues[fieldName] = getTimeValue(fieldName);
// 				break;
// 		}
// 	});
// 	return formValues;
// }


// /**
//  * Validate that form values match what they're supposed to
//  */
// export function validateFormValues(data, schema) {
// 	cy.wrap().then(() => { // Wrap this in a Cypress promise, so it executes in correct order, relative to other Cypress promises

// 		const formValues = getFormValues(schema);
// 		let diff = deepDiffObj(formValues, data);

// 		// SPECIAL CASE: Omit password fields from diff
// 		const omitFields = [];
// 		_.each(diff, (value, key) => {
// 			if (key.match(/^password/i)) {
// 				omitFields.push(key);
// 			}
// 		});
// 		if (omitFields.length) {
// 			diff = _.omit(diff, omitFields);
// 		}
		
// 		// If there are still any differences, log them
// 		if (_.keys(diff).length > 0) {
// 			console.log('data', data);
// 			console.log('formValues', formValues);
// 			console.log('diff', diff);
// 		}

// 		expect(diff).to.deep.equal({});
// 	});
// }



// export function getCheckboxValue(fieldName) {

// }
// export function getComboValue(fieldName) {
	
// }
// export function getDateValue(fieldName) {
	
// }
// export function getDatetimeValue(fieldName) {
	
// }
// export function getFileValue(fieldName) {
	
// }
// export function getNumberValue(fieldName) {
	
// }
// export function getRadioValue(fieldName) {
	
// }
// export function getTagValue(fieldName) {
	
// }
// export function getTextValue(fieldName) {
// 	const value = $(field).val();
// 	return typeof value === 'undefined' || value === '' ? null : value;
// }
// export function getTimeValue(fieldName) {
	
// }

// // export function getTextareaValue(field) {
// // 	const value = $(field).val();
// // 	return typeof value === 'undefined' || value === '' ? null : value;
// // }
// // export function setSelectValue(fieldName, value) {
// // 	cy.get('select[name="' + fieldName + '"]')
// // 		.select(value);
// // }
// // export function getSelectValue(fieldName) {
// // 	const value = $('select[name="' + fieldName + '"]').val();
// // 	return typeof value === 'undefined' || value === '' ? null : value;
// // }
// // export function setCheckboxOrRadioValue(fieldName, value) {
// // 	cy.get(field)
// // 		.check(value);
// // }
// // export function getCheckboxOrRadioValue(fieldName) {
// // 	const value = $('input[name="' + fieldName + '"]:checked').val();
// // 	return typeof value === 'undefined' || value === '' ? null : value;
// // }
// // export function setCheckboxValues(fieldName, value) {
// // 	const values = value.split(',');
// // 	cy.get('input[name="' + fieldName + '[]"]')
// // 		.check(values);
// // }
// // export function getCheckboxValues(fieldName) {
// // 	const inputs = $('input[name="' + fieldName + '[]"]:checked'),
// // 		values = [];

// // 	_.each(inputs, (input) => {
// // 		values.push($(input).val());
// // 	});

// // 	values.sort(natsort());

// // 	const value = values.join(',');
// // 	return value === '' ? null : value;
// // }



