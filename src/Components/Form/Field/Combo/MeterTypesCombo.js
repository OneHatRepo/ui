/**
 * COPYRIGHT NOTICE
 * This file is categorized as "Custom Source Code"
 * and is subject to the terms and conditions defined in the
 * "LICENSE.txt" file, which is part of this source code package.
 */

import ArrayCombo from './ArrayCombo.js';
import {
	METER_TYPES__HOURS,
	METER_TYPES__MILES,
	METER_TYPES__HOURS_TEXT,
	METER_TYPES__MILES_TEXT,
} from '../../../../Constants/MeterTypes.js';

const data = [
	[METER_TYPES__HOURS, METER_TYPES__HOURS_TEXT],
	[METER_TYPES__MILES, METER_TYPES__MILES_TEXT],
];
function MeterTypesCombo(props) {
	return <ArrayCombo
				reference="MeterTypeCombo"
				data={data}
				disableDirectEntry={true}
				{...props}
			/>;
}

export default MeterTypesCombo;