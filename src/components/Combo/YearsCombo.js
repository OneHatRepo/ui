import React, { useState, useEffect, } from 'react';
import Combo from './Combo';
import useOneHatData from '../../data/useOneHatData';
import withSelection from '../Hoc/withSelection';
import moment from 'moment';


function MonthsCombo(props) {
	const {
			startYear = parseInt(moment().format('YYYY')), // default to current year
			years = 5,
		} = props,
		[isReady, setIsReady] = useState(false),
		[unused, Repository] = useOneHatData('KeyValues', true);

	useEffect(() => {
		if (!Repository) {
			return () => {};
		}

		(async () => {

			const data = [];
			let n = 0,
				year;
			for (n = 0; n < years; n++) {  
				year = startYear + n;
				data.push({ key: year, value: year, });
			}

			await Repository.addMultiple(data);
			Repository.setSorters([
				{
					name: 'key',
					direction: 'ASC',
				}
			]);
			setIsReady(true);
		})();

	}, [Repository]);

	if (!isReady) {
		return null;
	}

	const columnsConfig = [
		{
			header: 'Month',
			fieldName: 'value',
			flex: 1,
		},
	];

	return <Combo
				Repository={Repository}
				columnsConfig={columnsConfig}
				showHeaders={false}
				disablePaging={true}
			/>;
}

export default withSelection(MonthsCombo);