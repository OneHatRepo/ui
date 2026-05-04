import { useEffect } from 'react';
import oneHatData from '@onehat/data';
import { CROSS_TAB_EVENT_NAME } from '@onehat/data/src/Integration/Browser/Repository/crossTabConstants.js';

/**
 * Subscribes to cross-tab storage change events emitted by the Secure repository.
 * When another tab writes to the Secure store, `onChange` is called with:
 *   { operation, key, namespacedKey, timestamp, repositoryName, repositoryType }
 *
 * The callback is intentionally free of Redux/app concerns — wire your own
 * re-hydration logic (e.g. re-dispatch setUserThunk) in the callback.
 *
 * Usage:
 *   useCrossTabSecureSync(useCallback(async ({ key }) => {
 *     if (key === 'user') {
 *       const user = await getSecure('user');
 *       dispatch(setUserThunk(user));
 *     }
 *   }, [dispatch]));
 *
 * @param {Function} onChange - Stable callback (wrap in useCallback).
 * @param {string} [repositoryName='Secure'] - Override target repository name.
 */
export default function useCrossTabSecureSync(onChange, repositoryName = 'Secure') {
	useEffect(() => {
		const handler = (data) => {
			if (data?.repositoryName !== repositoryName) {
				return;
			}
			onChange(data);
		};
		oneHatData.on(CROSS_TAB_EVENT_NAME, handler);
		return () => {
			oneHatData.off(CROSS_TAB_EVENT_NAME, handler);
		};
	}, [onChange, repositoryName]);
}
