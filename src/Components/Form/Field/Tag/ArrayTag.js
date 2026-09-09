import Tag from './Tag.js';

// This is a building block for other combos,
// which store their data as a JSON array, not a data repository.
// Need to supply data prop from outer component.
// See MonthsTag for an example.
export default function ArrayTag(props) {
	const {
		data,
		_combo = {},
		...propsToPass
	} = props;
	return <Tag
				data={data}
				fields={['id', 'value']}
				_combo={{
					idField: 'id',
					displayField: 'value',
					fields: ['id', 'value'],
					columnsConfig: ['value'],
					disableDirectEntry: true,
					data,
					..._combo,
				}}
				{...propsToPass}
			/>
}
