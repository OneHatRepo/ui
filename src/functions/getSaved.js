import oneHatData from '@onehat/data';
import UiGlobals from '../UiGlobals.js';
import _ from 'lodash';

export default async function getSaved(key) {
	const Repo = oneHatData.getRepository(UiGlobals.uiSavesRepo);
	if (!Repo) {
		return;
	}

	const entity = Repo?.getById(key);
	if (!entity) {
		return null;
	}

	let value = entity.value;

	if (entity.isJson) {
		value = JSON.parse(value);
		const model = entity.model;
		if (entity.isOneBuild) {
			// Convert the data to an actual entity (or entities) of the correct type
			const
				Repository = oneHatData.getRepository(model),
				entities = [];
			let i, data, entity;
			if (_.isArray(value)) {
				for (i = 0; i = value.length; i++) {
					data = value[i];
					entity = await Repository.createStandaloneEntity(data);
					entities.push(entity);
				}
				value = entities;
			} else {
				value = await Repository.createStandaloneEntity(value);
			}

		}
	}
	return value;
}