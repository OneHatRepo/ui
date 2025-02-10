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
} from '../../../../Constants/MeterTypes.js';

const data = [
	[METER_TYPES__HOURS, 'Time (hrs)'],
	[METER_TYPES__MILES, 'Distance (mi/km)'],
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