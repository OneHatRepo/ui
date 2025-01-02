import ArrayCombo from './ArrayCombo.js';

const
	trueFalseData = [
		[true, 'Yes'],
		[false, 'No'],
	],
	oneZeroData = [
		[1, 'Yes'],
		[0, 'No'],
	];

export default function BooleanCombo(props) {
	const {
			useTrueFalse = true,
		} = props,
		data = useTrueFalse ? trueFalseData : oneZeroData;

	return <ArrayCombo
				data={data}
				menuHeight={70}
				{...props}
			/>;
}
