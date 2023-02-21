import React from 'react';
import {
	Switch,
} from 'native-base';
import styles from '../../../Constants/Styles.js';
import withTooltip from '../../Hoc/withTooltip.js';
import withValue from '../../Hoc/withValue.js';

const
	ToggleElement = (props) => {
		const {
				value,
				setValue,
			} = props,
			onToggle = () => {
				setValue(!value);
			};
		return <Switch
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
					{...props}
				/>;
	},
	ToggleField = withValue(ToggleElement);

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <ToggleField {...props} outerRef={ref} />;
}));