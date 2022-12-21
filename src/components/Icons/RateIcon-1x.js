import * as React from "react"
import Svg, { G, Path } from "react-native-svg"
import { Icon } from 'native-base';

function SvgComponent(props) {
	return (
		<Icon
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 142.79 142.79"
		{...props}
		>
			<Path d="M0 0H142.79V142.79H0z" fill="none" />
			<Path d="M41 89.17h11.45v-36.8h-9.11v-4.15A30.25 30.25 0 0054 44.55h4.9v44.62h10.32v5.37H41z" />
			<Path d="M81.45 74.66L69.93 56.44h7L82 64.8c1.17 2.09 2.47 4.25 3.73 6.34h.32c1.15-2.09 2.29-4.25 3.44-6.34l4.65-8.36h6.72L89.35 75.33l12.45 19.21h-7l-5.62-8.86c-1.32-2.29-2.71-4.64-4.14-6.84h-.31c-1.31 2.2-2.55 4.52-3.85 6.84l-5.17 8.86H69z" />
		</Icon>
	)
}

export default SvgComponent
