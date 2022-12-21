export default function verifyCompleted(completed, expectedNum, timeoutAfterTries = 60) {
	let attempts = 0;
	return new Promise((resolve, reject) => {
		function check() {
			if (attempts === timeoutAfterTries) {
				reject(false);
				return;
			}
			attempts++;
			if (completed.length === expectedNum) {
				resolve(true);
				return;
			}
			setTimeout(check, 100);
		}
		check();
	});
}