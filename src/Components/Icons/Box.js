// Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.
import { createIcon } from "../Gluestack/icon";
import Svg, { Path } from 'react-native-svg';

const SvgComponent = createIcon({
	Root: Svg,
	viewBox: '0 0 448 512',
	path: <Path d="M50.7 58.5L0 160h208V32H93.7c-18.2 0-34.8 10.3-43 26.5zM240 160h208L397.3 58.5c-8.2-16.2-24.8-26.5-43-26.5H240v128zm208 32H0v224c0 35.3 28.7 64 64 64h320c35.3 0 64-28.7 64-64V192z" />,
});

export default SvgComponent
