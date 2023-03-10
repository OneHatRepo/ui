import AppGlobals from '../../AppGlobals.js';

export default function(clearAll = false) {
	const reduxState = AppGlobals.redux.getState();
	if (!reduxState.App.user || (!reduxState.App.user.token && !reduxState.App.user.users__token)) {
		return {};
	}
	const token = reduxState.App.user.token || reduxState.App.user.users__token;
	return {
		Authentication: clearAll ? null : `Token ${token}`,
		// Cookie: null,
	};
}