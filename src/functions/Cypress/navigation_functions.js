import {
	getDomNode,
	getDomNodes,
} from './dom_functions.js';


//     __                _
//    / /   ____  ____ _(_)___
//   / /   / __ \/ __ `/ / __ \
//  / /___/ /_/ / /_/ / / / / /
// /_____/\____/\__, /_/_/ /_/
//             /____/

export function login(loginId = null, password = null) {
	cy.log('login');
	if (!loginId) {
		loginId = Cypress.env('loginId');
	}
	if (!password) {
		password = Cypress.env('password');
	}
	const
		baseUrl = Cypress.env('baseUrl'),
		baseDir = Cypress.env('baseDir');
	cy.visit(baseUrl + baseDir + 'login')
		.then(() => {
			getDomNode('loginId', { timeout: 10000 }).clear();
			getDomNode('loginId').type(loginId);

			getDomNode('password').clear();
			getDomNode('password').type(password);
			
			getDomNode('loginBtn').click();
			cy.url().should('include', 'home');
		});
}
export function logout() {
	cy.log('logout');
	const baseDir = Cypress.env('baseDir');
	getDomNode(baseDir + 'logout').click({ force: true });
}


//     _   __            _             __  _
//    / | / /___ __   __(_)___ _____ _/ /_(_)___  ____
//   /  |/ / __ `/ | / / / __ `/ __ `/ __/ / __ \/ __ \
//  / /|  / /_/ /| |/ / / /_/ / /_/ / /_/ / /_/ / / / /
// /_/ |_/\__,_/ |___/_/\__, /\__,_/\__/_/\____/_/ /_/
//                     /____/

export function navigateViaTabOrHomeButtonTo(url) {
	cy.log('navigateViaTabOrHomeButtonTo ' + url);
	// i.e. If we're on home screen, press the button.
	// If we have a tab navigation, press the tab's button
	const baseDir = Cypress.env('baseDir');
	getDomNode(baseDir + url).click(); // i.e. the DomNode's data-testid is the url
	cy.url().should('include', url);
}
export function navigateToHome() {
	cy.log('navigateToHome');
	navigateToScreen('home');
}
export function navigateToScreen(path) {
	cy.log('navigateToScreen ' + path);
	const
		baseUrl = Cypress.env('baseUrl'),
		baseDir = Cypress.env('baseDir');
	cy.visit(baseUrl + baseDir + path)
		.then(() => {
			cy.url().should('include', path);
		});
}
// export function selectMainTab(name) {
// 	cy.get('.mainTabPanel .x-tab')
// 		.contains(name)
// 		.first()
// 		.click();
// 	cy.wait(1000); // Time to render new tab
// }
// export function selectSecondaryTab(name) {
// 	cy.get('.mainTabPanel > .x-panel-bodyWrap > .x-panel-body .x-tab')
// 		.contains(name)
// 		.first()
// 		.click();
// 	cy.wait(1000); // Time to render new tab
// }
