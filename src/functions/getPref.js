import oneHatData from '@onehat/data';

export default function getPref(key) {
	const Prefs = oneHatData.getRepository('Prefs'),
		pref = Prefs.getById(key);
	return pref && pref.value;
}