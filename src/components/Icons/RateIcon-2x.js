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
			<Path d="M39.64 90.72c15-15 23.52-24 23.52-32.1 0-5.71-3.1-9.76-9.48-9.76-4.18 0-7.78 2.65-10.63 6l-3.74-3.64c4.18-4.59 8.69-7.6 15.16-7.6 9.24 0 15 5.83 15 14.72 0 9.38-8.62 18.7-20.41 31.1 2.71-.22 5.82-.43 8.41-.43h14.46v5.54H39.64z" />
			<Path d="M83.14 74.66L71.61 56.44h7l5.1 8.36c1.17 2.09 2.47 4.25 3.73 6.34h.31c1.16-2.09 2.29-4.25 3.45-6.34l4.65-8.36h6.72L91 75.33l12.45 19.21h-7l-5.61-8.86c-1.32-2.29-2.72-4.64-4.14-6.84h-.31c-1.31 2.2-2.55 4.52-3.86 6.84l-5.16 8.86h-6.68z" />
		</Icon>
	)
}

export default SvgComponent
