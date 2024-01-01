import React from 'react';
import {
	Text,
} from '@gluestack-ui/themed';
import UiGlobals from '../../../UiGlobals.js';
import withComponent from '../../Hoc/withComponent.js';
import withTooltip from '../../Hoc/withTooltip.js';

const
	TextElement = (props) => {
		const styles = UiGlobals.styles;
		return <Text
					ref={props.outerRef}
					numberOfLines={1}
					ellipsizeMode="head" 
					flex={1}
					fontSize={styles.FORM_TEXT_FONTSIZE}
					minHeight='40px'
					px={3}
					py={2}
					{...props}
				>{props.value}</Text>;
	},
	TextField = withComponent(TextElement); // NOT using withValue on Text element, as this element is simply for display purposes!

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <TextField {...props} outerRef={ref} />;
}));
