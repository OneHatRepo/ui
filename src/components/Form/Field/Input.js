import React from 'react';
import {
	Input,
} from 'native-base';
import styles from '../../../Constants/Styles';
import withTooltip from '../../Hoc/withTooltip';
import withValue from '../../Hoc/withValue';

const
	InputElement = (props) => {
		return <Input
					ref={props.tooltipRef}
					onChangeText={props.setValue}
					flex={1}
					fontSize={styles.INPUT_FONTSIZE}
					{...props}
				/>;
	},
	InputField = withValue(InputElement);

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <InputField {...props} tooltipRef={ref} />;
}));