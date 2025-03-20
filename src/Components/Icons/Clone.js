import { createIcon } from "../Gluestack/icon";
// Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.
import { Path, Svg } from 'react-native-svg';

const SvgComponent = createIcon({
	Root: Svg,
	viewBox: '0 0 512 512',
	path: <Path d="M0 448c0 35.3 28.7 64 64 64h224c35.3 0 64-28.7 64-64v-64H224c-53 0-96-43-96-96V160H64c-35.3 0-64 28.7-64 64v224zm224-96h224c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H224c-35.3 0-64 28.7-64 64v224c0 35.3 28.7 64 64 64z" />,
});

export default SvgComponent
