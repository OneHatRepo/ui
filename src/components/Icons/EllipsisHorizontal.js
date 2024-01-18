// Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.
import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Icon } from 'native-base';

function SvgComponent(props) {
  return (
    <Icon
      xmlns="http://www.w3.org/2000/svg"
      height={16}
      width={14}
      viewBox="0 0 448 512"
      {...props}
    >
      <Path d="M8 256a56 56 0 11112 0 56 56 0 11-112 0zm160 0a56 56 0 11112 0 56 56 0 11-112 0zm216-56a56 56 0 110 112 56 56 0 110-112z" />
    </Icon>
  )
}

export default SvgComponent
