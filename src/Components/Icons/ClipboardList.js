import { createIcon } from "../Gluestack/icon";
// Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.
import { Path, Svg } from 'react-native-svg';

const SvgComponent = createIcon({
	Root: Svg,
	viewBox: '0 0 384 512',
	path: <Path d="M192 0c-41.8 0-77.4 26.7-90.5 64H64C28.7 64 0 92.7 0 128v320c0 35.3 28.7 64 64 64h256c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64h-37.5C269.4 26.7 233.8 0 192 0zm0 64a32 32 0 110 64 32 32 0 110-64zM72 272a24 24 0 1148 0 24 24 0 11-48 0zm104-16h128c8.8 0 16 7.2 16 16s-7.2 16-16 16H176c-8.8 0-16-7.2-16-16s7.2-16 16-16zM72 368a24 24 0 1148 0 24 24 0 11-48 0zm88 0c0-8.8 7.2-16 16-16h128c8.8 0 16 7.2 16 16s-7.2 16-16 16H176c-8.8 0-16-7.2-16-16z" />
});

export default SvgComponent
