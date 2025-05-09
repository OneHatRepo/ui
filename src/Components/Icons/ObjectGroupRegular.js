import { createIcon } from "../Gluestack/icon";
// Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.
import { Path, Svg } from 'react-native-svg';

const SvgComponent = createIcon({
	Root: Svg,
	viewBox: '0 0 576 512',
	path: <Path d="M128 160c0-17.7 14.3-32 32-32h128c17.7 0 32 14.3 32 32v96c0 17.7-14.3 32-32 32H160c-17.7 0-32-14.3-32-32v-96zm160 160c35.3 0 64-28.7 64-64v-32h64c17.7 0 32 14.3 32 32v96c0 17.7-14.3 32-32 32H288c-17.7 0-32-14.3-32-32v-32h32zM48 115.8c-9.82-9.7-16-21.58-16-35.8 0-26.51 21.49-48 48-48 14.22 0 26.1 6.18 35.8 16h344.4c8.8-9.82 21.6-16 35.8-16 26.5 0 48 21.49 48 48 0 14.22-6.2 26.1-16 35.8v280.4c9.8 8.8 16 21.6 16 35.8 0 26.5-21.5 48-48 48-14.2 0-27-6.2-35.8-16H115.8c-9.7 9.8-21.58 16-35.8 16-26.51 0-48-21.5-48-48 0-14.2 6.18-27 16-35.8V115.8zm48 9.5v261.4c13.6 4.9 24.4 15.7 29.3 29.3h325.4c4.9-13.6 15.7-24.4 29.3-29.3V125.3c-13.6-4.9-24.4-15.7-29.3-29.3H125.3c-4.9 13.6-15.7 24.4-29.3 29.3z" />
});

export default SvgComponent
