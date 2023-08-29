import * as React from "react"
import Svg, { Defs, G, Path } from "react-native-svg"
import { Icon } from 'native-base';

function SvgComponent(props) {
  return (
    <Icon
      id="Layer_2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 237.17 235.06"
      {...props}
    >
      <Defs></Defs>
      <G id="Layer_1-2">
        <Path
          className="cls-1"
          d="M237.17 235.06H0V0h237.17v235.06zM13.46 221.59H223.7V13.47H13.47V221.6z"
        />
        <Path
          className="cls-1"
          d="M200.77 192.33H36.4V42.74h164.36v149.59zm-150.9-13.47H187.3V56.2H49.87v122.66z"
        />
      </G>
    </Icon>
  )
}

export default SvgComponent
