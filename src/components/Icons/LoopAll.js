import * as React from "react"
import Svg, { G, Path } from "react-native-svg"
import { Icon } from 'native-base';

function SvgComponent(props) {
	return (
		<Icon
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 286 214.38"
			{...props}
		>
			<Path d="M235 25.38h-11v34h11c6.83 0 14 6 14 8.63v103.74a8.64 8.64 0 01-8.63 8.63H42.63a8.64 8.64 0 01-8.63-8.63V68a8.64 8.64 0 018.63-8.63h87v25.4L203 42.38 129.6 0v25.38h-87A42.68 42.68 0 000 68v103.75a42.67 42.67 0 0042.63 42.63h197.74A42.67 42.67 0 00283 171.75V68c0-24.38-25.34-42.62-48-42.62z" />
			<Path d="M78.11 97.63h20.8l19.8 65h-18.2L93.11 131c-1.6-6.2-3.2-14.1-4.8-20.6h-.4c-1.4 6.6-3 14.4-4.6 20.6l-7.4 31.6h-17.6zm-5.6 37.9h31.8v13.3h-31.8zM123.91 97.63h17.2v50.6h24.6v14.4h-41.8zM176.91 97.63h17.2v50.6h24.6v14.4h-41.8z" />
		</Icon>
	)
}

export default SvgComponent
