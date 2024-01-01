import React from 'react';
import {
	Textarea,
} from '@gluestack-ui/themed';
import UiGlobals from '../../../UiGlobals.js';
import withComponent from '../../Hoc/withComponent.js';
import withTooltip from '../../Hoc/withTooltip.js';
import withValue from '../../Hoc/withValue.js';
import _ from 'lodash';

const
	TextareaElement = (props) => {
		const
			styles = UiGlobals.styles,
			value = _.isNil(props.value) ? '' : props.value; // null value may not actually reset this Textarea, so set it explicitly to empty string
		return <Textarea
					ref={props.outerRef}
					onChangeText={props.setValue}
					flex={1}
					bg={styles.FORM_TEXTAREA_BG}
					_focus={{
						bg: styles.FORM_TEXTAREA_BG,
					}}
					fontSize={styles.FORM_TEXTAREA_FONTSIZE}
					h={styles.FORM_TEXTAREA_HEIGHT}
					{...props}
					value={value}
				/>;
	},
	TextareaField = withComponent(withValue(TextareaElement));

// withTooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <TextareaField {...props} outerRef={ref} />;
}));