import React from 'react';
import {
	Row,
	Switch,
	Text,
} from 'native-base';
import UiGlobals from '../../../UiGlobals.js';
import withTooltip from '../../Hoc/withTooltip.js';
import withValue from '../../Hoc/withValue.js';

const
	ToggleElement = (props) => {
		const {
				value,
				setValue,
				flex, // flex doesn't work right on mobile
				...propsToPass
			} = props,
			styles = UiGlobals.styles,
			onToggle = () => {
				setValue(!value);
			};

		return <Row alignItems="center">
					<Switch
						ref={props.outerRef}
						onToggle={onToggle}
						isChecked={!!value}
						// flex={1}
						bg={styles.FORM_TOGGLE_BG}
						size={styles.FORM_TOGGLE_SIZE}
						onTrackColor={styles.FORM_TOGGLE_ON_COLOR}
						offTrackColor={styles.FORM_TOGGLE_OFF_COLOR}
						_hover={{
							onTrackColor: styles.FORM_TOGGLE_ON_HOVER_COLOR,
							offTrackColor: styles.FORM_TOGGLE_OFF_HOVER_COLOR,
						}}
						{...propsToPass}
					/>
					<Text fontSize={styles.FORM_TOGGLE_FONTSIZE}>{!!value ? 'Yes' : 'No'}</Text>
				</Row>;
	},
	ToggleField = withValue(ToggleElement);

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <ToggleField {...props} outerRef={ref} />;
}));