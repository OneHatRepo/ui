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
			<Path d="M17.11 90.6a4.67 4.67 0 114.67 4.88 4.72 4.72 0 01-4.67-4.88zM28.77 90.72c15-15 23.52-24 23.52-32.1 0-5.71-3.1-9.76-9.48-9.76-4.18 0-7.78 2.65-10.63 6l-3.74-3.64c4.18-4.59 8.68-7.6 15.16-7.6 9.24 0 15 5.83 15 14.72 0 9.38-8.61 18.7-20.4 31.1 2.71-.23 5.8-.44 8.41-.44h14.44v5.54H28.77z" />
			<Path d="M60.64 88.62l3.18-4.2c3 3 6.73 5.69 12.61 5.69 6.09 0 10.93-4.42 10.93-11.38s-4.2-11-10.6-11c-3.46 0-5.6 1.06-8.58 3l-3.42-2.17 1.65-24.07h25v5.54H72.06l-1.32 14.9a15 15 0 017.68-2.07c8.52 0 15.49 4.86 15.49 15.66s-8.16 17-16.83 17a21.92 21.92 0 01-16.44-6.9z" />
			<Path d="M105.33 74.66L93.81 56.44h7l5.1 8.36c1.17 2.09 2.46 4.25 3.73 6.34h.31c1.15-2.09 2.29-4.25 3.44-6.34l4.61-8.36h6.71l-11.48 18.89 12.45 19.21h-7l-5.61-8.86c-1.33-2.29-2.72-4.64-4.14-6.84h-.32c-1.31 2.2-2.54 4.52-3.85 6.84l-5.16 8.86h-6.72z" />
		</Icon>
	)
}

export default SvgComponent