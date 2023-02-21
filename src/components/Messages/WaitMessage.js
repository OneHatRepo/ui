 import {
	Row,
	Text,
} from 'native-base';
import Loading from './Loading.js';

export default function WaitMessage(props) {
	const {
			textMessage = 'Please wait...',
		} = props;

	return <Row position="absolute" width="100%" top="40" left="0" _backdrop={{ bg: "#000" }} justifyContent="center" alignItems="center" pb={20} {...props}>
				<Row bg="#fff" p={3} width="50%" justifyContent="center" alignItems="center" borderColor="#000" borderRadius={5}>
					<Loading minHeight="auto" h={5} w={5} mr={2} />
					<Text color="#000">{textMessage}</Text>
				</Row>
			</Row>;
}
