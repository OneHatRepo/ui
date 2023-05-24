import UiGlobals from '../UiGlobals.js';

export default function(clearAll = false) {
	const reduxState = UiGlobals.redux.getState();
	if (!reduxState.App.user || (!reduxState.App.user.token && !reduxState.App.user.users__token)) {
		return {};
	}
	const token = reduxState.App.user.token || reduxState.App.user.users__token;
	return {
		Authentication: clearAll ? null : `Token ${token}`,
		// Cookie: null,
	};
}