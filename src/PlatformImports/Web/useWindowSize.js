// from https://designcode.io/react-hooks-usewindowsize-hook

import { useLayoutEffect, useState } from 'react';
import _ from 'lodash';

export default function useWindowSize() {
	const [windowSize, setWindowSize] = useState({
		width: window?.innerWidth || 0,
		height: window?.innerHeight || 0,
	});

	const handleSize = () => {
		const
			existingSize = windowSize,
			newSize = {
				width: window?.innerWidth || 0,
				height: window?.innerHeight || 0,
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
