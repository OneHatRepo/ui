import {
	Button,
	Icon,
	Modal,
	Text,
} from 'native-base';
import TriangleExclamation from '../Icons/TriangleExclamation.js';

export default function ErrorMsg(props) {
	const {
			text = 'Error',
			color = 'red.500',
			onOk,
		} = props;
console.log('render ErrorMessage text', text);
	return <Modal isOpen={true} {...props} _backdrop={{ bg: "#000" }}>
				<Modal.Content>
					<Modal.Header>Alert</Modal.Header>
					<Modal.Body
						borderTopWidth={0}
						bg="#fff"
						p={3}
						justifyContent="center"
						alignItems="center"
						borderRadius={5}
						flexDirection="row"
					>
						<Icon as={TriangleExclamation} color="red.500" size="md" mr={1} />
						<Text color={color} fontSize="18px">{text}</Text>
					</Modal.Body>
					<Modal.Footer py={2} pr={4}>
						<Button color="primary.800" onPress={onOk}>OK</Button>
					</Modal.Footer>
				</Modal.Content>
			</Modal>;
}
