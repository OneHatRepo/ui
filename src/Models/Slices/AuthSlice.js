import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import oneHatData from '@onehat/data';
import {
	getUserData,
	getUserToken,
	setRepositoryAuthHeaders,
} from '../../Functions/authFunctions.js';
import {
	AUTH_STATUS_UNKNOWN,
	AUTH_STATUS_AUTHENTICATED,
	AUTH_STATUS_UNAUTHENTICATED,
} from '../../Constants/Auth.js';
import getSecure from '../../Functions/getSecure';
import setSecure from '../../Functions/setSecure';
import deleteSecure from '../../Functions/deleteSecure';
import { setAlertMessage } from './SystemSlice.js';
import { CROSS_TAB_EVENT_NAME } from '@onehat/data/src/Integration/Browser/Repository/crossTabConstants.js';
import _ from 'lodash';

const EXPIRED_MESSAGE = 'Your session has expired. Please log in again.';
const USER_CREDS = 'USER_CREDS-';
let refreshAuthTokenPromise = null;
let onSetUserCallback = null;
let onCrossTabRehydrateCallback = null;


// Thunks

export const setUserThunk = createAsyncThunk(
	'auth/setUser',
	async (user, { dispatch }) => {
		const userData = getUserData(user);
		dispatch(setUser(userData));

		const token = getUserToken(userData);
		setRepositoryAuthHeaders(token);
		dispatch(setAuthStatus(token ? AUTH_STATUS_AUTHENTICATED : AUTH_STATUS_UNAUTHENTICATED));

		if (user) {
			await setSecure('user', user);
		} else {
			await deleteSecure('user');
		}

		if (onSetUserCallback) {
			await onSetUserCallback(userData);
		}
	}
);

export const setGroupsThunk = createAsyncThunk(
	'auth/setGroups',
	async (groups, { dispatch }) => {
		dispatch(setGroups(groups));

		if (!_.isEmpty(groups)) {
			await setSecure('groups', groups);
		} else {
			await deleteSecure('groups');
		}
	}
);

export const setPermissionsThunk = createAsyncThunk(
	'auth/setPermissions',
	async (permissions, { dispatch }) => {
		if (_.isPlainObject(permissions)) {
			permissions = _.map(permissions, (value, key) => {
				if (!parseInt(value)) {
					return null;
				}
				return key;
			});
		}

		dispatch(setPermissions(permissions));

		if (!_.isEmpty(permissions)) {
			await setSecure('permissions', permissions);
		} else {
			await deleteSecure('permissions');
		}
	}
);

/**
 * crossTabRehydrateThunk
 *
 * Handles Secure repository cross-tab storage events.
 * Rehydrates auth-related Redux state from secure storage without writing back,
 * so we avoid rebroadcast loops.
 *
 * Net effect: login/logout/token refresh in one tab is mirrored in other tabs.
 */
