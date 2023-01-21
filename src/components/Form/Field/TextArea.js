import React from 'react';
import {
	TextArea,
} from 'native-base';
import styles from '../../../Constants/Styles';
import withTooltip from '../../Hoc/withTooltip';
import withValue from '../../Hoc/withValue';

const
	TextAreaElement = (props) => {
		return <TextArea
					ref={props.outerRef}
					onChangeText={props.setValue}
					flex={1}
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