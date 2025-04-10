import { createIcon } from "../Gluestack/icon";
import { G, Path, Svg } from 'react-native-svg';

const SvgComponent = createIcon({
	Root: Svg,
	viewBox: '0 0 508.3 508.87',
	path: <G>
				<Path d="M253.87 387.44c73.46 0 133-59.55 133-133s-59.55-133-133-133-133 59.55-133 133 59.55 133 133 133z" />
				<Path d="M0 0H508.3V508.87H0z" fill="none" />
			</G>
});

export default SvgComponent
