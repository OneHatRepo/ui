import oneHatData from '@onehat/data';

export default async function getSecure(key) {
	const Secure = oneHatData.getRepository('Secure'),
		secure = Secure.getById(key);

	if (!secure) {
		return null;
	}

	let value = secure.value;

	if (secure.isJson) {
		value = JSON.parse(value);
		if (secure.isOneBuild) {
			const Repository = oneHatData.getRepository(secure.model);
			value = await Repository.createStandaloneEntity(value);
		}
	}
	return value;
}