import {
	Icon,
	Row,
	Select,
} from 'native-base';
import CaretDown from '../Icons/CaretDown';
import testProps from '../../functions/testProps';
import _ from 'lodash';

export default function Picker(props) {
	const {
			entities,
			allowNull = true,
			cutoff = 25,
			nullLabel = 'None',
			_select = {},
		} = props;

	let items = [];
	_.each(entities, (entity) => {
		let label = entity.displayValue;
		if (!label) {
			return;
		}
		if (label.length > cutoff) {
			label = label.substring(0, 25) + '...';
		}
		items.push(<Select.Item key={entity.id} label={label} value={entity.id} {...testProps('PickerItem-' + entity.id)} />);
	});

	if (allowNull) {
		items.unshift(<Select.Item key="null" label={nullLabel} value={null} {...testProps('PickerItem-null')} />);
	}

	if (!items.length) {
		return null;
	}

	const selectedValue = _select.selectedValue;
	if (!allowNull && !selectedValue) {
		_select.borderColor = '#f00';
		_select.borderWidth = 1;
	}

	// Set an explicit dropdownIcon to add margin to it, so it looks better
	return <Row {...props}>
				<Select
					placeholder="Select"
					isDisabled={false}
					dropdownIcon={<Icon as={CaretDown} size="sm" mr={3} color="trueGray.500" />}
					{..._select}
				>{items}</Select>
			</Row>;
}

