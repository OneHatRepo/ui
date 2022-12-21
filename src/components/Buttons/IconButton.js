import {
	Icon,
	Pressable,
	Spinner,
} from 'native-base';

export default function IconButton(props) {
	const {
			// _icon, // props for the icon component
			// icon, // The actual icon component to use
			_spinner,
			isLoading = false,
		} = props;
	const propsIcon = props._icon || {};
	let icon = props.icon || <Icon {...propsIcon} />;
	if (isLoading) {
		icon = <Spinner {..._spinner} />;
	}
	return <Pressable
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
}
