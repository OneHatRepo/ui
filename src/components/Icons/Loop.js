import * as React from "react"
import { Path } from "react-native-svg"
import { Icon } from 'native-base';

function SvgComponent(props) {
	return (
		<Icon
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 286 214.38"
			{...props}
		>
			<Path d="M235 25.38h-11v34h11c6.83 0 14 6 14 8.64v103.73a8.64 8.64 0 01-8.63 8.63H42.63a8.64 8.64 0 01-8.63-8.63V68a8.65 8.65 0 018.63-8.64h87v25.41L203 42.38 129.6 0v25.38h-87A42.68 42.68 0 000 68v103.75a42.67 42.67 0 0042.63 42.63h197.74A42.67 42.67 0 00283 171.75V68c0-24.38-25.34-42.62-48-42.62z" />
		</Icon>
	)
}

export default SvgComponent
