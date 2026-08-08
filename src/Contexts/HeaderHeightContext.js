import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const HeaderHeightContext = createContext({
	headerHeight: 0,
	reportHeaderHeight: () => {},
	clearHeaderHeight: () => {},
});

function HeaderHeightProvider(props) {
	const { children } = props;
	const [headerHeights, setHeaderHeights] = useState({});

	const reportHeaderHeight = useCallback((id, height) => {
		if (!id) {
			return;
		}

		const normalizedHeight = Math.max(0, Number(height) || 0);
		setHeaderHeights((prev) => {
			if (prev[id] === normalizedHeight) {
				return prev;
			}
			return {
				...prev,
				[id]: normalizedHeight,
			};
		});
	}, []);

	const clearHeaderHeight = useCallback((id) => {
		if (!id) {
			return;
		}

		setHeaderHeights((prev) => {
			if (typeof prev[id] === 'undefined') {
				return prev;
			}

			const next = { ...prev };
			delete next[id];
			return next;
		});
	}, []);

	const headerHeight = useMemo(() => {
		const values = Object.values(headerHeights);
		if (!values.length) {
			return 0;
		}
		return Math.max(...values);
	}, [headerHeights]);

	const value = useMemo(() => {
		return {
			headerHeight,
			reportHeaderHeight,
			clearHeaderHeight,
		};
	}, [headerHeight, reportHeaderHeight, clearHeaderHeight]);

	return <HeaderHeightContext.Provider value={value}>{children}</HeaderHeightContext.Provider>;
}

function useHeaderHeightRegistry() {
	return useContext(HeaderHeightContext);
}

export default HeaderHeightContext;
export {
	HeaderHeightProvider,
	useHeaderHeightRegistry,
};