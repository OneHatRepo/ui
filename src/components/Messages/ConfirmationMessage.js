import {
	Button,
	Modal,
	Text,
} from 'native-base';
import emptyFn from '../../functions/emptyFn.js';

export default function ConfirmationMessage(props) {
	const {
			textMessage,
			onCancel = emptyFn,
			onOk = emptyFn,
		} = props;

	return <Modal isOpen={true} {...props} _backdrop={{ bg: "#000" }}>
				<Modal.Content maxWidth="400px">
					<Modal.Header>Confirm</Modal.Header>
					<Modal.Body p={5} pb={0} borderTopWidth={0}>
						<Text color="#000">{textMessage}</Text>
					</Modal.Body>
					<Modal.Footer py={2} pr={4}>
						<Button variant="ghost" color="trueGray.700" onPress={onCancel}>Cancel</Button>
						<Button variant="ghost" color="primary.800" onPress={onOk}>OK</Button>
					</Modal.Footer>
				</Modal.Content>
			</Modal>;
}
