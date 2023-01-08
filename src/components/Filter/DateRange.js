import { useState, useEffect } from 'react';
import {
	Row,
	Text,
} from 'native-base';
import DatePicker from '../Picker/Date';
import moment from 'moment';
import _ from 'lodash';

export default function DateRangeFilter(props) {
	const {
			Repository,
			propertyName,
			defaultStartDate,
			defaultEndDate,
		} = props,
		[startDate, setStartDate] = useState(defaultStartDate),
		[endDate, setEndDate] = useState(defaultEndDate);

	const dateSettings = _.assign({}, {
			mode: 'date',
			// display: 'default', // Android only
			// onChange: () => {},
			// value: null,
			// timeZoneOffsetInMinutes: null, // iOS only
			// locale: 'en', // iOS only
			// is24Hour: false, // Android only
			// minuteInterval: 15, // iOS only
		}, props.dateSettings);

	return <Row
				key={'DateRangeFilter-' + propertyName}
				justifyContent="center"
				alignItems="center"
			>
				<DatePicker
					{...dateSettings}
					date={startDate}
					onChange={setStartDate}
					placeHolderText="Start Date"
					textStyle={{color:'#000'}}
				/>
				<Text px={3}>to</Text>
				<DatePicker
					{...dateSettings}
					date={endDate}
					onChange={setEndDate}
					placeHolderText="End Date"
					textStyle={{color:'#00'}}
				/>
			</Row>;
};
