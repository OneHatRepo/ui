import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Icon } from 'native-base';

function SvgComponent(props) {
  return (
    <Icon
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 101.44 83.8"
      {...props}
    >
      <Path
        d="M58.92 4.5L99.9 68.86c4.12 6.47-.53 14.94-8.2 14.94H9.74c-7.67 0-12.32-8.47-8.2-14.94L42.52 4.5c3.82-6 12.58-6 16.4 0zm-8.2 68.21c3.24 0 5.34-2.34 5.34-5.46-.06-3.18-2.16-5.46-5.34-5.46s-5.4 2.28-5.4 5.46 2.16 5.46 5.4 5.46zm3.42-13.92l1.32-27.18h-9.54l1.38 27.18h6.84z"
        strokeWidth={0}
      />
    </Icon>
  )
}

export default SvgComponent
