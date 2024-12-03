import {
	Modal, ModalBackdrop, ModalHeader, ModalContent, ModalCloseButton, ModalBody, ModalFooter,
	Text,
} from '../Gluestack';
import Button from '../Buttons/Button';

export default function OkMessage(props) {
	const {
			textMessage,
			onClose,
		} = props;

	return <Modal {...props} _backdrop={{ bg: "#000" }}>
				<ModalBackdrop />
				<ModalContent maxWidth="400px">
					<ModalBody
						className={`
							p-5
							pb-0
							border-t-0
						`}
					>
						<Text className="text-black">{textMessage}</Text>
					</ModalBody>
					<ModalFooter
						className={`
							p-0
							pr-4
							border-t-0
						`}
					>
						<Button
							variant="outline"
							onPress={onClose}
							className="text-primary-800"
							text="OK"
						/>
					</ModalFooter>
				</ModalContent>
			</Modal>;
}
