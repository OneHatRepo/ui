import { forwardRef, useState, useEffect, } from 'react';
import oneHatData from '@onehat/data';
import _ from 'lodash';

// Keeps track of LocalRepository.
// If a Repository was submitted, this simply passes everything through
// without changing anything. In that way, a component can have multiple
// levels of withData() applied, to no ill effect.

// This is the primary link between @onehat/data and the UI components

export default function withData(WrappedComponent) {
	return forwardRef((props, ref) => {

		if (props.disableWithData || props.alreadyHasWithData) {
			return <WrappedComponent {...props} ref={ref} />;
		}
		
		const {
				// For @onehat/data repositories
				Repository,
				setRepository,
				uniqueRepository = false,
				model,
				autoLoad, // bool
				pageSize,
				baseParams,

				// For plain JS data
				data,
				fields = ['id', 'value'],
				idField = 'id',
				displayField = 'value',
				idIx,
				displayIx,

				// withComponent
				self,
			} = props,
			localIdIx = idIx || (fields && idField ? fields.indexOf(idField) : null),
			localDisplayIx = displayIx || (fields && displayField ? fields?.indexOf(displayField) : null),
			[LocalRepository, setLocalRepository] = useState(Repository || null), // simply pass on Repository if it's already supplied
			[isReady, setIsReady] = useState(!!LocalRepository || !!data); // It's already ready if a LocalRepository or data array is already set. Otherwise, we need to create the repository

		// Create LocalRepository
		// If Repository was submitted to this withData(), the useEffect has no effect.
		// If it's empty, it tries to create a LocalRepository
		useEffect(() => {
			if (!!LocalRepository || !!data) {
				return () => {};
			}

			let repositoryId;

			(async () => {
				let Repository;
				if (uniqueRepository) {
					const schema = oneHatData.getSchema(model);
					Repository = await oneHatData.createRepository({ schema });
					repositoryId = Repository.id;
				} else {
					Repository = oneHatData.getRepository(model);
				}

				if (pageSize) {
					Repository.setPageSize(pageSize);
				}

				if (baseParams) {
					Repository.setBaseParams(baseParams);
				}


				if (Repository && !Repository.isLoaded && Repository.isRemote && !Repository.isAutoLoad && !Repository.isLoading) {
					let doAutoLoad = Repository.autoLoad;
					if (!_.isNil(autoLoad)) { // prop can override schema setting for autoLoad
						doAutoLoad = autoLoad;
					}
					if (doAutoLoad) {
						await Repository.load();
					}
				}
	
				setLocalRepository(Repository);
				if (setRepository) { // pass it on up to higher components
					setRepository(Repository);
				}
				if (self) {
					self.repository = Repository;
				}
				setIsReady(true);
			})();

			return () => {
				if (repositoryId && !oneHatData.isDestroyed) {
					oneHatData.deleteRepository(repositoryId);
				}
			}

		}, []);

		useEffect(() => {
			if (!baseParams || !LocalRepository) {
				return;
			}
		
			// If baseParams changes, re-load the Repository
			if (LocalRepository.isLoaded && !_.isEqual(LocalRepository.getBaseParams(), baseParams)) {
				LocalRepository.setBaseParams(baseParams);
	
				if (LocalRepository.isRemote && !LocalRepository.isLoading) {
					LocalRepository.load();
				}
			}
		
		}, [baseParams, LocalRepository]);

		if (!isReady) {
			return null;
		}

		return <WrappedComponent
					{...props}
					disableWithData={false}
					alreadyHasWithData={true}
					ref={ref}
					Repository={LocalRepository}
					fields={fields}
					idField={idField}
					displayField={displayField}
					idIx={localIdIx}
					displayIx={localDisplayIx}
				/>;
	});
}