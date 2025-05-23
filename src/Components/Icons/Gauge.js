import { createIcon } from "../Gluestack/icon";
// Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.
import { Path, Svg } from 'react-native-svg';

const SvgComponent = createIcon({
	Root: Svg,
	viewBox: '0 0 512 512',
	path: <Path d="M0 256a256 256 0 11512 0 256 256 0 11-512 0zm320 96c0-26.9-16.5-49.9-40-59.3V88c0-13.3-10.7-24-24-24s-24 10.7-24 24v204.7c-23.5 9.5-40 32.5-40 59.3 0 35.3 28.7 64 64 64s64-28.7 64-64zM144 176a32 32 0 100-64 32 32 0 100 64zm-16 80a32 32 0 10-64 0 32 32 0 1064 0zm288 32a32 32 0 100-64 32 32 0 100 64zm-16-144a32 32 0 10-64 0 32 32 0 1064 0z" />,
});

export default SvgComponent
