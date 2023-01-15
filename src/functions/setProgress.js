
import {
	SET_PROGRESS_MESSAGE,
	SET_PROGRESS_PERCENTAGE,
} from '../../Models/actions/AppActions';
import AppGlobals from '../../AppGlobals';

let totalSegments = 1,
	currentSegment = 1;

function setTotalSegments(total) {
	totalSegments = total;
}
function setCurrentSegment(segment) {
	currentSegment = segment;
}


export function setProgressMessage(message, segments = 1) {
	// Reset progress
	setTotalSegments(segments);
	setCurrentSegment(1);

	const Store = AppGlobals.redux;
	Store.dispatch({
		type: SET_PROGRESS_MESSAGE,
		message,
	});
}

export function setProgressPercentage(percentage = 100, segment = null) {
	if (segment !== null) {
		setCurrentSegment(segment);
	}

	// Calculate the percentage of this segment
	let totalPercentage = percentage;
	if (totalSegments > 1) {
		const progressPerSegment = 100 / totalSegments,
			accumulatedProgress = (currentSegment - 1) * progressPerSegment;
		totalPercentage = accumulatedProgress + (percentage * progressPerSegment);
	}

	const Store = AppGlobals.redux;
	Store.dispatch({
		type: SET_PROGRESS_PERCENTAGE,
		percentage: totalPercentage,
	});
}