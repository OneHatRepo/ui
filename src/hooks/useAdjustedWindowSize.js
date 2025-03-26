import getComponentFromType from '../functions/getComponentFromType.js';

// This hook takes the submitted window size and adjusts it
// to fit the actual screen size

export default function(width, height, percentage = 1) {

	const 
		useWindowSize = getComponentFromType('useWindowSize'),
		windowSize = useWindowSize();
	
	if (width > windowSize.width) {
		width = windowSize.width * percentage;
	}
	if (height > windowSize.height) {
		height = windowSize.height * percentage;
	}

	return [ width, height, ];
}