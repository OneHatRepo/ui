import { createIcon } from "../Gluestack/icon";
// Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.
import { Path, Svg } from 'react-native-svg';

const SvgComponent = createIcon({
	Root: Svg,
	viewBox: '0 0 512 512',
	path: <Path d="M40 48c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24V72c0-13.3-10.7-24-24-24H40zm152 16c-17.7 0-32 14.3-32 32s14.3 32 32 32h288c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32h288c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32h288c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zM16 232v48c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24v-48c0-13.3-10.7-24-24-24H40c-13.3 0-24 10.7-24 24zm24 136c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24v-48c0-13.3-10.7-24-24-24H40z" />,
});

export default SvgComponent
