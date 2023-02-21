import RadioGroup from './RadioGroup.js';

// This is a building block for other RadioGroups,
// which store their data as a JSON array, not a data repository.
// Need to supply data prop from outer component.
export default function ArrayRadioGroup(props) {
	return <RadioGroup
				idField="id"
				displayField="value"
				fields={['id', 'value']}
				{...props}
			/>;
}
