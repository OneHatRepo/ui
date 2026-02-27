import { createIcon } from "../Gluestack/icon";
import Svg, { G, Path } from 'react-native-svg'

const SvgComponent = createIcon({
	Root: Svg,
	viewBox: '0 0 228.6 130.4',
	path: <G>
			<Path
				d="M163.3 79.8c9 0 16.3-7.3 16.3-16.3s-7.3-16.3-16.3-16.3H65.4c-9 0-16.3 7.3-16.3 16.3s7.3 16.3 16.3 16.3h97.9z"
			/>
			<Path d="M0 0H228.6V130.4H0z" fill="none" strokeWidth={0} />
		</G>,
});

export default SvgComponent
