import CheckboxGroup from './CheckboxGroup.js';

// This is a building block for other CheckboxGroups,
// which store their data as a JSON array, not a data repository.
// Need to supply data prop from outer component.
export default function ArrayCheckboxGroup(props) {
	return <CheckboxGroup
				idField="id"
				displayField="value"
				fields={['id', 'value']}
				{...props}
			/>;
}
