import Picker from './Picker';
import moment from 'moment';

export default function YearPicker(props) {
	const {
			displayFormat = 'YYYY', // momentjs format
			submitFormat = 'YYYY', // momentjs format
			years = 5,
		} = props,
		entities = [];

	let n = 0,
		submitValue,
		displayValue;
	for (n; n < years; n++) {
		submitValue = '' + (parseInt(moment().format(submitFormat)) + n);
		displayValue = '' + (parseInt(moment().format(displayFormat)) + n);
		entities.push({ id: submitValue, displayValue, });
	}
	return <Picker
				entities={entities}
				{...props}
			/>;
}
