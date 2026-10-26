import {
	getDomNode,
	getDomNodes,
} from './dom_functions.js';


export function markForPageReload() {
	cy.log('markForPageReload');
	// See https://github.com/cypress-io/cypress/issues/1805#issuecomment-525482440
	cy.window()
		.then((win) => {
			win.beforeReload = true;
		});
}
export function waitForPageReload() {
	cy.log('waitForPageReload');
	// See https://github.com/cypress-io/cypress/issues/1805#issuecomment-525482440
	cy.window({ timeout: 30000 })
		.should('not.have.prop', 'beforeReload');
}
export function waitForNavigationTo(url) {
	cy.log('waitForNavigationTo ' + url);
	return cy.location('pathname', { timeout: 30000 })
		.should('include', url);
}


export function minimizeHeader(selectors) {
	cy.log('minimize the Header');
	return getDomNodes(selectors)
		.then(($nodes) => {
			// Multiple matching collapse buttons can exist during re-renders/transitions.
			// Act only on the currently visible one to match real user behavior.
			const $node = $nodes.filter(':visible').first();
			if (!$node.length) {
				throw new Error('minimizeHeader: no visible node found for selectors ' + JSON.stringify(selectors));
			}

			if ($node.attr('data-is-collapsed') === 'false') {
				cy.wrap($node).click();
				return getDomNodes(selectors).then(($updatedNodes) => {
					// Re-query after click because the original node may be replaced in the DOM.
					// We only pass when a visible matching button now reports collapsed=true.
					const hasCollapsedVisible = $updatedNodes.toArray().some((node) => {
						const $updatedNode = Cypress.$(node);
						return $updatedNode.is(':visible') && $updatedNode.attr('data-is-collapsed') === 'true';
					});
					expect(hasCollapsedVisible).to.eq(true);
				});
			}
		});
}
export function maximizeHeader(selectors) {
	cy.log('maximize the Header');
	return getDomNodes(selectors)
		.then(($nodes) => {
			// Multiple matching collapse buttons can exist during re-renders/transitions.
			// Act only on the currently visible one to match real user behavior.
			const $node = $nodes.filter(':visible').first();
			if (!$node.length) {
				throw new Error('maximizeHeader: no visible node found for selectors ' + JSON.stringify(selectors));
			}

			if ($node.attr('data-is-collapsed') === 'true') {
				cy.wrap($node).click();
				return getDomNodes(selectors).then(($updatedNodes) => {
					// Re-query after click because the original node may be replaced in the DOM.
					// We only pass when a visible matching button now reports collapsed=false.
					const hasExpandedVisible = $updatedNodes.toArray().some((node) => {
						const $updatedNode = Cypress.$(node);
						return $updatedNode.is(':visible') && $updatedNode.attr('data-is-collapsed') === 'false';
					});
					expect(hasExpandedVisible).to.eq(true);
				});
			}
		});
}




//     __  ___                                ____
//    /  |/  /__  ______________ _____ ____  / __ )____  _  __
//   / /|_/ / _ \/ ___/ ___/ __ `/ __ `/ _ \/ __  / __ \| |/_/
//  / /  / /  __(__  |__  ) /_/ / /_/ /  __/ /_/ / /_/ />  <
// /_/  /_/\___/____/____/\__,_/\__, /\___/_____/\____/_/|_|
//                             /____/
export function clickMessageBoxDefaultButton() {
	cy.log('clickMessageBoxDefaultButton');
	getDomNode(['AlertModal', 'okBtn'])
		.click();
}
export function verifyNoErrorBox() {
	cy.log('verifyNoErrorBox');
	getDomNode('ErrorMessage', { timeout: 1000 })
		.should('not.exist', 'Error dialogue popped up.');
}



// export function verifyNoErrorMessage() {
// 	// cy.wait(1000);
// 	cy.get('input[data-testid="ErrorMessage"]').should('not.exist');
// }

// export function checkForErrors() {
// 	cy.get('html')
// 		.first()
// 		.then((el) => {
// 			const result = hasError(el[0].innerHTML);
// 			expect(result).to.eq(false, 'Page has errors!' + (result && result.title));
// 		});
// }

// // Helpers for checkForErrors()
// function hasError(html) {
// 	return hasNotice(html) || hasWarning(html) || hasException(html);
// }
// function hasNotice(html) {
// 	const result = /<b>Notice<\/b> \(/is.test(html);
// 	if (result) {
// 		// Try to determine error message
// 		const re = /<b>Notice<\/b> \([\d]+\)<\/a>: ([^\[]+)\[([^\]]+)\]/is,
// 			result2 = html.match(re);
// 		return {
// 			title: result2[1],
// 			line: result2[2],
// 		};
// 	}
// 	return false;
// }
// function hasWarning(html) {
// 	const result = /<b>Warning<\/b> \(/is.test(html);
// 	if (result) {
// 		// Try to determine error message
// 		const re = /<b>Warning<\/b> \([\d]+\)<\/a>: ([^\[]+)\[([^\]]+)\]/is,
// 			result2 = html.match(re);
// 		return {
// 			title: result2[1],
// 			line: result2[2],
// 		};
// 	}
// 	return false;
// }
// function hasException(html) {
// 	let result = /An Internal Error Has Occurred/is.test(html); // 'debug' mode is off
// 	if (result) {
// 		return {
// 			title: 'An Internal Error Has Occurred',
// 			line: null,
// 		};
// 	}

// 	result = /Exception/ism.test(html) && /stack-trace/is.test(html); // 'debug' mode is on
// 	if (result) {
// 		// Try to determine error message
// 		const re = /<h1 class="header-title">(.*)<\/h1>/is, // this is from DebugKit
// 			result2 = html.match(re);
// 		return {
// 			title: result2[1],
// 			line: result2[2],
// 		};
// 	}
	
// 	return false;
// }
