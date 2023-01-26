import ArrayCombo from './ArrayCombo';

const data = [
	['+1 day', 'Daily'], 
	['+1 week', 'Weekly'], 
	['+2 week', 'Bi-weekly'], 
	['+1 month', 'Monthly'], 
	['+3 month', 'Quarterly'], 
	['+1 year', 'Yearly']
];

export default function IntervalsCombo(props) {
	return <ArrayCombo
				data={data}
				{...props}
			/>;
}
