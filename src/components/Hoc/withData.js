import { useState, useEffect, } from 'react';
import oneHatData from '@onehat/data';
import _ from 'lodash';

// Keeps track of LocalRepository.
// If a Repository was submitted, this simply passes everything through
// without changing anything. In that way, a component can have multiple
// levels of withData() applied, to no ill effect.

// This is the primary link between @onehat/data and the UI components

export default function withData(WrappedComponent) {
	return (props) => {
		const
			{
				Repository,
				uniqueRepository = false,
				model,
				fields,
				idField,
				displayField,
			} = props,
			idIx = fields && idField ? fields.indexOf(idField) : null,
			displayIx = fields && displayField ? fields?.indexOf(displayField) : null,
			usePassThrough = !!Repository,
			[LocalRepository, setLocalRepository] = useState(),
			[isReady, setIsReady] = useState(false);

		useEffect(() => {
			if (usePassThrough) {
				return () => {};
			}
			let LocalRepository = Repository;
			if (model) {
				LocalRepository = oneHatData.getRepository(model, uniqueRepository);
			}
			if (LocalRepository) {
				// set up @onehat/data repository
				setLocalRepository(LocalRepository);
			}
			setIsReady(true);
		}, []);


		// useEffect(() => {
		// 	if (!LocalRepository) {
		// 		return () => {};
		// 	}

		// 	LocalRepository.setFilters(filters);

		// }, [LocalRepository, filters]);

		if (!usePassThrough && !isReady) {
			return null;
		}

		return <WrappedComponent
					{...props}
					Repository={usePassThrough ? Repository : LocalRepository}
					idIx={idIx}
					displayIx={displayIx}
				/>;
	};
}