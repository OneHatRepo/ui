import {
	Row,
} from 'native-base';

export default function Footer(props) {
	return <Row
				alignItems="center"
				justifyContent="center"
				alignSelf="flex-end"
				bg="primary.100"
				testID="footer"
				w="100%"
				pt={3}
				pb={2}
				px={3}
				safeAreaBottom
				{...props}
			>
				{props.children}
			</Row>;
}
