import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Icon } from 'native-base';

function SvgComponent(props) {
  return (
    <Icon
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 384.15 488.05"
      {...props}
    >
      <Path d="M214.77 214.78l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-137.4 137.3L54.68 9.38c-12.5-12.51-32.81-12.51-45.31 0-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0l.1.1zM374.68 433.37l-160-160c-12.5-12.5-32.8-12.5-45.3 0l-160.01 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l137.4-137.4 137.4 137.3c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-.1.1z" />
    </Icon>
  )
}

export default SvgComponent
