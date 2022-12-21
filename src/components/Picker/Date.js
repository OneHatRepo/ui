import { useState } from 'react';
import {
	Box,
	Button,
	Icon,
} from 'native-base';
import Calendar from '../Icons/Calendar';
import DateTimePickerModal from 'react-native-modal-datetime-picker'; // https://github.com/mmazzarolo/react-native-modal-datetime-picker
import DateTimePicker from '@react-native-community/datetimepicker'; // https://github.com/react-native-datetimepicker/datetimepicker
import Formatters from '@onehat/data/src/Util/Formatters';
import _ from 'lodash';

export default function DatePicker(props) {
	const {
			placeholderText,
			date,
			onChange,
			format,
			mode = 'date',
		} = props,
		[isVisible, setIsVisible] = useState(false),
		show = () => {
			setIsVisible(true);
		},
		hide = () => {
			setIsVisible(false);
		},
		handleConfirm = (date) => {
			hide();
			onChange(date);
		},
		propsToPass = _.omit(props, ['onChange', 'textStyle', 'placeholderText']);

	let title = placeholderText;
	if (!_.isNil(date)) {
		switch(mode) {
			case 'date':
				title = format ? Formatters.FormatDate(date, format) : Formatters.FormatDate(date);;
				break;
			case 'time':
				title = format ? Formatters.FormatTime(date, format) : Formatters.FormatTime(date);
				break;
			case 'datetime':
				title = format ? Formatters.FormatDateTime(date, format) : Formatters.FormatDateTime(date);
				break;
			default:
				// do nothing
		}
	}
	
	// return <Row>
	// 			<Icon as={Calendar} />
	// 			<Text>{title}</Text>
	// 			{isVisible && <DateTimePicker
	// 								value={date}
	// 								mode={mode}
	// 								display="default"
	// 								onChange={(e, date) => {
	// 									onChange(date);
	// 								}}
	// 								{...propsToPass}
	// 							/>}
	// 		</Row>;
	
	return <Box>
				<Button
					leftIcon={<Icon as={Calendar} />}
					onPress={show}
				>{title}</Button>
				<DateTimePickerModal
					isVisible={isVisible}
					mode="date"
					onConfirm={handleConfirm}
					onCancel={hide}
					{...propsToPass}
				/>
			</Box>;
};
