import * as React from "react"
import Svg, { G, Path } from "react-native-svg"
import { Icon } from 'native-base';

function SvgComponent(props) {
	return (
		<Icon
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 508.3 508.87"
			{...props}
		>
			<Path d="M253.87 387.44c73.46 0 133-59.55 133-133s-59.55-133-133-133-133 59.55-133 133 59.55 133 133 133z" />
			<Path d="M0 0H508.3V508.87H0z" fill="none" />
		</Icon>
	)
}

export default SvgComponent
