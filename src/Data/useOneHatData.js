import { useState, useEffect, useRef, } from 'react';
import oneHatData from '@onehat/data';
import _ from 'lodash';

/**
 * NOTE: This file will *NOT* work as a direct import to your project,
 * since 'React' is not in scope within the @onehat/data module.
 * This file is provided as an example only!
 * You will need to copy this file into your own project and import it from there.
 */

/**
 * Custom React Hook.
 * Enables two-way communication between a React component and OneHatData.
 * @param {[string|object]} config - The name of the Schema you want to use. 
 * Alternately, this can be a Repository config object, in which case a unique Repository will be created
 * @param {boolean} uniqueRepository - Create and use a unique Repository 
 * for just this one component, or get the Repository bound to the supplied Schema?
 * @return {array} [entities, repository] - *entities* contains the activeEntities 
 * of the repository. *repository* is the repository itself, which the component
 * can use to call actions on the repository, like refresh() or sort() or filter()
 */
export default function useOneHatData(config, uniqueRepository = false) {
	
	const [entities, setEntities] = useState([]),
		repository = useRef(), // use 'ref' instead of 'state' so onChangeData sees non-stale repository
		setRepository = (r) => {
			repository.current = r;
		};

	let schemaName;

	// normalize config and schemaName
	if (_.isString(config)) {
		schemaName = config;
		config = {
			schema: config,
		};
	} else {
		schemaName = config.id;
	}
 
	useEffect(() => {
 
		const onChangeData = () => {
			setEntities(repository.current.entities);
		};
		
		(async () => {
 
			const repository = uniqueRepository ? 
				await oneHatData.createRepository(config) : 
				oneHatData.getRepository(schemaName);
	 
			setRepository(repository);
			setEntities(repository.entities);
	
			// Create & assign event handler for 'changeData'
			repository.on('changeData', onChangeData);
 
		})();
 
		return () => {
			if (repository.current) {
				repository.current.off('changeData', onChangeData);
			}
			if (uniqueRepository) {
				oneHatData.deleteRepository(schemaName);
			}
		};
		
	}, []); // '[]' to make this effect run only once
 
	return [entities, repository.current];
}