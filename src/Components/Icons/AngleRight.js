import { createIcon } from "../Gluestack/icon";
// Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.
import { Path, Svg } from 'react-native-svg';

const SvgComponent = createIcon({
	Root: Svg,
	viewBox: '0 0 320 512',
	path: <Path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z" />,
});

export default SvgComponent
