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
				fields = ['id', 'value'],
				idField = 'id',
				displayField = 'value',
			} = props,
			idIx = fields && idField ? fields.indexOf(idField) : null,
			displayIx = fields && displayField ? fields?.indexOf(displayField) : null,
			[LocalRepository, unused] = useState(model ? oneHatData.getRepository(model, uniqueRepository) : Repository);

		return <WrappedComponent
					{...props}
					Repository={LocalRepository}
					fields={fields}
					idField={idField}
					displayField={displayField}
					idIx={idIx}
					displayIx={displayIx}
				/>;
	};
}