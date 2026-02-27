import { createIcon } from "../Gluestack/icon";
import Svg, { Path } from 'react-native-svg';

const SvgComponent = createIcon({
	Root: Svg,
	viewBox: '0 0 29.8 65',
	path: <Path d="M15.1 13.5h-.2L2.5 19.4 0 8l17.2-8h12.6v65H15.1V13.5z" />,
});

export default SvgComponent
