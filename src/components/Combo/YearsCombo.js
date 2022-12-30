import { useState, useEffect, } from 'react';
import ArrayCombo from './ArrayCombo';
import withSelection from '../Hoc/withSelection';
import moment from 'moment';


function YearsCombo(props) {
	const {
			startYear = parseInt(moment().format('YYYY')), // default to current year
			years = 5,
		} = props,
		[isReady, setIsReady] = useState(false),
		[data, setData] = useState([]);

	useEffect(() => {
		const data = [];
		let n = 0,
			year;
		for (n = 0; n < years; n++) {  
			year = startYear + n;
			data.push([year, year]);
		}
		setData(data);
		setIsReady(true);
	}, []);

	if (!isReady) {
		return null;
	}

	return <ArrayCombo
				data={data}
				{...props}
			/>;
}

export default withSelection(YearsCombo);