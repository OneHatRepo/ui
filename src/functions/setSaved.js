import oneHatData from '@onehat/data';
import UiGlobals from '../UiGlobals.js';
import _ from 'lodash';

export default async function setSaved(key, value) {
	const Repo = oneHatData.getRepository(UiGlobals.uiSavesRepo);
	if (!Repo) {
		return;
	}
	
	const entity = Repo?.getById(key);
	
	let isOneBuild = false,
		isJson = false,
		model = null;
	if (!_.isNil(value) && typeof value !== 'string') {
		if (_.isArray(value)) {
			const objects = value;
			if (objects[0]?.getDataForNewEntity) {
				model = objects[0].repository.name;
				isOneBuild = true;
			}
			const rawValues = [];
			_.each(objects, (obj) => {
				rawValues.push(isOneBuild ? obj.getDataForNewEntity() : obj);
			});
			value = JSON.stringify(rawValues);
		} else {
			if (value.getDataForNewEntity) {
				model = value.repository.name;
				value = value.getDataForNewEntity();
				isOneBuild = true;
			}
			value = JSON.stringify(value);
		}
		isJson = true;
	}
	if (entity) {
		entity.setValues({
			value,
			isOneBuild,
			isJson,
			model,
		});
		await Repo.save(entity);
	} else {
		await Repo.add({
			key,
			value,
			isOneBuild,
			isJson,
			model,
		});
	}
}