import oneHatData from '@onehat/data';
import {
	getUserToken,
	setRepositoryAuthHeaders,
	getRepositoryAuthHeaders,
} from '@onehat/ui/src/Functions/authFunctions.js';
import allSchemas from '@src/Models/Schemas/AllSchemas.js';
import LocalStorage from '@onehat/data/src/Integration/Browser/Repository/LocalStorage.js';
import SecureLocalStorage from '@onehat/data/src/Integration/Browser/Repository/SecureLocalStorage.js';
import SessionStorage from '@onehat/data/src/Integration/Browser/Repository/SessionStorage.js';

const
	CYPRESS_AUTH_CACHE_KEY = '__onehatDataAuthContext',
	CYPRESS_DATA_READY_KEY = '__onehatDataReady';

let initializePromise = null;

function getAllSchemaMap(options = {}) {
	if (options.schemaMap && typeof options.schemaMap === 'object') {
		if (options.schemaMap?.default && typeof options.schemaMap.default === 'object') {
			return options.schemaMap.default;
		}
		return options.schemaMap;
	}

	if (allSchemas?.default && typeof allSchemas.default === 'object') {
		return allSchemas.default;
	}
	return allSchemas;
}

function getAllSchemaDefinitions(options = {}) {
	if (Array.isArray(options.schemaDefinitions) && options.schemaDefinitions.length) {
		return options.schemaDefinitions;
	}

	return Object.values(getAllSchemaMap(options) || {});
}

function resolveOneHatData(options = {}) {
	return options.oneHatDataInstance || oneHatData;
}

function applyAuthHeadersToOneHatData(ohd, token) {
	const headers = getRepositoryAuthHeaders(token);

	// Keep existing shared behavior and also apply to the explicit runtime instance.
	setRepositoryAuthHeaders(token);
	ohd.setOptionsOnAllRepositories({ headers });
	ohd.setRepositoryGlobals({ headers });

	return headers;
}

function isRuntimeReady(ohd, options = {}) {
	const schemaDefinitions = getAllSchemaDefinitions(options);

	for (const schemaDefinition of schemaDefinitions) {
		const schemaName = schemaDefinition?.name;
		if (!schemaName) {
			continue;
		}

		const schema = ohd.getSchema(schemaName);
		if (!schema?.getBoundRepository?.()) {
			return false;
		}
	}

	return true;
}

function ensureSchemasExist(ohd, options = {}) {
	const schemaDefinitions = getAllSchemaDefinitions(options);

	for (const schemaDefinition of schemaDefinitions) {
		const schemaName = schemaDefinition?.name;
		if (!schemaName || ohd.getSchema(schemaName)) {
			continue;
		}

		ohd.createSchema(schemaDefinition.clone ? schemaDefinition.clone() : schemaDefinition);
	}
}

async function ensureAllSchemaRepositoriesReady(ohd, options = {}) {
	const schemaDefinitions = getAllSchemaDefinitions(options);

	for (const schemaDefinition of schemaDefinitions) {
		if (!schemaDefinition?.name) {
			continue;
		}

		let schema = ohd.getSchema(schemaDefinition.name);
		if (!schema) {
			ohd.createSchema(schemaDefinition.clone ? schemaDefinition.clone() : schemaDefinition);
			schema = ohd.getSchema(schemaDefinition.name);
		}

		if (!schema?.getBoundRepository?.()) {
			await ohd.createRepository({ schema }, true);
		}
	}
}

function resolveRequiredSchemaDefinitions(options = {}) {
	const requiredSchemaDefinitions = [];
	const requiredSchemaNames = options.requiredSchemaNames || [];
	const requiredSchemas = options.requiredSchemas || [];

	for (const schemaDefinition of requiredSchemas) {
		if (!schemaDefinition?.name) {
			continue;
		}
		requiredSchemaDefinitions.push(schemaDefinition);
	}

	for (const schemaName of requiredSchemaNames) {
		if (!schemaName || requiredSchemaDefinitions.find((item) => item.name === schemaName)) {
			continue;
		}

		const schemaDefinition = getAllSchemaMap(options)[schemaName];
		if (!schemaDefinition) {
			throw new Error(`Missing schema definition for required schema "${schemaName}".`);
		}

		requiredSchemaDefinitions.push(schemaDefinition);
	}

	return requiredSchemaDefinitions;
}

