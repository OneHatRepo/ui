// Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.
import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Icon } from 'native-base';

function SvgComponent(props) {
  return (
    <Icon
      xmlns="http://www.w3.org/2000/svg"
      height={16}
      width={16}
      viewBox="0 0 512 512"
      {...props}
    >
      <Path d="M64 256v-96h160v96H64zm0 64h160v96H64v-96zm224 96v-96h160v96H288zm160-160H288v-96h160v96zM64 32C28.7 32 0 60.7 0 96v320c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64z" />
    </Icon>
  )
}

export default SvgComponent
