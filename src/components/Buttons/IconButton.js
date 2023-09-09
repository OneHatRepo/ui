import React from 'react';
import {
	Button,
	Icon,
	Pressable,
	Spinner,
	Tooltip,
} from '@gluestack-ui/themed';
import styles from '../../Constants/Styles.js';
import _ from 'lodash';

const IconButton = React.forwardRef((props, ref) => {
	const {
			// _icon, // props for the icon component
			// icon, // The actual icon component to use
			_spinner,
			isLoading = false,
			tooltip,
			tooltipPlacement = 'bottom',
		} = props;
	const propsIcon = props._icon || {};
	let icon = props.icon,
		ret;
	if (isLoading) {
		icon = <Spinner {..._spinner} />;
	}
	if (React.isValidElement(icon)) {
		if (!_.isEmpty(propsIcon)) {
			icon = React.cloneElement(icon, {...propsIcon});
		}
	} else {
		icon = <Icon as={icon} {...propsIcon} />;
	}
	const button = <Button
							ref={ref}
							borderRadius="md"
							action="primary"
							// flexDirection="row"
							// justifyContent="center"
							// alignItems="center"
							p={2}
							// bg={styles.ICON_BUTTON_BG}
							// sx={{
							// 	_hover: {
							// 		bg: styles.ICON_BUTTON_BG_HOVER,
							// 	},
							// 	_disabled: {
							// 		bg: styles.ICON_BUTTON_BG_DISABLED,
							// 	},
							// 	_pressed: {
							// 		bg: styles.ICON_BUTTON_BG_PRESSED,
							// 	},
							// }}
							{...props}
						>
						{icon}
						</Button>;
	ret = button;
	if (tooltip) {
		// ret = <Tooltip
		// 			placement={tooltipPlacement}
		// 			trigger={(triggerProps) => {



		// 				// ERROR: I'm getting infinite re-renders with gluestack here; not sure why.
		
		
		
		// 				return React.cloneElement(ret, {...triggerProps});
		// 			}}
		// 		>
		// 			<Tooltip.Content>
		// 				<Tooltip.Text>{tooltip}</Tooltip.Text>
		// 			</Tooltip.Content>
		// 		</Tooltip>;
	}
	return ret;
});

export default IconButton;