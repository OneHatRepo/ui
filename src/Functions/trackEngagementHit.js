export default function trackEngagementHit(repository, data) {
	const
		method = 'POST',
		url = 'Engagements/trackEngagementHit';

	return repository._send(method, url, data)
					.then((result) => {
						if (repository.debugMode) {
							console.log(url + ' result', result);
						}
					});
}