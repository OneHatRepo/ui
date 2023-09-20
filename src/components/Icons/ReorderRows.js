import { G, Path, Rect } from "react-native-svg"
import { createIcon } from '@gluestack-ui/themed';

const SvgComponent = createIcon({
	viewBox: '0 0 513.12 512.06',
	path: <G>
			<Path d="M1.06 0H513.1199999999999V512.06H1.06z" fill="none" />
			<Rect y={362.66} width={286.25} height={119.23} rx={39.85} ry={39.85} />
			<Rect y={197.43} width={286.25} height={119.23} rx={39.85} ry={39.85} />
			<Rect y={32.2} width={286.25} height={119.23} rx={39.85} ry={39.85} />
			<Path d="M433.7 102.19h-17.43V62.28c0-21.4-25.9-32.1-41-17l-70 70.1c-9.4 9.3-9.4 24.5 0 33.9l70 70.1c15.1 15.1 41 4.4 41-17v-39.19h17.43c9.64 0 17.48 7.84 17.48 17.48v191.21c0 9.64-7.84 17.48-17.48 17.48h-93.69v61h93.69c43.27 0 78.48-35.21 78.48-78.48V180.67c0-43.27-35.21-78.48-78.48-78.48z" />
		</G>,
});

export default SvgComponent
