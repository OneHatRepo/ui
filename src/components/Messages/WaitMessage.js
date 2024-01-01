import {
	Modal,
	Text,
} from '@gluestack-ui/themed';
import Loading from './Loading.js';

export default function WaitMessage(props) {
	const {
			textMessage = 'Please wait...',
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
						<Loading minHeight="auto" h={5} w={5} mr={2} />
						<Text color="#000">{textMessage}</Text>
					</Modal.Body>
				</Modal.Content>
			</Modal>;
}
