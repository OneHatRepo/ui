import React, { useState, useEffect, } from 'react';
import Combo from './Combo';
import useOneHatData from '../../data/useOneHatData';
import withSelection from '../Hoc/withSelection';


function MonthsCombo(props) {
	const
		[isReady, setIsReady] = useState(false),
		[unused, Repository] = useOneHatData('KeyValues', true);

	useEffect(() => {
		if (!Repository) {
			return () => {};
		}

		(async () => {
			await Repository.addMultiple([
				{ key: '1', value: 'January' },
				{ key: '2', value: 'February' },
				{ key: '3', value: 'March' },
				{ key: '4', value: 'April' },
				{ key: '5', value: 'May' },
				{ key: '6', value: 'June' },
				{ key: '7', value: 'July' },
				{ key: '8', value: 'August' },
				{ key: '9', value: 'September' },
				{ key: '10', value: 'October' },
				{ key: '11', value: 'November' },
				{ key: '12', value: 'December' },
			]);
			Repository.setSorters([
				{
					name: 'key',
					direction: 'ASC',
					fn: 'natsort',
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
				{...props}
			/>;
}

export default withSelection(MonthsCombo);