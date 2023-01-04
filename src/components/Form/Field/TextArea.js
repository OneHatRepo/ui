import React from 'react';
import {
	TextArea,
} from 'native-base';
import {
	STYLE_TEXTAREA_FONTSIZE,
	STYLE_TEXTAREA_HEIGHT,
} from '../../../constants/Style';
import withTooltip from '../../Hoc/withTooltip';
import withValue from '../../Hoc/withValue';

const
	TextAreaElement = (props) => {
		return <TextArea
					ref={props.tooltipRef}
					onChangeText={props.setValue}
					flex={1}
					fontSize={STYLE_TEXTAREA_FONTSIZE}
					h={STYLE_TEXTAREA_HEIGHT}
					{...props}
				/>;
	},
	TextAreaField = withValue(TextAreaElement);

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <TextAreaField {...props} tooltipRef={ref} />;
}));