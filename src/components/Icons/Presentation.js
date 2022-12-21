import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Icon } from 'native-base';

function SvgComponent(props) {
  return (
    <Icon
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 214.61 227.8"
      {...props}
    >
      <Path
        d="M208.06 7.17v123.11h6.55v7.15H113.06v26.39h15.53l27.93 50.64-10.07 5.54-25.22-45.7h-8.17v53.5h-11.5v-53.5h-8.17L68.17 220l-10.08-5.56L86 163.84h15.54v-26.39H0v-7.15h6.55V7.17H0V0h214.61v7.17zm-15.29 10.52H21.84v104.14h170.93z"
      />
    </Icon>
  )
}

export default SvgComponent
