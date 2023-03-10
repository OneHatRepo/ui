 import {
	Button,
	Modal,
	Row,
	Text,
} from 'native-base';

export default function OkMessage(props) {
	const {
			textMessage,
			onClose,
		} = props;

	return <Modal {...props} _backdrop={{ bg: "#000" }}>
				<Modal.Content maxWidth="400px">
					<Modal.Body p={5} pb={0} borderTopWidth={0}>
						<Text color="#000">{textMessage}</Text>
					</Modal.Body>
					<Modal.Footer p={0} pr={4} borderTopWidth={0}>
						<Button variant="ghost" color="primary.800" onPress={onClose}>OK</Button>
					</Modal.Footer>
				</Modal.Content>
			</Modal>;
}
