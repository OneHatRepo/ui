import { createIcon } from "../Gluestack/icon";
import Svg, { Path } from 'react-native-svg';

const SvgComponent = createIcon({
	Root: Svg,
	viewBox: '0 0 51 65',
	path: <Path d="M28.8 65V49.5H0v-9.9L24.6 0h18.6v38.1H51v11.4h-7.8V65H28.8zm0-26.9V23.7c0-3.9.2-7.9.5-12.1h-.4c-2.1 4.2-3.8 8-6 12.1l-8.7 14.2v.2h14.6z" />,
});

export default SvgComponent
