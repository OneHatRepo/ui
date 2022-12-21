import sleep from './sleep';

export default async function waitFor(fn, pollingFrequencyMs = 1000, timeoutMs = null) {
	let timeElapsed = 0;
	const isTimedOut = () => {
		if (!timeoutMs) {
			return false;
		}
		timeElapsed += pollingFrequencyMs;
		return timeElapsed > timeoutMs;
	};
    while(!fn() && !isTimedOut()) {
		await sleep(pollingFrequencyMs);
	}
    return fn();
}