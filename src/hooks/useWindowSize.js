// from https://designcode.io/react-hooks-usewindowsize-hook

import { useLayoutEffect, useState } from 'react';

// For web only!
export default function useWindowSize() {
	const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

	const handleSize = () => {
		setWindowSize({
			width: window.innerWidth,
			height: window.innerHeight
		});
	};

	useLayoutEffect(() => {
		handleSize();

		window.addEventListener('resize', handleSize);

		return () => window.removeEventListener('resize', handleSize);
	}, []);

	return windowSize;
};
