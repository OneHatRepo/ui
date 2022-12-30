import { useState, useEffect, } from 'react';
import {
	SELECTION_MODE_SINGLE,
} from '../../constants/Selection';
import ArrayCombo from './ArrayCombo';
import withSelection from '../Hoc/withSelection';


function BooleanCombo(props) {
	const
		{
			useTrueFalse = true,
			// forceSelection = true,
			// typeAheadDelay = 100,
		} = props,
		[isReady, setIsReady] = useState(false),
		[data, setData] = useState([]);
		
	useEffect(() => {
		let data;
		if (useTrueFalse) {
			data = [
				['true', 'Yes'],
				['false', 'No'],
			];
		} else {
			data = [
				[1, 'Yes'],
				[0, 'No'],
			];
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
				selectionMode={SELECTION_MODE_SINGLE}
			/>;
}

export default withSelection(BooleanCombo);