import { Icon } from 'native-base';
import CaretDown from '../Icons/CaretDown';
import RNPicker from 'react-native-picker-select';
import { styles as oneHatStyles } from '../../styles/styles';

import _ from 'lodash';

// NOTE: This is the only RN library I've found that works with
// testID. I don't like the way it looks, but it's functional.
// react-native-dropdown-picker is close to completion, and I like
// the looks of that one better.

function Picker(props) {
	const {
			entities,
			allowNull = true,
			enabled = true,
			styles = {
				pickerContainer: {},
				picker: {},
				pickerItem: {},
			},
			pickerProps,
			onValueChange,
			cutoff = 25,
		} = props,
		items = _.map(entities, (entity) => {
			let label = entity.displayValue;
			if (label.length > cutoff) {
				label = label.substring(0, 25) + '...';
			}
			return {
				label,
				key: entity.id,
				value: entity.id,
			};
		});
	
	let placeholder = null;
	if (props.placeholder) {
		placeholder = props.placeholder;
	}
	if (!allowNull) {
		placeholder = {};
	}

	const color = enabled ? '#1c5c73' : '#ccc',
		border = {
			borderTopColor: color,
			borderRightColor: color,
			borderBottomColor: color,
			borderLeftColor: color,
		};
	
	return <RNPicker
				onValueChange={onValueChange}
				Icon={() => <Icon as={CaretDown} style={{ ...oneHatStyles.nativePickerIcon, color, }} />}
				disabled={!enabled}
				items={items}
				placeholder={{
					label: placeholder,
					value: null,
					key: 'placeholder',
				}}
				style={{
					iconContainer: oneHatStyles.nativePickerIconContainer,
					viewContainer: {
						...oneHatStyles.nativePickerContainer,
						...border,
						...styles.pickerContainer,
					},
					inputIOS: {
						...oneHatStyles.nativePicker,
						color,
						...styles.picker,
					},
					inputAndroid: {},
					placeholder: {},
				}}
				{...pickerProps}
			/>;
}

export default Picker;
