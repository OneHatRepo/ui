import UiGlobals from '../UiGlobals.js';
import oneHatData from '@onehat/data';


/**
 * getTokenHeaders
 * 
 * Main entry point for building an Authentication header object.
 * If `clearAll` is true, returns a header with Authentication: null to wipe the token (e.g. on logout).
 * Accepts an optional `user` arg (a plain object or @onehat/data Entity); falls back to Redux state if omitted.
 * 
 * @param {boolean} [clearAll=false] - When true, returns a header that clears the token (Authentication: null).
 * @param {object|null} [user=null] - A plain user object or @onehat/data Entity. Falls back to Redux state if null.
 * @returns {object} Header object with an `Authentication` key.
 */
export default function getTokenHeaders(clearAll = false, user = null) {
	if (clearAll) {
		return getRepositoryAuthHeaders(null);
	}

	const
		reduxState = UiGlobals?.redux?.getState ? UiGlobals.redux.getState() : null,
		scopedUser = user || reduxState?.app?.user,
		token = getUserToken(scopedUser);

	if (!token) {
		return {};
	}

	return getRepositoryAuthHeaders(token);
}

/**
 * getUserData
 * 
 * Normalizes a user value into a plain data object.
 * Exists because a user may arrive as either a raw plain object or a @onehat/data Entity.
 * 
 * @param {object|null} user - A plain user object or @onehat/data Entity.
 * @returns {object|null} The raw user data object, or null if no user was provided.
 */
export function getUserData(user) {
	if (!user) {
		return null;
	}
	return user?.getOriginalData ? user.getOriginalData() : user;
}

/**
 * getUserToken
 * 
 * Extracts the auth token string from a user value.
 * Exists because the token may be stored under either `token` or `users__token` depending on the API response shape.
 * Normalizes the user via getUserData first, then returns whichever key is present, or null.
 * 
 * @param {object|null} user - A plain user object or @onehat/data Entity.
 * @returns {string|null} The token string, or null if none is found.
 */
export function getUserToken(user) {
	const userData = getUserData(user);
	return userData?.token || userData?.users__token || null;
}

/**
 * getRepositoryAuthHeaders
 * 
 * Builds the raw header object used for authenticated API requests.
 * Exists as a dedicated function so the header shape is defined in one place and can be used
 * both for one-off header construction and for pushing headers to all repositories.
 * Passing null (or omitting the arg) sets Authentication to null, clearing the token.
 * 
 * @param {string|null} [token=null] - The auth token string. Pass null to clear the token.
 * @returns {object} Header object with an `Authentication` key.
 */
export function getRepositoryAuthHeaders(token = null) {
	return {
		Authentication: token ? `Token ${token}` : null,
		// Cookie: null,
	};
}

/**
 * setRepositoryAuthHeaders
 * 
 * Propagates an auth token to every @onehat/data repository in one call.
 * Exists to support the refresh token flow: when a new token is obtained, this immediately
 * updates all repository instances and the repository globals so subsequent requests use the new token.
 * Passing null clears the token everywhere (e.g. on logout).
 * 
 * @param {string|null} [token=null] - The auth token string. Pass null to clear the token on all repositories.
 * @returns {object} The header object that was applied to all repositories.
 */
export function setRepositoryAuthHeaders(token = null) {
	const headers = getRepositoryAuthHeaders(token);
	oneHatData.setOptionsOnAllRepositories({ headers });
	oneHatData.setRepositoryGlobals({ headers });
	return headers;
}