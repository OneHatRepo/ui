import { createIcon } from "../Gluestack/icon";
import Svg, { Path } from 'react-native-svg';

const SvgComponent = createIcon({
	Root: Svg,
	viewBox: '0 0 46.1 66.1',
	path: <Path d="M0 66.1v-9.2l8.4-7.6c14.2-12.7 21.1-20 21.3-27.6 0-5.3-3.2-9.5-10.7-9.5-5.6 0-10.5 2.8-13.9 5.4L.8 6.7C5.7 3 13.3 0 22.1 0c14.7 0 22.8 8.6 22.8 20.4 0 10.9-7.9 19.6-17.3 28l-6 5v.2h24.5v12.5H0z" />,
});

export default SvgComponent
