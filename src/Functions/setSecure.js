import oneHatData from '@onehat/data';

export default async function setSecure(key, value) {
	const Secure = oneHatData.getRepository('Secure'),
		secure = Secure.getById(key);
	let isOneBuild = false,
		isJson = false,
		model = null;
	if (value && typeof value !== 'string') {
		if (value.getDataForNewEntity) {
			model = value.repository.name;
			value = value.getDataForNewEntity();
			isOneBuild = true;
		}
		value = JSON.stringify(value);
		isJson = true;
	}
	if (secure) {
		secure.setValues({
			value,
			isOneBuild,
			isJson,
			model,
		});
		await Secure.save(secure);
	} else {
		await Secure.add({
			key,
			value,
			isOneBuild,
			isJson,
			model,
		});
	}
}