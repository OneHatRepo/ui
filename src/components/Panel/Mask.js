import {
	Box,
} from 'native-base';
import {
	CURRENT_MODE,
	UI_MODE_WEB,
	UI_MODE_REACT_NATIVE,
} from '../../constants/UiModes.js';

export default function Mask(props) {
	if (CURRENT_MODE === UI_MODE_WEB) {

		return <div className="mask"></div>;

	} else if (CURRENT_MODE === UI_MODE_REACT_NATIVE) {

		return <Box position="absolute" h="100%" w="100%" bg="trueGray.400:alpha.20" zIndex={100000}></Box>;

	}
}
