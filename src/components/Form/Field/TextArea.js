import React from 'react';
import {
	TextArea,
} from 'native-base';
import UiGlobals from '../../../UiGlobals.js';
import withComponent from '../../Hoc/withComponent.js';
import withTooltip from '../../Hoc/withTooltip.js';
import withValue from '../../Hoc/withValue.js';
import _ from 'lodash';

const
	TextAreaElement = (props) => {
		const
			styles = UiGlobals.styles,
			value = _.isNil(props.value) ? '' : props.value; // null value may not actually reset this TextArea, so set it explicitly to empty string
		return <TextArea
					ref={props.outerRef}
					onChangeText={props.setValue}
					flex={1}
					bg={styles.FORM_TEXTAREA_BG}
					fontSize={styles.FORM_TEXTAREA_FONTSIZE}
					h={styles.FORM_TEXTAREA_HEIGHT}
					{...props}
					value={value}
				/>;
	},
	TextAreaField = withComponent(withValue(TextAreaElement));

// withTooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <TextAreaField {...props} outerRef={ref} />;
}));