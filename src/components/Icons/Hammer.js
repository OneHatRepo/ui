// Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.
import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Icon } from 'native-base';

function SvgComponent(props) {
	return (
		<Icon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" {...props}>
		<Path d="M413.5 237.5c-28.2 4.8-58.2-3.6-80-25.4L295.4 174c-15-15-23.4-35.2-23.4-56.4v-12.1L192.3 62c-5.3-2.9-8.6-8.6-8.3-14.7s3.9-11.5 9.5-14l47.2-21C259.1 4.2 279 0 299.2 0h18.1c36.7 0 72 14 98.7 39.1l44.6 42c24.2 22.8 33.2 55.7 26.6 86L503 183l8-8c9.4-9.4 24.6-9.4 33.9 0l24 24c9.4 9.4 9.4 24.6 0 33.9l-88 88c-9.4 9.4-24.6 9.4-33.9 0l-24-24c-9.4-9.4-9.4-24.6 0-33.9l8-8-17.5-17.5zM27.4 377.1l233.5-194.5c3.5 4.9 7.5 9.6 11.8 14l38.1 38.1c6 6 12.4 11.2 19.2 15.7L134.9 484.6C120.4 502 98.9 512 76.3 512 34.1 512 0 477.8 0 435.7c0-22.6 10.1-44.1 27.4-58.6z" />
		</Icon>
	)
}

export default SvgComponent