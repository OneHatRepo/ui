// Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.
import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Icon } from 'native-base';

function SvgComponent(props) {
	return (
		<Icon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" {...props}>
		<Path d="M0 112.5v309.8c0 18 10.1 35 27 41.3 87 32.5 174 10.3 261-11.9 79.8-20.3 159.6-40.7 239.3-18.9 23 6.3 48.7-9.5 48.7-33.4V89.7c0-18-10.1-35-27-41.3-87-32.5-174-10.3-261 11.9-79.8 20.3-159.6 40.6-239.3 18.8C25.6 72.8 0 88.6 0 112.5zM128 416H64v-64c35.3 0 64 28.7 64 64zM64 224v-64h64c0 35.3-28.7 64-64 64zm384 128c0-35.3 28.7-64 64-64v64h-64zm64-192c-35.3 0-64-28.7-64-64h64v64zm-128 96c0 61.9-43 112-96 112s-96-50.1-96-112 43-112 96-112 96 50.1 96 112zm-132-48c0 9.7 6.9 17.7 16 19.6V276h-4c-11 0-20 9-20 20s9 20 20 20h48c11 0 20-9 20-20s-9-20-20-20h-4v-68c0-11-9-20-20-20h-16c-11 0-20 9-20 20z" />
		</Icon>
	)
}

export default SvgComponent