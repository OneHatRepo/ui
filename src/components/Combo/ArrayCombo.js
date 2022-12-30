import Combo from './Combo';

export default function ArrayCombo(props) {
	return <Combo
				idField="id"
				displayField="value"
				fields={['id', 'value']}
				columnsConfig={['value']}
				{...props}
			/>;
}
