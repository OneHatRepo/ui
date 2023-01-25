import oneHatData from '@onehat/data';

export default function setPref(key, value) {
	const Prefs = oneHatData.getRepository('Prefs'),
		pref = Prefs.getById(key);
	if (pref) {
		pref.properties.value.setValue(value);
	} else {
		Prefs.add({
			key,
			value,
		});
	}
}