async function ensureRequiredRepositoriesReady(options = {}) {
	const ohd = resolveOneHatData(options);
	const requiredSchemaDefinitions = resolveRequiredSchemaDefinitions(options);

	for (const schemaDefinition of requiredSchemaDefinitions) {
		let schema = ohd.getSchema(schemaDefinition.name);

		if (!schema) {
			ohd.createSchema(schemaDefinition.clone ? schemaDefinition.clone() : schemaDefinition);
			schema = ohd.getSchema(schemaDefinition.name);
		}

		if (!schema?.getBoundRepository?.()) {
			await ohd.createRepository({ schema }, true);
		}
	}
}

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
		hasUsername = typeof username === 'string' && username.trim().length > 0,
		envKeys = ['loginId', 'password', 'superLoginId', 'superPassword'];

	if (hasUsername) {
		envKeys.unshift(username);
	}

	return cy.env(envKeys).then((secrets) => {
		const
			user = hasUsername ? secrets[username] : undefined,
			loginId = user?.loginId || secrets.superLoginId || secrets.loginId,
			password = user?.password || secrets.superPassword || secrets.password;

		if (!loginId || !password) {
			throw new Error('Missing Cypress auth credentials. Set env.loginId/env.password or env.superLoginId/env.superPassword.');
		}

		return {
			loginIdField,
			loginId,
			password,
		};
	});
}

function initializeOneHatData(options = {}) {
	const ohd = resolveOneHatData(options);

	if (window[CYPRESS_DATA_READY_KEY] && isRuntimeReady(ohd, options)) {
		return Promise.resolve(window[CYPRESS_AUTH_CACHE_KEY]);
	}

	if (window[CYPRESS_DATA_READY_KEY] && !isRuntimeReady(ohd, options)) {
		window[CYPRESS_DATA_READY_KEY] = false;
		window[CYPRESS_AUTH_CACHE_KEY] = null;
	}

	const apiBaseUrl = resolveApiBaseUrl();

	ohd
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

	ensureSchemasExist(ohd, options);

	return ohd.createBoundRepositories().then(async () => {
		await ensureAllSchemaRepositoriesReady(ohd, options);

		const Users = ohd.getRepository('Users');

		return getLoginParams().then(({ loginIdField, loginId, password }) => {
			return Users.login({
				[loginIdField]: loginId,
				password,
			}).then((loginResult) => {
				const token = getUserToken(loginResult?.user || loginResult);
				if (!token) {
					throw new Error('Login succeeded but no auth token was returned.');
				}

				applyAuthHeadersToOneHatData(ohd, token);

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

export function ensureOneHatDataReady(options = {}) {
	const ohd = resolveOneHatData(options);

	if (window[CYPRESS_DATA_READY_KEY] && !isRuntimeReady(ohd, options)) {
		window[CYPRESS_DATA_READY_KEY] = false;
		window[CYPRESS_AUTH_CACHE_KEY] = null;
		initializePromise = null;
	}

	if (!initializePromise) {
		initializePromise = initializeOneHatData(options).catch((error) => {
			initializePromise = null;
			throw error;
		});
	}

	return initializePromise.then(async (authContext) => {
		await ensureAllSchemaRepositoriesReady(ohd, options);
		await ensureRequiredRepositoriesReady(options);
		return authContext;
	});
}

export function getOneHatDataAuthContext() {
	return window[CYPRESS_AUTH_CACHE_KEY] || null;
}

export async function resetOneHatDataRuntime(options = {}) {
	const ohd = resolveOneHatData(options);
	const clearStorage = options.clearStorage === true;

	initializePromise = null;
	window[CYPRESS_AUTH_CACHE_KEY] = null;
	window[CYPRESS_DATA_READY_KEY] = false;

	if (clearStorage) {
		const repositories = Object.values(ohd.getAllRepositories());
		for (const repository of repositories) {
			if (repository?.clearAll) {
				await repository.clearAll();
			}
		}
	}

	await ohd.destroyBoundRepositories();

	return true;
}
