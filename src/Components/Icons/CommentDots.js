import { createIcon } from "../Gluestack/icon";
// Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.
import { Path, Svg } from 'react-native-svg';

const SvgComponent = createIcon({
	Root: Svg,
	viewBox: '0 0 512 512',
	path: <Path d="M256 448c141.4 0 256-93.1 256-208S397.4 32 256 32 0 125.1 0 240c0 45.1 17.7 86.8 47.7 120.9-1.9 24.5-11.4 46.3-21.4 62.9-5.5 9.2-11.1 16.6-15.2 21.6-2.1 2.5-3.7 4.4-4.9 5.7-.6.6-1 1.1-1.3 1.4l-.3.3c-4.6 4.6-5.9 11.4-3.4 17.4 2.5 6 8.3 9.9 14.8 9.9 28.7 0 57.6-8.9 81.6-19.3 22.9-10 42.4-21.9 54.3-30.6 31.8 11.5 67 17.9 104.1 17.9zM128 208a32 32 0 110 64 32 32 0 110-64zm128 0a32 32 0 110 64 32 32 0 110-64zm96 32a32 32 0 1164 0 32 32 0 11-64 0z" />
});

export default SvgComponent
