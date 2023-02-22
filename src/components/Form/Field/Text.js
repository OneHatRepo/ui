import React from 'react';
import {
	Text,
} from 'native-base';
import UiGlobals from '../../../UiGlobals.js';
import withTooltip from '../../Hoc/withTooltip.js';
import withValue from '../../Hoc/withValue.js';

const
	TextElement = (props) => {
		const styles = UiGlobals.styles;
		return <Text
					ref={props.outerRef}
					numberOfLines={1}
					ellipsizeMode="head" 
					flex={1}
					fontSize={styles.FORM_TEXT_FONTSIZE}
					bg={styles.FORM_TEXT_BG}
					px={3}
					py={1}
					{...props}
				>{props.value}</Text>;
	},
	TextField = withValue(TextElement);

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <TextField {...props} outerRef={ref} />;
}));
