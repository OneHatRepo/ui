import { createIcon } from "../Gluestack/icon";
// Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.
import { Path, Svg } from 'react-native-svg';

const SvgComponent = createIcon({
	Root: Svg,
	viewBox: '0 0 512 512',
	path: <Path d="M175 175c9.4-9.3 24.6-9.3 33.1 0l47 47.1L303 175c9.4-9.3 24.6-9.3 33.1 0 10.2 9.4 10.2 24.6 0 33.1l-46.2 47 46.2 47.9c10.2 9.4 10.2 24.6 0 33.1-8.5 10.2-23.7 10.2-33.1 0l-47.9-46.2-47 46.2c-8.5 10.2-23.7 10.2-33.1 0-9.3-8.5-9.3-23.7 0-33.1l47.1-47.9-47.1-47c-9.3-8.5-9.3-23.7 0-33.1zm337 81c0 141.4-114.6 256-256 256S0 397.4 0 256 114.6 0 256 0s256 114.6 256 256zM256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48z" />,
});

export default SvgComponent
