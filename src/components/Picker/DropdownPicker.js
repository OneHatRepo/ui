import DropdownPicker from 'react-native-dropdown-picker';
import { styles as oneHatStyles } from '../../styles/styles';
import _ from 'lodash';

// NOTE: The NPM library react-native-dropdown-picker is not yet
// compatible with testID.
// https://github.com/hossein-zare/react-native-dropdown-picker/issues/127

/* USAGE:
<Picker
	placeholder="Select Venue"
	onValueChange={()=>{}}
	entities={[
		{ displayValue: 'key0', id: 'key0', },
		{ displayValue: 'key1', id: 'key1', },
		{ displayValue: 'key2', id: 'key2', },
		{ displayValue: 'key3', id: 'key3', },
		{ displayValue: 'key4', id: 'key4', },
		{ displayValue: 'key5', id: 'key5', },
		{ displayValue: 'key6', id: 'key6', },
		{ displayValue: 'key7', id: 'key7', },
		{ displayValue: 'key8', id: 'key8', },
		{ displayValue: 'key9', id: 'key9', },
		{ displayValue: 'key10', id: 'key10', },
	]}
	testID="test1"
	accessibilityLabel="test2"
	accessible={true}
/>*/


function Picker(props) {
	const {
			entities,
			allowNull = true,
			enabled = true,
			styles = {
				pickerContainer: {},
				picker: {},
				pickerItem: {},
				label: {},
			},
			pickerProps,
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
	
	return <DropdownPicker
				disabled={!enabled}
				items={items}
				containerStyle={{
					...oneHatStyles.pickerContainer,
					...styles.pickerContainer,
					...border,
				}}
				style={{
					...oneHatStyles.picker,
					...styles.picker,
				}}
				labelStyle={{
					...styles.label,
				}}
				itemStyle={{
					...oneHatStyles.pickerItem, 
					...styles.pickerItem,
				}}
				other={{
					// header: {...oneHatStyles.pickerTitle, },
					// text: { color, }
				}}
				placeholder={placeholder}
				{...pickerProps}
			/>;
}

export default Picker;
