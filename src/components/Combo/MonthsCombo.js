import ArrayCombo from './ArrayCombo';
import withSelection from '../Hoc/withSelection';

const data = [
	[ 1, 'January', ],
	[ 2, 'February', ],
	[ 3, 'March', ],
	[ 4, 'April', ],
	[ 5, 'May', ],
	[ 6, 'June', ],
	[ 7, 'July', ],
	[ 8, 'August', ],
	[ 9, 'September', ],
	[ 10, 'October', ],
	[ 11, 'November', ],
	[ 12, 'December', ],
];

function MonthsCombo(props) {
	return <ArrayCombo
				data={data}
				{...props}
			/>;
}

export default withSelection(MonthsCombo);