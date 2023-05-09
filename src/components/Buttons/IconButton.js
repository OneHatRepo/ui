import React from 'react';
import {
	Icon,
	Pressable,
	Spinner,
	Tooltip,
} from 'native-base';

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
	let icon = props.icon || <Icon {...propsIcon} />;
	if (isLoading) {
		icon = <Spinner {..._spinner} />;
	}
	const pressable = <Pressable
							ref={ref}
							borderRadius="md"
							colorScheme="primary"
							flexDirection="row"
							justifyContent="center"
							alignItems="center"
							p={2}
							_disabled={{
								bg: 'trueGray.300',
							}}
							{...props}
						>
							{icon}
						</Pressable>;
	let ret = pressable;
	if (tooltip) {
		ret = <Tooltip label={tooltip} placement={tooltipPlacement}>{pressable}</Tooltip>;
	}
	return ret;
});

export default IconButton;