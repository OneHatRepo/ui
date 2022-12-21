/*
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import Picker from './Picker';

export default function MonthPicker(props) {
	const entities = [
			{ id: '01', displayValue: 'January (01)', },
			{ id: '02', displayValue: 'February (02)', },
			{ id: '03', displayValue: 'March (03)', },
			{ id: '04', displayValue: 'April (04)', },
			{ id: '05', displayValue: 'May (05)', },
			{ id: '06', displayValue: 'June (06)', },
			{ id: '07', displayValue: 'July (07)', },
			{ id: '08', displayValue: 'August (08)', },
			{ id: '09', displayValue: 'September (09)', },
			{ id: '10', displayValue: 'October (10)', },
			{ id: '11', displayValue: 'November (11)', },
			{ id: '12', displayValue: 'December (12)', },
		];
	return <Picker
				entities={entities}
				{...props}
			/>;
}
