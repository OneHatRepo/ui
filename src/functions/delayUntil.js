export default function delayUntil(fn, maxAttempts = 100, interval = 100) {
	return new Promise((resolve, reject) => {
		let currentAttempt = 0;
		const checkCondition = async () => {
			currentAttempt++;

			if (fn()) {
				resolve();
			} else if (currentAttempt < maxAttempts) {
				setTimeout(checkCondition, interval);
			} else {
				reject(new Error('maxAttempts reached. Condition not met.'));
			}
		};

		checkCondition();
	});
}
