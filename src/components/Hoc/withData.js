import { useState, useEffect, } from 'react';
import oneHatData from '@onehat/data';
import _ from 'lodash';

// Keeps track of LocalRepository.
// If a Repository was submitted, this simply passes everything through
// without changing anything. In that way, a component can have multiple
// levels of withData() applied, to no ill effect.

export default function withData(WrappedComponent) {
	return (props) => {
		const
			{
				Repository,
				uniqueRepository = false,
				model,
				// data,
				// fields,
				// idField,
				// displayField,
			} = props,
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

		if (!usePassThrough && !isReady) {
			return null;
		}

		return <WrappedComponent
					{...props}
					Repository={usePassThrough ? Repository : LocalRepository}
				/>;
	};
}