// Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.
import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Icon } from 'native-base';

function SvgComponent(props) {
  return (
    <Icon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}>
      <Path d="M256 512a256 256 0 100-512 256 256 0 100 512z" />
    </Icon>
  )
}

export default SvgComponent
