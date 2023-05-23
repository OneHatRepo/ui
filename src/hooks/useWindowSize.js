// from https://designcode.io/react-hooks-usewindowsize-hook

import { useLayoutEffect, useState } from 'react';
import _ from 'lodash';

// For web only!
export default function useWindowSize() {
	const [windowSize, setWindowSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight
	});

	const handleSize = () => {
		const
			existingSize = windowSize,
			newSize = {
				width: window.innerWidth,
				height: window.innerHeight
			};
		if (!_.isEqual(existingSize, newSize)) {
			setWindowSize(newSize);
		}
	};

	useLayoutEffect(() => {
		handleSize();

		window.addEventListener('resize', handleSize);

		return () => window.removeEventListener('resize', handleSize);
	}, []);

	return windowSize;
};