const crossTabRehydrateThunk = createAsyncThunk(
	'auth/crossTabRehydrate',
	async ({ key, operation }, { dispatch, getState }) => {
		let shouldRecalculateTabVisibility = false,
			handled = false;

		// Full secure wipe from another tab means immediate local sign-out.
		if (operation === 'clearAll') {
			setRepositoryAuthHeaders(null);
			dispatch(setUser(null)); // don't use setUserThunk because that would write to secure storage, which would trigger another broadcast, etc.
			dispatch(setGroups(null));
			dispatch(setPermissions(null));
			dispatch(setAuthStatus(AUTH_STATUS_UNAUTHENTICATED));
			shouldRecalculateTabVisibility = true;
			handled = true;
		}

		// For delete events, do not call Secure.load(). During delete/index timing windows,
		// load can attempt to construct entities from null data.
		if (!handled && operation === 'delete') {
			if (key === 'user') {
				setRepositoryAuthHeaders(null);
				dispatch(setUser(null));
				dispatch(setGroups(null));
				dispatch(setPermissions(null));
				dispatch(setAuthStatus(AUTH_STATUS_UNAUTHENTICATED));
				shouldRecalculateTabVisibility = true;
			} else if (key === 'groups') {
				dispatch(setGroups([]));
				shouldRecalculateTabVisibility = true;
			} else if (key === 'permissions') {
				dispatch(setPermissions([]));
				shouldRecalculateTabVisibility = true;
			}
			handled = true;
		}

		if (!handled) {
			// Non-delete events: refresh Secure cache before reads.
			const Secure = oneHatData.getRepository('Secure');
			if (Secure) {
				await Secure.load();
			}

			// USER_CREDS-* is written first on login and contains a complete auth payload.
			// Use it as the fast-path to hydrate user/groups/permissions in one shot.
			if (_.isString(key) && key.startsWith(USER_CREDS)) {
				const parsedCreds = parseSecureCredsPayload(await getSecure(key));
				if (parsedCreds?.user) {
					const groups = _.isNil(parsedCreds.groups) ? await getSecure('groups') : parsedCreds.groups;
					const permissions = _.isNil(parsedCreds.permissions) ? await getSecure('permissions') : parsedCreds.permissions;
					shouldRecalculateTabVisibility = applyCrossTabAuthPayload(dispatch, {
						user: parsedCreds.user,
						groups,
						permissions,
					}) || shouldRecalculateTabVisibility;
				}
			}

			// User set events may race with index writes; do a one-time delayed retry
			// to pick up groups/permissions that were not index-addressable yet.
			if (key === 'user') {
				const snapshot = await readSecureAuthSnapshot(Secure, true);
				if (snapshot.user) {
					shouldRecalculateTabVisibility = applyCrossTabAuthPayload(dispatch, snapshot) || shouldRecalculateTabVisibility;
				}
			}

			// Direct key updates: apply whatever is now readable in Secure.
			if (key === 'groups') {
				const groups = await getSecure('groups');
				if (groups !== null) {
					dispatch(setGroups(groups));
					shouldRecalculateTabVisibility = true;
				}
			}

			if (key === 'permissions') {
				const permissions = await getSecure('permissions');
				if (permissions !== null) {
					dispatch(setPermissions(normalizePermissionsForCrossTab(permissions)));
					shouldRecalculateTabVisibility = true;
				}
			}

			// Index events are the safety net for set-before-index races.
			// Only backfill user/groups/permissions that are still missing in Redux.
			if (key === 'index') {
				const state = getState();
				const user = await getSecure('user');
				if (user) {
					if (!state?.auth?.user) {
						shouldRecalculateTabVisibility = applyCrossTabAuthPayload(dispatch, { user }) || shouldRecalculateTabVisibility;
					}

					if (!Array.isArray(state?.auth?.groups)) {
						const groups = await getSecure('groups');
						if (groups) {
							dispatch(setGroups(groups));
							shouldRecalculateTabVisibility = true;
						}
					}

					if (!Array.isArray(state?.auth?.permissions)) {
						const permissions = await getSecure('permissions');
						if (permissions) {
							dispatch(setPermissions(normalizePermissionsForCrossTab(permissions)));
							shouldRecalculateTabVisibility = true;
						}
					}
				}
			}
		}

		// Optional app callback hook for project-specific behavior.
		if (onCrossTabRehydrateCallback) {
			const callbackResult = await onCrossTabRehydrateCallback({
				key,
				operation,
				dispatch,
				getState,
				shouldRecalculateTabVisibility,
			});

			if (_.isPlainObject(callbackResult) && !_.isNil(callbackResult.shouldRecalculateTabVisibility)) {
				shouldRecalculateTabVisibility = !!callbackResult.shouldRecalculateTabVisibility;
			}
		}

		return {
			shouldRecalculateTabVisibility,
		};
	}
);

/**
 * registerCrossTabAuthSync
 * 
 * External integration point for crossTabRehydrateThunk, called in initializeApp.
 * This registers one cross-tab listener that routes Secure repository events through it.
 */
export function registerCrossTabAuthSync(dispatch) {
	oneHatData.on(CROSS_TAB_EVENT_NAME, (data) => {
		if (data?.repositoryName === 'Secure') {
			dispatch(crossTabRehydrateThunk(data));
		}
	});
}

export const forceUnauthenticatedThunk = createAsyncThunk(
	'auth/forceUnauthenticated',
	async (message = null, { dispatch }) => {
		setRepositoryAuthHeaders(null);

		dispatch(setUser(null));
		dispatch(setGroups(null));
		dispatch(setPermissions(null));
		dispatch(setAuthStatus(AUTH_STATUS_UNAUTHENTICATED));

		await deleteSecure('user');
		await deleteSecure('groups');
		await deleteSecure('permissions');

		if (message) {
			dispatch(setAlertMessage(message));
		}
	}
);

