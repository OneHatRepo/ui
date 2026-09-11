import {
	getPropertyDefinitionFromSchema,
	getLastPartOfPath,
	urlencode,
} from './utilities.js';
import {
	getDomNode,
	getDomNodes,
	getTestIdSelectors,
} from './dom_functions.js';
import {
	crudCombo,
	crudTag,
	crudJson,
} from './crud_functions.js';
import {
	clickXButtonIfEnabled
} from './button_functions.js';
import natsort from 'natsort';
import _ from 'lodash';
const $ = Cypress.$;


export const customFormFunctions = {};
export function setCustomFormFunctions(fns) {
	_.merge(customFormFunctions, fns);
}





//    _____      __  __
//   / ___/___  / /_/ /____  __________
//   \__ \/ _ \/ __/ __/ _ \/ ___/ ___/
//  ___/ /  __/ /_/ /_/  __/ /  (__  )
// /____/\___/\__/\__/\___/_/  /____/

/**
 * Take data and shove it into a form, using keypresses, clicks, etc
 * @param {object} fieldValues - fieldName/value pairs
 * @param {object} schema - fieldName/fieldType pairs
 */
export function fillForm(selector, fieldValues, schema, level = 0) {
	cy.log('fillForm');
	_.each(fieldValues, (value, fieldName) => {

		const selectors = [selector, 'field-' + fieldName];
		getDomNode(selectors).scrollIntoView();

		let editorType = null;
		if (schema.model) {
			// OneHatData schema
			const propertyDefinition = getPropertyDefinitionFromSchema(fieldName, schema);
			if (propertyDefinition?.isEditingDisabled) {
				return;
			}
			editorType = propertyDefinition?.editorType?.type;
		} else {
			// basic schema (for ReportsManager, etc.)
			editorType = schema[fieldName];
		}
		
		if (editorType === 'Input') {
			setInputValue(selectors, value);
		} else
		if (editorType === 'DisplayField' || editorType === 'Text') {
			setDisplayValue(selectors, value);
		} else
		if (editorType === 'Hidden') {
			setHiddenValue(selectors, value);
		} else
		if (editorType === 'Color') {
			setColorValue(selectors, value);
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
				crudCombo({ selector: selectors, newData: value.newData, editData: value.editData, schema: value.schema, ancillaryData: value.ancillaryData, level, options: value.options });
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
		if (editorType === 'Slider') {
			setSliderValue(selectors, value);
		} else
		if (editorType?.match(/Tag/)) {
			if (value?.value) {
				// First test the CRUD operations of this combo
				crudTag({ selector: selectors, newData: value.newData, editData: value.editData, schema: value.schema, ancillaryData: value.ancillaryData, level, options: value.options });
				value = value.value;
			}
			setTagValue(selectors, value);
		} else
		if (editorType === 'Toggle') {
			setToggleValue(selectors, value);
		} else
		if (editorType === 'Checkbox') {
			setCheckboxValue(selectors, value);
		} else
		if (editorType === 'CheckboxGroup' || editorType === 'ArrayCheckboxGroup') {
			setCheckboxGroupValue(selectors, value);
		} else
		if (editorType === 'RadioGroup' || editorType === 'ArrayRadioGroup') {
			setRadioValue(selectors, value);
		} else
		if (editorType === 'File') {
			setFileValue(selectors, value);
		} else
		if (editorType === 'Json') {
			setJsonValue(selectors, value);
		} else {
			const editorFn = customFormFunctions.getCustomEditorSetFn(editorType);
			if (editorFn) {
				editorFn(selectors, value);
			}
		}
	});
}
function getFieldRoot(selectors) {
	return getDomNode(selectors).then(($field) => Cypress.$($field[0]));
}
function withFieldInput(selectors, cb) {
	return getFieldRoot(selectors).then(($root) => {
		const $input = $root.find('input, textarea').first();
		if (!$input.length) {
			throw new Error('No input found for selectors: ' + JSON.stringify(selectors));
		}
		return cb($input, $root);
	});
}
function normalizeEmptySetterValue(value) {
	return _.isNil(value) || value === '';
}
export function setArrayComboValue(selectors, value) {
	cy.log('setArrayComboValue ' + value);
	getDomNode([...selectors, 'input']).then((field) => {
		cy.wrap(field).clear({ force: true });
		if (value) {
			cy.wrap(field)
				.type(value, { delay: 40, force: true }) // slow it down a bit, so React has time to re-render
				.wait(1000) // allow time to load dropdown
				.type('{downarrow}')
				.wait(300)
				.type('{enter}')
				.wait(250); // allow time to register enter key
		}
	});
}
export function setComboValue(selectors, value) {
	cy.log('setComboValue ' + value);
	getFieldRoot(selectors).then(($root) => {
		const $input = $root.find('[data-testid="input"]').first();

		clickXButtonIfEnabled(selectors); // clear current value

		if (normalizeEmptySetterValue(value)) {
			return;
		}

		if (!$input.length) {
			throw new Error('setComboValue requires an editable Combo input; disableDirectEntry combos are not supported by this setter.');
		}

		cy.wrap($input)
			.type(value, { delay: 40, force: true }) // slow it down a bit, so React has time to re-render
			.wait('@getWaiter'); // allow dropdown to load

		cy.wrap($input)
			.wait(500)
			.type('{downarrow}')
			.wait(300)
			.type('{enter}')
			.wait(250); // allow time to register enter key
	});
}
export function setTagValue(selectors, value) {
	cy.log('setTagValue ' + value);
	let values = value;
	if (_.isString(values) && !_.isEmpty(values)) {
		values = JSON.parse(values);
	}
	if (_.isNil(values)) {
		values = [];
	}

	// Clear any previously selected tags
	function clickButtonsWithRemove(selector) {
		// This function allows Cypress to click on multiple elements in one command,
		// when clicking the elements removes them from the DOM.
		cy.get('body').then((body) => {
			if (body.find(selector).length === 0) {
				return;
			}
			cy.get(selector).eq(0)
				.click({ force: true })
				.then(() => {
					clickButtonsWithRemove(selector); // Recursive call for the next element
				});
		});
	}
	clickButtonsWithRemove(getTestIdSelectors([...selectors, 'xBtn']));

	if (_.isEmpty(values)) {
		return;
	}

	// Now add the new tags
	getDomNode([...selectors, 'input']).then((field) => {
		cy.wrap(field).clear({ force: true });
		_.each(values, (value) => {
			const id = _.isObject(value) ? value.id : value;
			cy.wrap(field)
				.type('id:' + id, { delay: 40, force: true }) // slow it down a bit, so React has time to re-render
				.wait('@getWaiter'); // allow dropdown to load
				
			cy.wrap(field)
				.wait(500)
				.type('{downarrow}')
				.wait(300)
				.type('{enter}')
				.wait(250); // allow time to register enter key
		});

		// press trigger to hide dropdown
		getDomNode([...selectors, 'trigger']).click({ force: true });
	});
}
export function setDateValue(selectors, value) {
	cy.log('setDateValue ' + value);
	withFieldInput(selectors, ($input) => {
		cy.wrap($input).clear({ force: true });
		if (!normalizeEmptySetterValue(value)) {
			cy.wrap($input)
				.type(value, { force: true })
				.type('{enter}');
		}
	});
}
export function setNumberValue(selectors, value) {
	cy.log('setNumberValue ' + value);
	withFieldInput(selectors, ($input) => {
		cy.wrap($input).clear({ force: true });
		if (!normalizeEmptySetterValue(value)) {
			cy.wrap($input)
				.type(String(value), { delay: 100, force: true })
				.type('{enter}');
		}
	});
}
export function setToggleValue(selectors, value) {
	cy.log('setToggleValue ' + value);
	getToggleValue(selectors).then((currentValue) => {
		if (_.isNil(value)) {
			if (_.isNil(currentValue)) {
				return;
			}
			getDomNode([...selectors, 'nullifyBtn']).click({ force: true, shiftKey: true });
			return;
		}

		const desired = !!value;

		if (_.isNil(currentValue)) {
			// Null-state uses the N/A button instead of a switch
			getDomNode([...selectors, 'naBtn']).click({ force: true });
			if (!desired) {
				getDomNode([...selectors, 'input[role="switch"]']).click({ force: true });
			}
			return;
		}

		if (currentValue !== desired) {
			getDomNode([...selectors, 'input[role="switch"]']).click({ force: true });
		}
	});
}
export function getToggleState(selectors) {
	cy.log('getToggleState');
	return getDomNode(selectors).then((node) => {
		if (!node.length) {
			return null;
		}
		return !!node[0].checked;
	});
}
export function clickToggle(selectors, options = {}) {
	cy.log('clickToggle');
	getDomNode(selectors).click(options);
}
export function setTextValue(selectors, value) {
	cy.log('setTextValue ' + value);
	withFieldInput(selectors, ($input) => {
		cy.wrap($input).clear({ force: true });
		if (!normalizeEmptySetterValue(value)) {
			cy.wrap($input)
				.type(String(value), { force: true })
				.type('{enter}');
		}
	});
}
export function setTextAreaValue(selectors, value) {
	cy.log('setTextAreaValue ' + value);
	withFieldInput(selectors, ($input) => {
		cy.wrap($input).clear({ force: true });
		if (!normalizeEmptySetterValue(value)) {
			cy.wrap($input)
				.type(String(value), { force: true });
		}
	});
}
export function setInputValue(selectors, value) {
	cy.log('setInputValue ' + value);
	setTextValue(selectors, value);
}
export function setDisplayValue(selectors, value) {
	cy.log('setDisplayValue (no-op)');
	// DisplayField/Text are read-only display components in the form context.
}
export function setHiddenValue(selectors, value) {
	cy.log('setHiddenValue ' + value);
	const serialized = normalizeEmptySetterValue(value) ? '' : String(value);
	return getDomNode(selectors)
		.invoke('val', serialized)
		.trigger('input', { force: true })
		.trigger('change', { force: true });
}
export function setColorValue(selectors, value) {
	cy.log('setColorValue ' + value);
	withFieldInput(selectors, ($input) => {
		cy.wrap($input).clear({ force: true });
		if (!normalizeEmptySetterValue(value)) {
			cy.wrap($input)
				.type(String(value), { force: true })
				.type('{enter}');
		}
	});
}
export function setSliderValue(selectors, value) {
	cy.log('setSliderValue ' + value);
	getDomNode([...selectors, 'readout']).then((field) => {
		cy.wrap(field).clear({ force: true });
		if (!normalizeEmptySetterValue(value)) {
			cy.wrap(field)
				.type(String(value), { force: true })
				.type('{enter}');
		}
	});
}
export function setCheckboxValue(selectors, value) {
	cy.log('setCheckboxValue ' + value);
	const desired = !!value;
	getCheckboxValue(selectors).then((currentValue) => {
		if (currentValue !== desired) {
			getDomNode(selectors).click({ force: true });
		}
	});
}
export function setCheckboxGroupValue(selectors, value) {
	cy.log('setCheckboxGroupValue ' + value);
	let values = value;
	if (_.isString(values)) {
		try {
			values = JSON.parse(values);
		} catch(e) {
			values = [values];
		}
	}
	if (_.isNil(values)) {
		values = [];
	}
	if (!_.isArray(values)) {
		values = [values];
	}
	const desiredValues = _.map(values, (v) => {
		if (_.isObject(v) && !_.isNil(v.id)) {
			return String(v.id);
		}
		return String(v);
	});

	getDomNode(selectors).then(($group) => {
		const $root = Cypress.$($group[0]);
		$root.find('[data-testid^="checkbox-"]').each((ix, el) => {
			const $checkbox = Cypress.$(el);
			const id = ($checkbox.attr('data-testid') || '').replace(/^checkbox-/, '');
			const shouldBeChecked = desiredValues.includes(id);
			const isChecked = getIsCheckedFromNode($checkbox);
			if (shouldBeChecked !== isChecked) {
				cy.wrap($checkbox).click({ force: true });
			}
		});
	});
}
export function setRadioValue(selectors, value) {
	cy.log('setRadioValue ' + value);
	if (_.isString(value) && value.match(/^\s*\[/)) {
		try {
			value = JSON.parse(value);
		} catch(e) {
			// leave as-is
		}
	}
	if (normalizeEmptySetterValue(value)) {
		return;
	}
	let desiredValue = _.isArray(value) ? value[0] : value;
	if (_.isObject(desiredValue) && !_.isNil(desiredValue.id)) {
		desiredValue = desiredValue.id;
	}
	const desiredValueStr = String(desiredValue);
	getDomNode(selectors).then(($group) => {
		const $root = Cypress.$($group[0]);
		let isFound = false;
		$root.find('[data-testid^="radio-"]').each((ix, el) => {
			const $radio = Cypress.$(el);
			const id = ($radio.attr('data-testid') || '').replace(/^radio-/, '');
			if (id === desiredValueStr) {
				isFound = true;
				cy.wrap($radio).click({ force: true });
				return false;
			}
		});

		if (!isFound) {
			throw new Error('Radio value not found: ' + desiredValueStr);
		}
	});
}
export function setFileValue(selectors, value) {
	cy.log('setFileValue');
	if (normalizeEmptySetterValue(value)) {
		getFieldRoot(selectors).then(($root) => {
			const $xBtn = $root.find('[data-testid="xBtn"]').first();
			if ($xBtn.length) {
				cy.wrap($xBtn).click({ force: true });
			}
		});
		return;
	}

	if (_.isObject(value) && !_.isArray(value)) {
		value = JSON.stringify(value);
	}
	getDomNode([...selectors, 'input']).then((field) => {
		cy.wrap(field).clear({ force: true });
		cy.wrap(field).type(String(value), {
			force: true,
			parseSpecialCharSequences: false,
		});
	});
}
export function setJsonValue(selectors, value) {
	cy.log('setJsonValue');
	if (_.isObject(value) && !_.isArray(value)) {
		value = JSON.stringify(value);
	}
	if (!_.isString(value) && !normalizeEmptySetterValue(value)) {
		value = JSON.stringify(value);
	}

	getDomNode([...selectors, 'input']).then((field) => {
		cy.wrap(field).clear({ force: true });
		if (!normalizeEmptySetterValue(value)) {
			cy.wrap(field).type(String(value), {
				force: true,
				parseSpecialCharSequences: false,
			});
		}
	});
}



//    ______     __  __
//   / ____/__  / /_/ /____  __________
//  / / __/ _ \/ __/ __/ _ \/ ___/ ___/
// / /_/ /  __/ /_/ /_/  __/ /  (__  )
// \____/\___/\__/\__/\___/_/  /____/

/**
 * Given a form element/jQuery form,
 * return a URL-encoded query-string of keys and values.
 *
 * @param {jQuery|HTMLFormElement} form
 * @return {string}
 */
export function formSerialize(form) {
	const theForm = form?.jquery ? form[0] : (form?.nodeName ? form : form?.[0]);
	if (!theForm || !theForm.nodeName || theForm.nodeName.toLowerCase() !== 'form') {
		throw new Error('You must supply a form element');
	}

	const q = [];
	const varCounters = {};

	const addNameValue = (name, value) => {
		const matches = name.match(/([\w\d]+)\[\]/i);
		if (matches?.[1]) {
			const varName = matches[1];
			let ix = 0;
			if (typeof varCounters[varName] === 'undefined') {
				varCounters[varName] = ix;
			} else {
				ix = ++varCounters[varName];
			}
			name = varName + '[' + ix + ']';
		}

		q.push(urlencode(String(name)) + '=' + urlencode(String(value)));
	};

	for (const formElement of theForm.elements) {
		if (formElement.name === '' || formElement.disabled) {
			continue;
		}

		switch (formElement.nodeName.toLowerCase()) {
			case 'input':
				switch (formElement.type) {
					case 'text':
					case 'hidden':
					case 'password':
					case 'email':
					case 'number':
					case 'date':
					case 'time':
					case 'datetime-local':
					case 'search':
					case 'url':
					case 'tel':
					case 'button':
					case 'submit':
						addNameValue(formElement.name, formElement.value);
						break;
					case 'checkbox':
					case 'radio':
						if (formElement.checked) {
							addNameValue(formElement.name, formElement.value);
						} else if (formElement.value === '1') {
							// Preserve legacy boolean behavior: unchecked "1" becomes "0".
							addNameValue(formElement.name, '0');
						}
						break;
					case 'file':
					case 'reset':
						break;
					default:
						addNameValue(formElement.name, formElement.value);
				}
				break;

			case 'textarea':
				addNameValue(formElement.name, formElement.value);
				break;

			case 'select':
				switch (formElement.type) {
					case 'select-one':
						addNameValue(formElement.name, formElement.value);
						break;
					case 'select-multiple':
						for (const option of formElement.options) {
							if (option.selected) {
								addNameValue(formElement.name, option.value);
							}
						}
						break;
					default:
						addNameValue(formElement.name, formElement.value);
				}
				break;

			case 'button':
				switch (formElement.type) {
					case 'reset':
					case 'submit':
					case 'button':
						addNameValue(formElement.name, formElement.value);
						break;
					default:
						break;
				}
				break;

			default:
				break;
		}
	}

	return q.join('&');
}
/**
 * Get data from a form asynchronously.
 * Returns a Cypress chainer yielding an object of fieldName/value pairs.
 * @param {Cypress.Chainable} editorSelector - The parent container selector
 * @param {object} schema - fieldName/fieldType pairs
 * @returns {Cypress.Chainable<object>} formValues
 */
export function getFormValues(editorSelector, schema) {
	cy.log('getFormValues from ' + editorSelector);
	const
		formValues = {},
		fieldNames = _.keys(schema);

	// We use an empty cy.then accumulator loop to build our values asynchronously
	return cy.then(() => {
		let chain = cy.wrap(formValues);

		_.each(fieldNames, (fieldName) => {
			const
				selectors = [editorSelector, 'field-' + fieldName],
				fieldType = schema[fieldName]?.model ? schema[fieldName].model.properties?.[fieldName]?.editorType?.type : schema[fieldName];

			// TODO: fieldType is certainly not right!

			chain = chain.then(() => {
				return getFieldValueByType(selectors, fieldType).then((value) => {
					formValues[fieldName] = value;
				});
			});
		});

		return chain.then(() => formValues);
	});
}
function getFieldValueByType(selectors, editorType) {
	if (editorType?.match(/Combo/)) {
		return getComboValue(selectors);
	}
	if (editorType?.match(/TreeSelector/)) {
		// Explicitly excluded by request.
		return getInputValue(selectors);
	}
	if (editorType?.match(/CKEditor/)) {
		// Explicitly excluded by request.
		return getInputValue(selectors);
	}
	if (editorType?.match(/Tag/)) {
		return getTagValue(selectors);
	}
	if (editorType === 'Color') {
		return getColorValue(selectors);
	}
	if (editorType === 'Date') {
		return getDateValue(selectors);
	}
	if (editorType === 'DisplayField') {
		return getDisplayFieldValue(selectors);
	}
	if (editorType === 'File') {
		return getFileValue(selectors);
	}
	if (editorType === 'Hidden') {
		return getHiddenValue(selectors);
	}
	if (editorType === 'Input') {
		return getInputValue(selectors);
	}
	if (editorType === 'Json') {
		return getJsonValue(selectors);
	}
	if (editorType === 'Number') {
		return getNumberValue(selectors);
	}
	if (editorType === 'Slider') {
		return getSliderValue(selectors);
	}
	if (editorType === 'Text') {
		return getDisplayTextValue(selectors);
	}
	if (editorType === 'TextArea') {
		return getTextAreaValue(selectors);
	}
	if (editorType === 'Toggle') {
		return getToggleValue(selectors);
	}
	if (editorType === 'Checkbox') {
		return getCheckboxValue(selectors);
	}
	if (editorType === 'CheckboxGroup') {
		return getCheckboxGroupValue(selectors);
	}
	if (editorType === 'ArrayCheckboxGroup') {
		return getArrayCheckboxGroupValue(selectors);
	}
	if (editorType === 'RadioGroup') {
		return getRadioGroupValue(selectors);
	}
	if (editorType === 'ArrayRadioGroup') {
		return getArrayRadioGroupValue(selectors);
	}
	
	// Fallback/Custom components
	return getInputValue(selectors);
}
export function getComboValue(selectors) {
	cy.log('getComboValue');
	return getDomNode(selectors).then(($comboField) => {
		const $root = Cypress.$($comboField[0]);

		// Default editable Combo path
		const $input = $root.find('[data-testid="input"]:first');
		if ($input.length) {
			const inputVal = $input.val();
			return inputVal === '' || _.isNil(inputVal) ? null : inputVal;
		}

		// disableDirectEntry web path (Pressable + TextNative)
		const $webToggleText = $root.find('[data-testid="toggleMenuBtn"]:first [data-testid="Combo-TextNative"]:first, [data-testid="toggleMenuBtn"]:first span:first, [data-testid="toggleMenuBtn"]:first p:first, [data-testid="toggleMenuBtn"]:first div:first');
		if ($webToggleText.length) {
			const toggleText = $webToggleText.text().trim();
			return toggleText === '' ? null : toggleText;
		}

		// disableDirectEntry native path (Pressable + TextNative)
		const $nativeShowMenuText = $root.find('[data-testid="showMenuBtn"]:first').first();
		if ($nativeShowMenuText.length) {
			const nativeText = $nativeShowMenuText.text().trim();
			return nativeText === '' ? null : nativeText;
		}

		return null;
	});
}
export function getTagValue(selectors) {
	cy.log('getTagValue');
	return getDomNode(selectors).then(($field) => {
		const $root = Cypress.$($field[0]);
		const $container = $root.find('[data-testid="valueBoxes"]:first, .Tag-valueBoxes-container:first').first();
		if (!$container.length) {
			return null;
		}

		const values = [];
		$container.find('.ValueBox-HStackNative').each((ix, el) => {
			const $box = Cypress.$(el);
			const rawId = $box.attr('data-tag-id');
			const rawText = $box.attr('data-tag-text');
			const text = _.isNil(rawText) ? $box.find('.ValueBox-Text:first').text().trim() : rawText;

			let id = null;
			if (!_.isNil(rawId) && rawId !== '') {
				const numericId = Number(rawId);
				id = Number.isNaN(numericId) ? rawId : numericId;
			}

			if (_.isNil(id) && _.isEmpty(text)) {
				return;
			}

			values.push({
				id,
				text,
			});
		});

		return values.length ? JSON.stringify(values) : null;
	});
}
function normalizeStringValue(value) {
	if (_.isNil(value)) {
		return null;
	}
	if (_.isString(value) && value === '') {
		return null;
	}
	return value;
}
function normalizeNumericValue(rawValue) {
	if (_.isNil(rawValue)) {
		return null;
	}
	if (_.isNumber(rawValue)) {
		return rawValue;
	}

	const raw = String(rawValue).trim();
	if (raw === '') {
		return null;
	}

	const numericValue = Number(raw);
	if (Number.isNaN(numericValue)) {
		throw new Error('Expected numeric value but got: ' + raw);
	}

	return numericValue;
}
function getIsCheckedFromNode($node) {
	const ariaChecked = $node.attr('aria-checked');
	if (ariaChecked === 'true') {
		return true;
	}
	if (ariaChecked === 'false') {
		return false;
	}

	const dataState = $node.attr('data-state');
	if (dataState === 'checked' || dataState === 'on' || dataState === 'true') {
		return true;
	}
	if (dataState === 'unchecked' || dataState === 'off' || dataState === 'false') {
		return false;
	}

	const $input = $node.find('input').first();
	if ($input.length) {
		return !!$input.prop('checked');
	}

	return false;
}
function parseIdFromTestId(testId, prefix) {
	if (!_.isString(testId) || !testId.startsWith(prefix)) {
		return null;
	}
	const raw = testId.slice(prefix.length);
	if (raw === '') {
		return null;
	}
	const numeric = Number(raw);
	return Number.isNaN(numeric) ? raw : numeric;
}
export function getInputValue(selectors) {
	cy.log('getInputValue');
	return getDomNode(selectors).then(($el) => {
		const value = Cypress.$($el[0]).val();
		return normalizeStringValue(value);
	});
}
export function getNumberValue(selectors) {
	cy.log('getNumberValue');
	return getInputValue(selectors).then((value) => {
		return normalizeNumericValue(value);
	});
}
export function getSliderValue(selectors) {
	cy.log('getSliderValue');
	return getDomNode([...selectors, 'readout']).then(($readout) => {
		const raw = Cypress.$($readout[0]).val();
		return normalizeNumericValue(raw);
	});
}
export function getDateValue(selectors) {
	cy.log('getDateValue');
	return getDomNode(selectors).then(($dateField) => {
		const $root = Cypress.$($dateField[0]);

		const directEntryVal = $root.val();
		if (!_.isNil(directEntryVal) && String(directEntryVal) !== '') {
			return directEntryVal;
		}

		const $toggleText = $root.find('[data-testid="togglePickerBtn"] .Date-TextNative:first, .Date-TextNative:first, [data-testid="togglePickerBtn"] span:first, [data-testid="togglePickerBtn"] p:first');
		if ($toggleText.length) {
			const txt = $toggleText.text().trim();
			return txt === '' ? null : txt;
		}

		return null;
	});
}
export function getColorValue(selectors) {
	cy.log('getColorValue');
	return getDomNode(selectors).then(($colorField) => {
		const $root = Cypress.$($colorField[0]);
		const raw = $root.val();
		if (!_.isNil(raw) && raw !== '') {
			return raw;
		}

		const $input = $root.find('input:first');
		if ($input.length) {
			const inputVal = $input.val();
			return normalizeStringValue(inputVal);
		}

		return null;
	});
}
export function getDisplayFieldValue(selectors) {
	cy.log('getDisplayFieldValue');
	return getDisplayTextValue(selectors);
}
export function getHiddenValue(selectors) {
	cy.log('getHiddenValue');
	return getDomNode(selectors)
		.invoke('val')
		.then((val) => normalizeStringValue(val));
}
export function getJsonValue(selectors) {
	cy.log('getJsonValue');
	return getDomNode(selectors).then(($jsonField) => {
		const $root = Cypress.$($jsonField[0]);
		const attrValue = $root.attr('data-json-value');
		if (!_.isNil(attrValue)) {
			return normalizeStringValue(attrValue);
		}

		return null;
	});
}
export function getFileValue(selectors) {
	cy.log('getFileValue');
	return getDomNode(selectors).then(($fileField) => {
		const $root = Cypress.$($fileField[0]);
		const attrValue = $root.attr('data-file-value');
		if (!_.isNil(attrValue)) {
			return normalizeStringValue(attrValue);
		}

		const $fileInput = $root.find('input[type="file"]:first');
		if ($fileInput.length && $fileInput[0]?.files?.length) {
			return $fileInput[0].files[0].name || null;
		}

		return null;
	});
}
export function getCheckboxValue(selectors) {
	cy.log('getCheckboxValue');
	return getDomNode(selectors).then(($checkboxField) => {
		const $root = Cypress.$($checkboxField[0]);

		const attrChecked = $root.attr('data-checked');
		if (attrChecked === 'true') {
			return true;
		}
		if (attrChecked === 'false') {
			return false;
		}

		return getIsCheckedFromNode($root);
	});
}
export function getCheckboxGroupValue(selectors) {
	cy.log('getCheckboxGroupValue');
	return getDomNode(selectors).then(($checkboxGroup) => {
		const $root = Cypress.$($checkboxGroup[0]);
		const values = [];

		$root.find('[data-testid^="checkbox-"]').each((ix, el) => {
			const $checkbox = Cypress.$(el);
			if (!getIsCheckedFromNode($checkbox)) {
				return;
			}

			const testId = $checkbox.attr('data-testid');
			const id = parseIdFromTestId(testId, 'checkbox-');
			if (!_.isNil(id)) {
				values.push(id);
			}
		});

		if (!values.length) {
			return null;
		}

		const sortFn = natsort.default || natsort;
		values.sort(sortFn());
		return values;
	});
}
export function getArrayCheckboxGroupValue(selectors) {
	cy.log('getArrayCheckboxGroupValue');
	return getCheckboxGroupValue(selectors).then((values) => {
		if (_.isNil(values)) {
			return null;
		}
		return JSON.stringify(values);
	});
}
export function getRadioGroupValue(selectors) {
	cy.log('getRadioGroupValue');
	return getDomNode(selectors).then(($radioGroup) => {
		const $root = Cypress.$($radioGroup[0]);
		let selected = null;

		$root.find('[data-testid^="radio-"]').each((ix, el) => {
			if (!_.isNil(selected)) {
				return;
			}
			const $radio = Cypress.$(el);
			if (!getIsCheckedFromNode($radio)) {
				return;
			}

			const testId = $radio.attr('data-testid');
			selected = parseIdFromTestId(testId, 'radio-');
		});

		return selected;
	});
}
export function getArrayRadioGroupValue(selectors) {
	cy.log('getArrayRadioGroupValue');
	return getRadioGroupValue(selectors).then((value) => {
		if (_.isNil(value)) {
			return null;
		}
		return JSON.stringify([value]);
	});
}
export function getDisplayTextValue(selectors) {
	cy.log('getDisplayTextValue');
	return getDomNode(selectors).then(($el) => {
		const text = Cypress.$($el[0]).text().trim();
		return text === '' ? null : text;
	});
}
export function getTextAreaValue(selectors) {
	cy.log('getTextAreaValue');
	return getInputValue(selectors);
}
export function getTextValue(selectors) {
	cy.log('getTextValue');
	return getInputValue(selectors);
}
export function getToggleValue(selectors) {
	cy.log('getToggleValue');
	return getDomNode(selectors).then(($toggleField) => {
		const $root = Cypress.$($toggleField[0]);

		const attrValue = $root.attr('data-toggle-value');
		if (attrValue === 'null') {
			return null;
		}
		if (attrValue === 'true') {
			return true;
		}
		if (attrValue === 'false') {
			return false;
		}

		const $switchInput = $root.find('input[role="switch"]:first, [role="switch"] input:first, [role="switch"]:first');
		if (!$switchInput.length) {
			return null;
		}

		const checked = Cypress.$($switchInput[0]).prop('checked');
		return _.isNil(checked) ? null : !!checked;
	});
}
