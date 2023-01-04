import React from 'react';
import {
	Input,
} from 'native-base';
import {
	STYLE_INPUT_FONTSIZE,
} from '../../../constants/Style';
import withTooltip from '../../Hoc/withTooltip';
import withValue from '../../Hoc/withValue';

const
	InputElement = (props) => {
		return <Input
					ref={props.tooltipRef}
					onChangeText={props.setValue}
					flex={1}
					fontSize={STYLE_INPUT_FONTSIZE}
					{...props}
				/>;
	},
	InputField = withValue(InputElement);

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <InputField {...props} tooltipRef={ref} />;
}));