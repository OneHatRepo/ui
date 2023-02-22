import React from 'react';
import {
	TextArea,
} from 'native-base';
import UiGlobals from '../../../UiGlobals.js';
import withTooltip from '../../Hoc/withTooltip.js';
import withValue from '../../Hoc/withValue.js';

const
	TextAreaElement = (props) => {
		const styles = UiGlobals.styles;
		return <TextArea
					ref={props.outerRef}
					onChangeText={props.setValue}
					flex={1}
					bg={styles.FORM_TEXTAREA_BG}
					fontSize={styles.FORM_TEXTAREA_FONTSIZE}
					h={styles.FORM_TEXTAREA_HEIGHT}
					{...props}
				/>;
	},
	TextAreaField = withValue(TextAreaElement);

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <TextAreaField {...props} outerRef={ref} />;
}));