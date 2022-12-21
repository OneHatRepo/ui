 import {
	Button,
	Modal,
	Text,
} from 'native-base';
import emptyFn from '../../functions/emptyFn';

export default function ConfirmationMessage(props) {
	const {
			textMessage,
			onCancel = emptyFn,
			onOk = emptyFn,
		} = props;

	return <Modal {...props} _backdrop={{ bg: "#000" }}>
				<Modal.Content maxWidth="400px">
					<Modal.Body p={5} pb={0} borderTopWidth={0}>
						<Text color="#000">{textMessage}</Text>
					</Modal.Body>
					<Modal.Footer p={0} pr={4} borderTopWidth={0}>
						<Button variant="ghost" color="primary.800" onPress={onCancel}>Cancel</Button>
						<Button variant="ghost" color="primary.800" onPress={onOk}>OK</Button>
					</Modal.Footer>
				</Modal.Content>
			</Modal>;
}
