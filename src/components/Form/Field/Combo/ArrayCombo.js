import Combo from './Combo';

// This is a building block for other combos,
// which store their data as a JSON array, not a data repository.
// Need to supply data prop from outer component.
// See MonthsCombo for an example.
export default function ArrayCombo(props) {
	return <Combo
				idField="id"
				displayField="value"
				fields={['id', 'value']}
				columnsConfig={['value']}
				{...props}
			/>;
}
