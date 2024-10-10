import {
	Box,
	Button,
	ButtonText,
	Icon,
	Modal,
	Text,
} from '@gluestack-ui/themed';
import testProps from '../../Functions/testProps.js';
import TriangleExclamation from '../Icons/TriangleExclamation.js';

export default function ErrorMessage(props) {
	const {
			text = 'Error',
			color = 'red.500',
			onOk,
		} = props;

	return <Modal isOpen={true} {...props} _backdrop={{ bg: "#000" }} {...testProps('ErrorMessage')}>
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
						<Box w="50px" mx={2}>
							<Icon as={TriangleExclamation} color="red.500" size="10" />
						</Box>
						<Text flex={1} color={color} fontSize="18px">{text}</Text>
					</Modal.Body>
					<Modal.Footer py={2} pr={4}>
						<Button color="primary.800" onPress={onOk}>
							<ButtonText>OK</ButtonText>
						</Button>
					</Modal.Footer>
				</Modal.Content>
			</Modal>;
}
