import { createIcon } from "../Gluestack/icon";
// Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.
import { Path, Svg } from 'react-native-svg';

const SvgComponent = createIcon({
	Root: Svg,
	viewBox: '0 0 640 640',
	path: <Path d="M256 160v64h128v-64c0-35.3-28.7-64-64-64s-64 28.7-64 64zm-64 64v-64c0-70.7 57.3-128 128-128s128 57.3 128 128v64c35.3 0 64 28.7 64 64v224c0 35.3-28.7 64-64 64H192c-35.3 0-64-28.7-64-64V288c0-35.3 28.7-64 64-64z" />,
});

export default SvgComponent
