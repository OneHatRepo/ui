import React, { useRef, } from 'react';
import {
	Icon,
	Pressable,
	Spinner,
	Tooltip,
} from 'native-base';
import withComponent from '../Hoc/withComponent.js';
import UiGlobals from '../../UiGlobals.js';
import _ from 'lodash';

const
	IconButton = (props) => {
		const {
				// _icon, // props for the icon component
				// icon, // The actual icon component to use
				_spinner,
				isLoading = false,
				tooltip,
				tooltipPlacement = 'bottom',
				self,
			} = props,
			styles = UiGlobals.styles;
		let ref = props.outerRef;

		if (!ref) {
			ref = useRef();
		}
		if (self) {
			self.ref = ref.current;
		}

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
		const pressable = <Pressable
								ref={ref}
								borderRadius="md"
								colorScheme="primary"
								flexDirection="row"
								justifyContent="center"
								alignItems="center"
								px={styles.ICON_BUTTON_PX}
								py={styles.ICON_BUTTON_PY}
								// bg={styles.ICON_BUTTON_BG}
								_hover={{
									bg: styles.ICON_BUTTON_BG_HOVER,
								}}
								_disabled={{
									bg: styles.ICON_BUTTON_BG_DISABLED,
								}}
								_pressed={{
									bg: styles.ICON_BUTTON_BG_PRESSED,
								}}
								{...props}
								size={null /* this prop was coming from above and messing things up! */}
							>
							{icon}
							</Pressable>;
		ret = pressable;
		if (tooltip) {
			ret = <Tooltip label={tooltip} placement={tooltipPlacement}>{ret}</Tooltip>;
		}
		return ret;
	},
	IconButtonComponent = withComponent(IconButton);

// withComponent needs us to forwardRef
export default React.forwardRef((props, ref) => {
	return <IconButtonComponent {...props} outerRef={ref} />;
});
