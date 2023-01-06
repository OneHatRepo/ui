import React from 'react';
import {
	TextArea,
} from 'native-base';
import styles from '../../../Constants/Styles';
import withTooltip from '../../../Hoc/withTooltip';
import withValue from '../../../Hoc/withValue';

const
	TextAreaElement = (props) => {
		return <TextArea
					ref={props.tooltipRef}
					onChangeText={props.setValue}
					flex={1}
					fontSize={styles.TEXTAREA_FONTSIZE}
					h={styles.TEXTAREA_HEIGHT}
					{...props}
				/>;
	},
	TextAreaField = withValue(TextAreaElement);

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <TextAreaField {...props} tooltipRef={ref} />;
}));