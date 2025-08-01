import { createIcon } from "../Gluestack/icon";
// Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.
import Svg, { Path } from "react-native-svg"

const SvgComponent = createIcon({
	Root: Svg,
	viewBox: '0 0 320 512',
	path: <Path d="M0 55.2V426c0 12.2 9.9 22 22 22 6.3 0 12.4-2.7 16.6-7.5l82.6-94.5 58.1 116.3c7.9 15.8 27.1 22.2 42.9 14.3s22.2-27.1 14.3-42.9L179.8 320h118.1c12.2 0 22.1-9.9 22.1-22.1 0-6.3-2.7-12.3-7.4-16.5L38.6 37.9c-4.3-3.8-9.7-5.9-15.4-5.9C10.4 32 0 42.4 0 55.2z" />,
});

export default SvgComponent
