import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Icon } from 'native-base';

function SvgComponent(props) {
	return (
		<Icon
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 512.24 402.86"
			{...props}
		>
			<Path d="M0 54.41h36.81L76.09 171.3c11.39 33.02 21.44 68.25 30.17 105.7-3.16-22.64-5.5-43.14-7.02-61.48-1.52-18.34-2.28-35.61-2.28-51.8V54.41h39.66V347.4h-37L55.41 215.52c-4.05-12.27-7.88-24.86-11.48-37.76s-6.93-26.44-9.96-40.61c-.26-1.77-.66-3.92-1.23-6.45-.57-2.53-1.23-5.44-1.99-8.73.38 3.29.69 6.1.95 8.44.25 2.34.44 4.33.57 5.98l2.09 29.79 2.09 36.24c.12 2.03.22 4.49.28 7.4.06 2.91.09 6.2.09 9.87l2.09 127.71H0V54.41zM335.39 0h30.55L191.36 402.86h-30.93L335.39 0zM418.69 54.41h30.74l62.81 292.99h-39.09l-11.01-57.12h-58.07l-11.2 57.12h-37.95l63.76-292.99zm37.76 205.32l-8.73-46.68c-5.82-31.75-10.56-65.66-14.23-101.71-1.77 17.59-4.05 35.39-6.83 53.42-2.79 18.03-6.07 37.16-9.87 57.4l-7.21 37.57h46.87z" />
		</Icon>
	)
}

export default SvgComponent