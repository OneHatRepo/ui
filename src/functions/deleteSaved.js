import oneHatData from '@onehat/data';
import UiGlobals from '../UiGlobals.js';

export default async function deleteSaved(key) {
	const Repo = oneHatData.getRepository(UiGlobals.uiSavesRepo);
	if (!Repo) {
		return null;
	}
	await Repo.deleteById(key);
}