import { createIcon } from "../Gluestack/icon";
// Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.
import { Path, Svg } from 'react-native-svg';

const SvgComponent = createIcon({
	Root: Svg,
	viewBox: '0 0 448 512',
	path: <Path d="M168 32H24C10.7 32 0 42.7 0 56v144c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2l40-40 79 79-79 79-40-40c-6.9-6.9-17.2-8.9-26.2-5.2S0 302.3 0 312v144c0 13.3 10.7 24 24 24h144c9.7 0 18.5-5.8 22.2-14.8s1.7-19.3-5.2-26.2l-40-40 79-79 79 79-40 40c-6.9 6.9-8.9 17.2-5.2 26.2S270.3 480 280 480h144c13.3 0 24-10.7 24-24V312c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2l-40 40-79-79 79-79 40 40c6.9 6.9 17.2 8.9 26.2 5.2S448 209.7 448 200V56c0-13.3-10.7-24-24-24H280c-9.7 0-18.5 5.8-22.2 14.8S256.1 66.1 263 73l40 40-79 79-79-79 40-40c6.9-6.9 8.9-17.2 5.2-26.2S177.7 32 168 32z" />,
});

export default SvgComponent
