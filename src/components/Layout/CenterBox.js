import {
	Box,
} from 'native-base';

export default function CenterBox(props) {
	return <Box
				alignItems="center"
				justifyContent="center"
				flex={1}
				w="100%"
				p={2}
				safeAreaBottom
				{...props}
			>
				{props.children}
			</Box>;
}
