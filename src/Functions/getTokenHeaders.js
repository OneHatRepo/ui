import UiGlobals from '../UiGlobals.js';

export default function(clearAll = false) {

	throw Error('getTokenHeaders is deprecated. Please use the new functions in authFunctions.js instead.');

	const reduxState = UiGlobals.redux.getState();
	if (!reduxState.app.user || (!reduxState.app.user.token && !reduxState.app.user.users__token)) {
		return {};
	}
	const token = reduxState.app.user.token || reduxState.app.user.users__token;
	return {
		Authentication: clearAll ? null : `Token ${token}`,
		// Cookie: null,
	};
}