export const refreshAuthTokenThunk = createAsyncThunk(
	'auth/refreshAuthToken',
	async (unused, { dispatch, getState, rejectWithValue }) => {
		if (refreshAuthTokenPromise) {
			return await refreshAuthTokenPromise;
		}

		refreshAuthTokenPromise = (async () => {
			const state = getState();
			const currentUser = selectUser(state);
			const currentUserData = getUserData(currentUser);
			const currentToken = getUserToken(currentUserData);
			if (!currentUserData || !currentToken) {
				throw new Error('No authenticated user to refresh.');
			}

			const Users = oneHatData.getRepository('Users');
			if (!Users) {
				throw new Error('Users repository is not available.');
			}

			const refreshResult = await Users._send('POST', 'Users/refreshAuthToken', null, {
				transformResponse: null,
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					Authentication: `Token ${currentToken}`,
				},
				timeout: Users.timeout,
				_skipAuthRetry: true,
			});

			const {
				root,
				success,
				message,
			} = Users._processServerResponse(refreshResult);
			if (!success) {
				throw new Error(message || 'Unable to refresh auth token.');
			}

			const refreshedRoot = _.isArray(root) ? root[0] : root;
			const nextUserData = _.merge({}, currentUserData, _.isPlainObject(refreshedRoot) ? refreshedRoot : {});
			const nextToken = getUserToken(nextUserData);
			if (!nextToken) {
				throw new Error('refreshAuthToken did not return a token.');
			}

			if (!nextUserData.users__token) {
				nextUserData.users__token = nextToken;
			}
			if (!nextUserData.token) {
				nextUserData.token = nextToken;
			}

			await dispatch(setUserThunk(nextUserData));

			return nextUserData;
		})();

		try {
			return await refreshAuthTokenPromise;
		} catch (error) {
			return rejectWithValue(error?.message || 'Unable to refresh auth token.');
		} finally {
			refreshAuthTokenPromise = null;
		}
	}
);

export const verifyStartupAuthThunk = createAsyncThunk(
	'auth/verifyStartupAuth',
	async ({ user, groups, permissions }, { dispatch }) => {
		dispatch(setAuthStatus(AUTH_STATUS_UNKNOWN)); // defensive programming, in case verifyStartupAuthThunk is dispatched multiple times during app startup

		if (!user) {
			dispatch(setAuthStatus(AUTH_STATUS_UNAUTHENTICATED));
			return false;
		}

		const userData = getUserData(user);
		const token = getUserToken(userData);
		if (!token) {
			await dispatch(forceUnauthenticatedThunk(EXPIRED_MESSAGE));
			return false;
		}

		dispatch(setUser(userData));
		setRepositoryAuthHeaders(token);

		try {
			await dispatch(refreshAuthTokenThunk()).unwrap();

			if (!_.isNil(groups)) {
				dispatch(setGroups(groups));
			}
			if (!_.isNil(permissions)) {
				dispatch(setPermissions(permissions));
			}

			dispatch(setAuthStatus(AUTH_STATUS_AUTHENTICATED));
			return true;
		} catch (error) {
			await dispatch(forceUnauthenticatedThunk(EXPIRED_MESSAGE));
			return false;
		}
	}
);


export const authSlice = createSlice({
	name: 'auth',
	initialState: {
		authStatus: AUTH_STATUS_UNKNOWN,
		user: null,
		groups: null,
		permissions: null,
	},
	reducers: {
		setAuthStatus: (state, action) => {
			state.authStatus = action.payload;
		},
		setUser: (state, action) => {
			state.user = action.payload;
		},
		setGroups: (state, action) => {
			state.groups = action.payload;
		},
		setPermissions: (state, action) => {
			state.permissions = action.payload;
		},
	},
});

export const {
	setAuthStatus,
	setUser,
	setGroups,
	setPermissions,
} = authSlice.actions;

export const selectAuthStatus = state => state.auth.authStatus;
export const selectUser = state => state.auth.user;
export const selectGroups = state => state.auth.groups;
export const selectPermissions = state => state.auth.permissions;


export default authSlice.reducer;



//    ______      ______               __
//   / ____/___ _/ / / /_  ____ ______/ /_______
//  / /   / __ `/ / / __ \/ __ `/ ___/ //_/ ___/
// / /___/ /_/ / / / /_/ / /_/ / /__/ ,< (__  )
// \____/\__,_/_/_/_.___/\__,_/\___/_/|_/____/

// These callbacks allow a project to hook into auth lifecycle events and apply app-specific logic

/**
 * Register a callback to be invoked whenever setUserThunk completes.
 * The callback receives the userData object as its argument.
 * 
 * @param {Function|null} callback - Async function to call after user is set, or null to clear.
 * 
 * USAGE in project:
 * 
	// Register callback to be invoked whenever a user is set
	setOnSetUserCallback(async (userData) => {
		
		// Do something unique to this app

	});
 */
