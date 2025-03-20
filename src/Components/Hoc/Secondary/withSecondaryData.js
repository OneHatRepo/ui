import { useState, useEffect, } from 'react';
import oneHatData from '@onehat/data';
import _ from 'lodash';

// NOTE: This is a modified version of @onehat/ui/src/Hoc/withData
// This HOC will eventually get out of sync with that one, and may need to be updated.

export default function withSecondaryData(WrappedComponent) {
	return (props) => {

		if (props.secondaryDisableWithData) {
			return <WrappedComponent {...props} />;
		}
		
		const
			{
				// For @onehat/data repositories
				SecondaryRepository,
				setSecondaryRepository,
				uniqueSecondaryRepository = false,
				secondaryModel,
				secondaryAutoLoad, // bool
				secondaryPageSize,
				secondaryBaseParams,

				// For plain JS data
				secondaryData,
				secondaryFields = ['id', 'value'],
				secondaryIdField = 'id',
				secondaryDisplayField = 'value',
				secondaryIdIx,
				secondaryDisplayIx,

				// withComponent
				self,
			} = props,
			propsToPass = _.omit(props, ['secondaryModel']), // passing 'secondaryModel' would mess things up if withData gets called twice (e.g. withData(...withData(...)) ), as we'd be trying to recreate SecondaryRepository twice
			localIdIx = secondaryIdIx || (secondaryFields && secondaryIdField ? secondaryFields.indexOf(secondaryIdField) : null),
			localDisplayIx = secondaryDisplayIx || (secondaryFields && secondaryDisplayField ? secondaryFields?.indexOf(secondaryDisplayField) : null),
			[LocalSecondaryRepository, setLocalSecondaryRepository] = useState(SecondaryRepository || null), // simply pass on SecondaryRepository if it's already supplied
			[isReady, setIsReady] = useState(!!LocalSecondaryRepository || !!secondaryData); // It's already ready if a LocalSecondaryRepository or secondaryData array is already set. Otherwise, we need to create the repository

		// Create LocalSecondaryRepository
		// If SecondaryRepository was submitted to this withData(), the useEffect has no effect.
		// If it's empty, it tries to create a LocalSecondaryRepository
		useEffect(() => {
			if (!!LocalSecondaryRepository || !!secondaryData) {
				return () => {};
			}

			let repositoryId;

			(async () => {
				let SecondaryRepository;
				if (uniqueSecondaryRepository) {
					const schema = oneHatData.getSchema(secondaryModel);
					SecondaryRepository = await oneHatData.createRepository({ schema });
					repositoryId = SecondaryRepository.id;
				} else {
					SecondaryRepository = oneHatData.getRepository(secondaryModel);
				}

				if (secondaryPageSize) {
					SecondaryRepository.setPageSize(secondaryPageSize);
				}

				if (secondaryBaseParams) {
					SecondaryRepository.setBaseParams(secondaryBaseParams);
				}


				if (SecondaryRepository && !SecondaryRepository.isLoaded && SecondaryRepository.isRemote && !SecondaryRepository.isAutoLoad && !SecondaryRepository.isLoading) {
					let doAutoLoad = SecondaryRepository.autoLoad;
					if (!_.isNil(secondaryAutoLoad)) { // prop can override schema setting for secondaryAutoLoad
						doAutoLoad = secondaryAutoLoad;
					}
					if (doAutoLoad) {
						await SecondaryRepository.load();
					}
				}
	
				setLocalSecondaryRepository(SecondaryRepository);
				if (setSecondaryRepository) { // pass it on up to higher components
					setSecondaryRepository(SecondaryRepository);
				}
				if (self) {
					self.repository = SecondaryRepository;
				}
				setIsReady(true);
			})();

			return () => {
				if (repositoryId) {
					oneHatData.deleteRepository(repositoryId);
				}
			}

		}, []);

		if (!isReady) {
			return null;
		}

		return <WrappedComponent
					{...propsToPass}
					secondaryDisableWithData={false}
					SecondaryRepository={LocalSecondaryRepository}
					secondaryModel={secondaryModel}
					secondaryData={secondaryData}
					secondaryFields={secondaryFields}
					secondaryIdField={secondaryIdField}
					secondaryDisplayField={secondaryDisplayField}
					secondaryIdIx={localIdIx}
					secondaryDisplayIx={localDisplayIx}
				/>;
	};
}