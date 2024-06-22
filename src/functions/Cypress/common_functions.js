import {
	getDomNode,
	getDomNodes,
} from './dom_functions';


export function markForPageReload() {
	// See https://github.com/cypress-io/cypress/issues/1805#issuecomment-525482440
	cy.window()
		.then((win) => {
			win.beforeReload = true;
		});
}
export function waitForPageReload() {
	// See https://github.com/cypress-io/cypress/issues/1805#issuecomment-525482440
	cy.window({ timeout: 30000 })
		.should('not.have.prop', 'beforeReload');
}
export function waitForNavigationTo(url) {
	return cy.location('pathname', { timeout: 30000 })
		.should('include', url);
}



//     __  ___                                ____
//    /  |/  /__  ______________ _____ ____  / __ )____  _  __
//   / /|_/ / _ \/ ___/ ___/ __ `/ __ `/ _ \/ __  / __ \| |/_/
//  / /  / /  __(__  |__  ) /_/ / /_/ /  __/ /_/ / /_/ />  <
// /_/  /_/\___/____/____/\__,_/\__, /\___/_____/\____/_/|_|
//                             /____/
export function clickMessageBoxDefaultButton() {
	getDomNode(['AlertDialogue', 'okBtn'])
		.click();
}
export function verifyNoErrorBox() {
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
