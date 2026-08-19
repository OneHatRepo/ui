import { createIcon } from "../Gluestack/icon";
// Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.
import { Path, Svg } from 'react-native-svg';

const SvgComponent = createIcon({
	Root: Svg,
	viewBox: '0 0 640 640',
	path: <Path d="M176 168c13.3 0 24-10.7 24-24s-10.7-24-24-24-24 10.7-24 24 10.7 24 24 24zm80-24c0 32.8-19.7 61-48 73.3V240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48v-22.7c-28.3-12.3-48-40.5-48-73.3 0-44.2 35.8-80 80-80s80 35.8 80 80c0 32.8-19.7 61-48 73.3V240c0 61.9-50.1 112-112 112h-32v70.7c28.3 12.3 48 40.5 48 73.3 0 44.2-35.8 80-80 80s-80-35.8-80-80c0-32.8 19.7-61 48-73.3V352h-32c-61.9 0-112-50.1-112-112v-22.7C115.7 205 96 176.8 96 144c0-44.2 35.8-80 80-80s80 35.8 80 80zm208 24c13.3 0 24-10.7 24-24s-10.7-24-24-24-24 10.7-24 24 10.7 24 24 24zM344 496c0-13.3-10.7-24-24-24s-24 10.7-24 24 10.7 24 24 24 24-10.7 24-24z" />,
});

export default SvgComponent
