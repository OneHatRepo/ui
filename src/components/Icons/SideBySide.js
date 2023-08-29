import * as React from "react"
import Svg, { G, Path } from "react-native-svg"
import { Icon } from 'native-base';

function SvgComponent(props) {
  return (
    <Icon
      id="Layer_2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 237.17 235.06"
      {...props}
    >
      <G id="Layer_1-2">
        <Path
          d="M85.22 235.06H0V0h85.22v235.06zm-71.75-13.47h58.29V13.47H13.47V221.6zM237.17 235.06H109.74V0h127.43v235.06zm-113.96-13.47h100.5V13.47h-100.5V221.6z"
          strokeWidth={0}
        />
      </G>
    </Icon>
  )
}

export default SvgComponent
