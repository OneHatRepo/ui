// Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.
import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Icon } from 'native-base';

function SvgComponent(props) {
	return (
		<Icon
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 448 512"
			{...props}
		>
			<Path d="M128 136c0-22.1-17.9-40-40-40H40c-22.1 0-40 17.9-40 40v48c0 22.1 17.9 40 40 40h48c22.1 0 40-17.9 40-40v-48zm0 192c0-22.1-17.9-40-40-40H40c-22.1 0-40 17.9-40 40v48c0 22.1 17.9 40 40 40h48c22.1 0 40-17.9 40-40v-48zm32-192v48c0 22.1 17.9 40 40 40h48c22.1 0 40-17.9 40-40v-48c0-22.1-17.9-40-40-40h-48c-22.1 0-40 17.9-40 40zm128 192c0-22.1-17.9-40-40-40h-48c-22.1 0-40 17.9-40 40v48c0 22.1 17.9 40 40 40h48c22.1 0 40-17.9 40-40v-48zm32-192v48c0 22.1 17.9 40 40 40h48c22.1 0 40-17.9 40-40v-48c0-22.1-17.9-40-40-40h-48c-22.1 0-40 17.9-40 40zm128 192c0-22.1-17.9-40-40-40h-48c-22.1 0-40 17.9-40 40v48c0 22.1 17.9 40 40 40h48c22.1 0 40-17.9 40-40v-48z" />
		</Icon>
	)
}

export default SvgComponent
