
/**
 * Get the first DOM node matching the nested selectors.
 * (Note: it gets the first matching element from each selector, not just the last one.)
 * @argument {string | string[]} selectors - data-testid attribute values
 * If an array is given, these will be considered nested selectors.
 * e.g. ['parent', 'child'] will be converted to '[data-testid="parent"] [data-testid="child"]'
 * @return Cypress chainer
 */
export function getDomNode(selectors, options = {}) {
	let useFirst;
	if (options?.hasOwnProperty('first')) {
		useFirst = options.first;
		delete options.first;
	} else {
		useFirst = true;
	}
	return cy.get(getTestIdSelectors(selectors, useFirst), options);
}

/**
 * Get *all* DOM nodes matching the nested selectors.
 * @argument {string | string[]} selectors - data-testid attribute values
 * If an array is given, these will be considered nested selectors.
 * e.g. ['parent', 'child'] will be converted to '[data-testid="parent"] [data-testid="child"]'
 * @return Cypress chainer
 */
export function getDomNodes(selectors, options = {}) {
	return cy.get(getTestIdSelectors(selectors), options);
}

/**
 * Verifies that an element with the given selectors does not exist in the DOM.
 * @argument {string | string[]} selectors - data-testid attribute values
 * If an array is given, these will be considered nested selectors.
 * e.g. ['parent', 'child'] will be converted to '[data-testid="parent"] [data-testid="child"]'
 */
export function verifyElementDoesNotExist(selectors) {
	cy.get('body').then(($body) => {
		const selectorString = getTestIdSelectors(selectors);
		if ($body.find(selectorString).length > 0) {
			throw new Error(`Element with selectors ${selectorString} exists in the DOM, when it should not`);
		}
	});
}

/**
 * Verifies that an element with the given selectors exists in the DOM.
 * @argument {string | string[]} selectors - data-testid attribute values
 * If an array is given, these will be considered nested selectors.
 * e.g. ['parent', 'child'] will be converted to '[data-testid="parent"] [data-testid="child"]'
 */
export function verifyElementExists(selectors) {
	cy.get(getTestIdSelectors(selectors)).should('exist');
}

/**
 * Builds selector string for data-testid attributes.
 * It leaves classname, id, and attribute selectors unchanged.
 * 
 * If selectors is an array, these will be considered nested selectors.
 * e.g. ['parent', 'child'] will be converted to '[data-testid="parent"] [data-testid="child"]'
 * @argument {string|string[]} selectors - data-testid attribute values
 * @return {string}
 */
export function getTestIdSelectors(selectors, isGetFirst = false) {
	if (_.isString(selectors)) {
		selectors = [selectors];
	}
	const selectorParts = _.map(selectors, (selector) => {
		if (!selector.match(/^\./) // className, like .my-class
			&& !selector.match(/^#/) // id, like @my-id
			&& !selector.match(/=/) // attribute, like [role="switch"]
		){
			selector = '[data-testid="' + selector + '"]';
		}
		if (isGetFirst) {
			selector += ':first';
		}
		return selector;
	});
	return selectorParts.join(' ');
}

export function drag(draggableSelectors, droppableSelectors, options = {}) {
	if (typeof options.force === 'undefined') {
		options.force = true;
	}

	// getDomNode(getTestIdSelectors(droppableSelectors)).then((node) => {
	// 	const selectors = getTestIdSelectors(droppableSelectors);
	// 	debugger;
	// });

	options = {
		source: { // applies to the element being dragged
			x: 10,
			// y: 100,
			position: 'left',
		},
		target: { // applies to the drop target
			position: 'left',
			x: 20,
		},
		force: true, // applied to both the source and target element
	};


	return getDomNode(draggableSelectors)
			.drag(getTestIdSelectors(droppableSelectors), options)
			.then((success) => {
				debugger;
			});
}


// conditions functions that make use of cypress-if
export function ifExists(parentSelectors, name, cb) {
	if (_.isString(parentSelectors)) {
		parentSelectors = [parentSelectors];
	}
	return getDomNode([...parentSelectors, name]).if().then((node) => {
		if (node) {
			cb(node);
		}
	});
}
export function ifNotExists(parentSelectors, name, cb) {
	if (_.isString(parentSelectors)) {
		parentSelectors = [parentSelectors];
	}
	return getDomNode([...parentSelectors, name]).if('not.exist').then(cb);
}
