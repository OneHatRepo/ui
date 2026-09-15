import oneHatData from '@onehat/data';
import { getUserToken, setRepositoryAuthHeaders } from '@onehat/ui/src/Functions/authFunctions.js';
import allSchemas from '@src/Models/Schemas/AllSchemas.js';
import LocalStorage from '@onehat/data/src/Integration/Browser/Repository/LocalStorage.js';
import SecureLocalStorage from '@onehat/data/src/Integration/Browser/Repository/SecureLocalStorage.js';
import SessionStorage from '@onehat/data/src/Integration/Browser/Repository/SessionStorage.js';

const
	CYPRESS_AUTH_CACHE_KEY = '__onehatDataAuthContext',
	CYPRESS_DATA_READY_KEY = '__onehatDataReady';

let initializePromise = null;

function resolveApiBaseUrl() {

	const locationHostname = window.location.hostname;
	if (locationHostname.match(/localhost|127|192/)) {
		// const localDir = Cypress.expose('localDir');
		// return `${window.location.protocol}//${locationHostname}/${localDir}`;
		return Cypress.expose('localApiBaseUrl');
	}

	const
		locationSubdomainMatch = Cypress.expose('locationSubdomainMatch'),
		subdomain = locationHostname.match(locationSubdomainMatch)[1];
	if (subdomain) {
		const template = Cypress.expose('externalBaseUrlTemplate');
		return template.replace('{subdomain}', subdomain);
	}

	throw new Error(`Unable to infer oneHat API base URL from host "${locationHostname}".`);

}

export function getLoginParams(username) {

	const
		loginIdField = Cypress.expose('loginIdField'),
		envKeys = ['loginId', 'password'],
		hasUsername = typeof username === 'string' && username.trim().length > 0;

	if (hasUsername) {
		envKeys.unshift(username);
	}

	return cy.env(envKeys).then((secrets) => {
		const
			user = hasUsername ? secrets[username] : undefined,
			loginId = user?.loginId || secrets.loginId,
			password = user?.password || secrets.password;

		if (!loginId || !password) {
			throw new Error('Missing Cypress auth credentials. Set env.loginId/env.password.');
		}

		return {
			loginIdField,
			loginId,
			password,
		};
	});
}

function initializeOneHatData() {
	if (window[CYPRESS_DATA_READY_KEY]) {
		return Promise.resolve(window[CYPRESS_AUTH_CACHE_KEY]);
	}

	const apiBaseUrl = resolveApiBaseUrl();

	oneHatData
		.setRepositoryGlobals({
			debugMode: false,
			api: {
				baseURL: apiBaseUrl,
			},
			timeout: 15000,
			useLongTimers: false,
			retryRate: '+30 seconds',
			passphrase: '_ROeu7I7OV6+dH<w`^/5SOsB',
			headers: {},
		})
		.registerRepositoryTypes([
			LocalStorage,
			SessionStorage,
			SecureLocalStorage,
		]);

	oneHatData.createSchemas(Object.values(allSchemas));

	return oneHatData.createBoundRepositories().then(() => {
		const Users = oneHatData.getRepository('Users');

		return getLoginParams().then(({ loginIdField, loginId, password }) => {
			return Users.login({
				[loginIdField]: loginId,
				password,
			}).then((loginResult) => {
				const token = getUserToken(loginResult?.user || loginResult);
				if (!token) {
					throw new Error('Login succeeded but no auth token was returned.');
				}

				setRepositoryAuthHeaders(token);

				const authContext = {
					loginId,
					token,
					apiBaseUrl,
				};

				window[CYPRESS_AUTH_CACHE_KEY] = authContext;
				window[CYPRESS_DATA_READY_KEY] = true;

				return authContext;
			});
		});
	});
}

export function ensureOneHatDataReady() {
	if (!initializePromise) {
		initializePromise = initializeOneHatData();
	}
	return initializePromise;
}

export function getOneHatDataAuthContext() {
	return window[CYPRESS_AUTH_CACHE_KEY] || null;
}
