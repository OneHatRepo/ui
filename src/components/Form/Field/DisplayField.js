import React from 'react';
import {
	Text,
} from 'native-base';
import UiGlobals from '../../../UiGlobals.js';
import withComponent from '../../Hoc/withComponent.js';
import withTooltip from '../../Hoc/withTooltip.js';
import withValue from '../../Hoc/withValue.js';

const
	DisplayElement = (props) => {
		const {
				value,
				text = value,
			} = props,
			styles = UiGlobals.styles;
		return <Text
					ref={props.outerRef}
					onChangeText={props.setValue}
					flex={1}
					fontSize={styles.TEXT_FONTSIZE}
					{...props}
				>{text}</Text>;
	},
	DisplayField = withComponent(withValue(DisplayElement));

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <DisplayField {...props} outerRef={ref} />;
}));