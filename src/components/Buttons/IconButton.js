import {
	Icon,
	Pressable,
	Spinner,
	Tooltip,
} from 'native-base';

export default function IconButton(props) {
	const {
			// _icon, // props for the icon component
			// icon, // The actual icon component to use
			_spinner,
			isLoading = false,
			tooltip,
		} = props;
	const propsIcon = props._icon || {};
	let icon = props.icon || <Icon {...propsIcon} />;
	if (isLoading) {
		icon = <Spinner {..._spinner} />;
	}
	const pressable = <Pressable
							borderRadius="md"
							colorScheme="primary"
							flexDirection="row"
							justifyContent="center"
							alignItems="center"
							p={2}
							{...props}
						>
							{icon}
						</Pressable>;
	let ret = pressable;
	if (tooltip) {
		ret = <Tooltip label={tooltip} placement="top">{pressable}</Tooltip>;
	}
	return ret;
}
