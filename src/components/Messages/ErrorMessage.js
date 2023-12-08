import {
	Icon,
	Row,
	Text,
} from 'native-base';
import TriangleExclamation from '../Icons/TriangleExclamation.js';

export default function ErrorMsg(props) {
	const {
			textMessage = 'Error',
			textColor = 'red.500',
		} = props;

	return <Modal {...props} _backdrop={{ bg: "#000" }}>
				<Modal.Content>
					<Modal.Body
						borderTopWidth={0}
						bg="#fff"
						p={3}
						justifyContent="center"
						alignItems="center"
						borderRadius={5}
						flexDirection="row"
					>
						<Row justifyContent="center" alignItems="center" my={2} w="100%">
							<Icon as={TriangleExclamation} color="red.500" size="sm" mr={1} />
							<Text color={textColor}>{textMessage}</Text>
						</Row>
					</Modal.Body>
				</Modal.Content>
			</Modal>;
}
