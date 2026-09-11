import {
	getDomNode,
	getDomNodes,
} from './dom_functions.js';

const
	baseUrl = Cypress.expose('baseUrl'),
	baseDir = Cypress.expose('baseDir') || ''; 

//     __                _
//    / /   ____  ____ _(_)___
//   / /   / __ \/ __ `/ / __ \
//  / /___/ /_/ / /_/ / / / / /
// /_____/\____/\__, /_/_/ /_/
//             /____/

export function login(loginId = null, password = null) {
	cy.log('login');
	
	// Fetch non-sensitive configuration synchronously

	// Fetch sensitive credentials asynchronously via an array
	cy.env(['loginId', 'password']).then((secrets) => {
		const
			finalLoginId = loginId || secrets.loginId,
			finalPassword = password || secrets.password;

		cy.visit(baseUrl + baseDir + 'login').then(() => {
			getDomNode('loginId', { timeout: 30000 }).clear();
			getDomNode('loginId').type(finalLoginId);

			getDomNode('password').clear();
			getDomNode('password').type(finalPassword);
			
			getDomNode('loginBtn').click();
			cy.url().should('not.eq', baseUrl + baseDir + 'login');
		});
	});
}
export function logout() {
	cy.log('logout');
	const baseDir = Cypress.expose('baseDir') || ''; 
	getDomNode('userIndicator').click({ force: true });

	cy.url().should('include', baseUrl + baseDir + 'login');
}


//     _   __            _             __  _
//    / | / /___ __   __(_)___ _____ _/ /_(_)___  ____
//   /  |/ / __ `/ | / / / __ `/ __ `/ __/ / __ \/ __ \
//  / /|  / /_/ /| |/ / / /_/ / /_/ / /_/ / /_/ / / / /
// /_/ |_/\__,_/ |___/_/\__, /\__,_/\__/_/\____/_/ /_/
//                     /____/

export function navigateViaTabOrHomeButtonTo(url, isSetup = false) {
	cy.log('navigateViaTabOrHomeButtonTo ' + url);

	// deal with setup mode (if needed)
	getDomNode('setupBtn', { timeout: 10000 }).then(($btn) => {
		if (!$btn.length) {
			cy.log('setupBtn not found');
			return;
		}

		// Check the current value of the custom HTML attribute
		const isInSetupMode = $btn.attr('data-setup-mode') === 'true';

		if (isSetup !== isInSetupMode) {
			cy.log('clicking setupBtn');

			// we're in the wrong UI mode. Click the button to toggle it
			cy.get('[data-testid="setupBtn"]').first().click({ force: true });
			
			// Assert and wait until the attribute updates
			cy.get('[data-testid="setupBtn"]', { timeout: 10000 })
				.first()
				.should('have.attr', 'data-setup-mode', (isSetup ? 'true' : 'false'));

			cy.log('setupBtn attribute is correct');
		}
	});

	cy.log('about to click button for: ' + baseDir + url);
	getDomNode('to:/' + baseDir + url).click({ force: true, });
	cy.url().should('include', url);
}
export function navigateToHome() {
	cy.log('navigateToHome');
	navigateToScreen('home');
}
export function navigateToScreen(path) {
	cy.log('navigateToScreen ' + path);
	
	cy.visit(baseUrl + baseDir + path).then(() => {
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
