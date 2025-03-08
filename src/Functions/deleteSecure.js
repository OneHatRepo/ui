import oneHatData from '@onehat/data';

export default async function deleteSecure(key) {
	const Secure = oneHatData.getRepository('Secure');
	await Secure.deleteById(key);
}