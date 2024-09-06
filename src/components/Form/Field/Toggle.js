import React, { useRef, } from 'react';
import {
	Icon,
	Pressable,
	Row,
	Switch,
	Text,
} from 'native-base';
import UiGlobals from '../../../UiGlobals.js';
import IconButton from '../../Buttons/IconButton.js';
import Na from '../../Icons/Na.js';
import testProps from '../../../Functions/testProps.js';
import withComponent from '../../Hoc/withComponent.js';
import withTooltip from '../../Hoc/withTooltip.js';
import withValue from '../../Hoc/withValue.js';
import _ from 'lodash';

const
	ToggleElement = (props) => {
		const {
				value,
				setValue,
				flex, // flex doesn't work right on mobile
				...propsToPass
			} = props,
			isBlocked = useRef(false),
			styles = UiGlobals.styles,
			onToggle = (val, e) => {
				if (!isBlocked.current) {
					setValue(!value);
				}
			},
			onNullify = (e) => {
				if (e.shiftKey) {
					// If user presses shift key while pressing...
					// Set value to null, and tempoarily disable the onToggle method
					setValue(null);
					isBlocked.current = true;
					setTimeout(() => {
						isBlocked.current = false;
					}, 200);
				}
			};

		if (_.isNil(value)) {
			return <IconButton
						{...testProps('naBtn')}
						ref={props.outerRef}
						icon={<Icon as={Na} color="trueGray.400" />}
						onPress={onToggle}
						borderWidth={1}
						borderColor="trueGray.700"
					/>;
		}

		return <Row alignItems="center">
					<Pressable
						{...testProps('nullifyBtn')}
						onPress={onNullify}
					>
						<Switch
							ref={props.outerRef}
							onToggle={onToggle}
							isChecked={!!value}
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
					</Pressable>
					<Pressable
						{...testProps('readoutBtn')}
						onPress={onToggle}
					>
						<Text
							{...testProps('readout')}
							mx={2}
							fontSize={styles.FORM_TOGGLE_FONTSIZE}
						>{_.isNil(value) ? 'N/A' : (!!value ? 'Yes' : 'No')}</Text>
					</Pressable>
				</Row>;
	},
	ToggleField = withComponent(withValue(ToggleElement));

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <ToggleField {...props} outerRef={ref} />;
}));