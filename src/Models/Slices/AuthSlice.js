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
import setSecure from '../../Functions/setSecure';
import deleteSecure from '../../Functions/deleteSecure';
import { setAlertMessage } from './SystemSlice.js';
import _ from 'lodash';

const EXPIRED_MESSAGE = 'Your session has expired. Please log in again.';
let refreshAuthTokenPromise = null;
let onSetUserCallback = null;

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

export default authSlice.reducer;
