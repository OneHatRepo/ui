import {
	Icon,
	Row,
	Text,
} from 'native-base';
import TriangleExclamation from '../Icons/TriangleExclamation';

export default function ErrorMsg(props) {
	return <Row justifyContent="center" alignItems="center" my={2} w="100%">
				<Icon as={TriangleExclamation} color="red.500" size="sm" mr={1} />
				<Text color="red.500">
					{props.children}
				</Text>
			</Row>;
}