export function setOnSetUserCallback(callback) {
	onSetUserCallback = callback;
}

/**
 * Register a callback to be invoked during cross-tab Secure rehydration.
 *
 * The callback receives an object with:
 * - key
 * - operation
 * - dispatch
 * - getState
 * - shouldRecalculateTabVisibility
 *
 * It may optionally return:
 * - { shouldRecalculateTabVisibility: boolean }
 *
 * @param {Function|null} callback - Async function to call during cross-tab rehydrate, or null to clear.
 * 
 * USAGE in project:
 * 
	// Register callback to be invoked during cross-tab rehydrate
	setOnCrossTabRehydrateCallback(async ({ key, operation, dispatch, getState, shouldRecalculateTabVisibility }) => {
		
		// Do something unique to this app

	});
 */
export function setOnCrossTabRehydrateCallback(callback) {
	onCrossTabRehydrateCallback = callback;
}



//     __  __     __
//    / / / /__  / /___  ___  __________
//   / /_/ / _ \/ / __ \/ _ \/ ___/ ___/
//  / __  /  __/ / /_/ /  __/ /  (__  )
// /_/ /_/\___/_/ .___/\___/_/  /____/
//             /_/

function normalizePermissionKey(permissionKey) {
	// Secure payloads may use DB-style permission keys (e.g. permissions__view_reports).
	// Convert to app-level keys expected by canUser/checkPermission.
	if (!_.isString(permissionKey)) {
		return null;
	}
	return permissionKey.replace(/^permissions__/, '');
}

function normalizePermissionsForCrossTab(permissions) {
	// Cross-tab data can arrive as object maps, arrays of strings, or arrays of objects.
	// Normalize everything into a de-duplicated array of canonical permission strings.
	if (_.isPlainObject(permissions)) {
		return _.chain(permissions)
			.map((value, permissionKey) => parseInt(value) ? normalizePermissionKey(permissionKey) : null)
			.compact()
			.value();
	}

	if (Array.isArray(permissions)) {
		return _.chain(permissions)
			.map((permission) => {
				if (_.isString(permission)) {
					return normalizePermissionKey(permission);
				}
				if (_.isPlainObject(permission) && _.isString(permission.permission)) {
					return normalizePermissionKey(permission.permission);
				}
				return null;
			})
			.compact()
			.uniq()
			.value();
	}

	return permissions;
}

function parseSecureCredsPayload(secureCreds) {
	// USER_CREDS-* is stored as a JSON string; parse it safely so a malformed
	// record does not break cross-tab auth rehydration.
	if (_.isString(secureCreds)) {
		try {
			return JSON.parse(secureCreds);
		} catch (error) {
			return null;
		}
	}
	return _.isPlainObject(secureCreds) ? secureCreds : null;
}

function applyCrossTabAuthPayload(dispatch, payload) {
	// Applies the subset of auth data that is present.
	// Returns whether any state changed so caller can decide whether to recalc tabs.
	const {
		user = undefined,
		groups = undefined,
		permissions = undefined,
	} = payload;

	let changed = false;

	if (!_.isUndefined(user)) {
		const userData = getUserData(user);
		dispatch(setUser(userData));
		setRepositoryAuthHeaders(getUserToken(userData));
		dispatch(setAuthStatus(AUTH_STATUS_AUTHENTICATED));
		changed = true;
	}

	if (!_.isUndefined(groups) && groups !== null) {
		dispatch(setGroups(groups));
		changed = true;
	}

	if (!_.isUndefined(permissions) && permissions !== null) {
		dispatch(setPermissions(normalizePermissionsForCrossTab(permissions)));
		changed = true;
	}

	return changed;
}

async function readSecureAuthSnapshot(Secure, retryMissing = false) {
	// Reads user/groups/permissions from Secure in one place.
	// Optional retry handles set-before-index races where first read can miss keys.
	const user = await getSecure('user');
	let groups = await getSecure('groups');
	let permissions = await getSecure('permissions');

	if (retryMissing && (groups === null || permissions === null)) {
		await new Promise(resolve => setTimeout(resolve, 75));
		if (Secure) {
			await Secure.load();
		}

		if (groups === null) {
			groups = await getSecure('groups');
		}
		if (permissions === null) {
			permissions = await getSecure('permissions');
		}
	}

	return { user, groups, permissions };
}