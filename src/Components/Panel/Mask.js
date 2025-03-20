import {
	Box,
} from '@project-components/Gluestack';
import {
	CURRENT_MODE,
	UI_MODE_WEB,
	UI_MODE_NATIVE,
} from '../../Constants/UiModes.js';

export default function Mask(props) {
	if (CURRENT_MODE === UI_MODE_WEB) {

		return <div className="mask"></div>;

	} else if (CURRENT_MODE === UI_MODE_NATIVE) {

		return <Box className="absolute h-full w-full bg-grey-400:alpha.20 z-100000"></Box>;

	}
}
