import { useMemo } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { useHeaderHeightRegistry } from '../Contexts/HeaderHeightContext';

function getWebDocumentHeaderHeight() {
	if (typeof document === 'undefined') {
		return 0;
	}

	const candidates = document.querySelectorAll('header, [role="banner"], [data-expo-router-header]');
	for (const candidate of candidates) {
		const rect = candidate.getBoundingClientRect();
		if (rect.height > 0 && rect.top <= 1) {
			return rect.height;
		}
	}

	return 0;
}

export default function useHeaderHeight(options = {}) {
	const {
		fallback = 0,
		includeDocumentHeaderFallback = true,
	} = options;
	const { headerHeight } = useHeaderHeightRegistry();
	const { height: windowHeight } = useWindowDimensions();

	const documentHeaderHeight = useMemo(() => {
		if (!includeDocumentHeaderFallback || Platform.OS !== 'web') {
			return 0;
		}
		return getWebDocumentHeaderHeight();
	}, [windowHeight, includeDocumentHeaderFallback]);

	if (headerHeight > 0) {
		return headerHeight;
	}

	if (documentHeaderHeight > 0) {
		return documentHeaderHeight;
	}

	return Math.max(0, Number(fallback) || 0);
}