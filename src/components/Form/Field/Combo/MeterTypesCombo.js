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
	[METER_TYPES__HOURS, 'Hours'],
	[METER_TYPES__MILES, 'Miles'],
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