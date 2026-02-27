import { createIcon } from "../Gluestack/icon";
import Svg, { Path } from 'react-native-svg';

const SvgComponent = createIcon({
	Root: Svg,
	viewBox: '0 0 45.9 67.2',
	path: <Path d="M3.1 51.2c2.7 1.4 8.9 4 15.1 4 7.9 0 11.9-3.8 11.9-8.7 0-6.4-6.4-9.3-13.1-9.3h-6.2V26.3h5.9c5.1-.1 11.6-2 11.6-7.5 0-3.9-3.2-6.8-9.6-6.8-5.3 0-10.9 2.3-13.6 3.9L2 4.9C5.9 2.4 13.7 0 22.1 0 36 0 43.7 7.3 43.7 16.2c0 6.9-3.9 12.3-11.9 15.1v.2c7.8 1.4 14.1 7.3 14.1 15.8 0 11.5-10.1 19.9-26.6 19.9-8.4 0-15.5-2.2-19.3-4.6l3.1-11.4z" />,
});

export default SvgComponent
