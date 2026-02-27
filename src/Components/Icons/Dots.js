import { createIcon } from "../Gluestack/icon";
import Svg, { G, Circle } from 'react-native-svg';

const SvgComponent = createIcon({
	Root: Svg,
	viewBox: '0 0 355.2 355.2',
	path: <G>
				<Circle cx={45.6} cy={45.6} r={45.6} />
				<Circle cx={177.6} cy={45.6} r={45.6} />
				<Circle cx={45.6} cy={177.6} r={45.6} />
				<Circle cx={309.6} cy={45.6} r={45.6} />
				<Circle cx={177.6} cy={177.6} r={45.6} />
				<Circle cx={309.6} cy={177.6} r={45.6} />
				<Circle cx={45.6} cy={309.6} r={45.6} />
				<Circle cx={177.6} cy={309.6} r={45.6} />
				<Circle cx={309.6} cy={309.6} r={45.6} />
			</G>,
});

export default SvgComponent
