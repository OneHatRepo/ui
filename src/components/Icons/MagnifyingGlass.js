// Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.
import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Icon } from 'native-base';

function SvgComponent(props) {
  return (
    <Icon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}>
      <Path d="M416 208c0 45.9-14.9 88.3-40 122.7l126.6 126.7c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0s208 93.1 208 208zM208 352a144 144 0 100-288 144 144 0 100 288z" />
    </Icon>
  )
}

export default SvgComponent
