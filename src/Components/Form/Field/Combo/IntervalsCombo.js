import ArrayCombo from './ArrayCombo.js';

const data = [
	['1 day', 'Daily'], 
	['1 week', 'Weekly'], 
	// ['2 week', 'Bi-weekly'], // ambibuous, don't use
	['1 month', 'Monthly'], 
	['1 quarter', 'Quarterly'], 
	['1 year', 'Yearly']
];

export default function IntervalsCombo(props) {
	return <ArrayCombo
				data={data}
				disableDirectEntry={true}
				{...props}
			/>;
}
