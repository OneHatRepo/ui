import React from 'react';
import {
	Text,
} from 'native-base';
import styles from '../../../Constants/Styles';
import withTooltip from '../../Hoc/withTooltip';
import withValue from '../../Hoc/withValue';

const
	TextElement = (props) => {
		return <Text
					ref={props.outerRef}
					numberOfLines={1}
					ellipsizeMode="head" 
					flex={1}
					fontSize={styles.TEXT_FONTSIZE}
					{...props}
				>{props.value}</Text>;
	},
	TextField = withValue(TextElement);

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <TextField {...props} outerRef={ref} />;
}));
