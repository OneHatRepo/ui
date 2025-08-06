import {
	TextNative,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import {
	METER_TYPES__HOURS,
	METER_TYPES__MILES,
	METER_TYPES__HOURS_TEXT,
	METER_TYPES__MILES_TEXT,
} from '../../Constants/MeterTypes';

import UiGlobals from '../../UiGlobals';

export default function MeterTypeText(props) {
	const styles = UiGlobals.styles;

	let className = clsx(
		'Text',
		'flex-1',
		'px-3',
		'py-2',
		styles.FORM_TEXT_CLASSNAME,
	);
	if (props.className) {
		className += ' ' + props.className;
	}
	let meterType = '';
	switch(props.value) {
		case METER_TYPES__HOURS:
			meterType = METER_TYPES__HOURS_TEXT;
			break;
		case METER_TYPES__MILES:
			meterType = METER_TYPES__MILES_TEXT;
			break;
		default:
			meterType = 'unknown';
			break;
	}
	
	return <TextNative
				{...props}
				className={className}
			>{meterType}</TextNative>;
};
