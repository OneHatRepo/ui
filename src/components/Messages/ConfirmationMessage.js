import {
	Modal, ModalBackdrop, ModalHeader, ModalContent, ModalCloseButton, ModalBody, ModalFooter,
	Text,
} from '../Gluestack';
import Button from '../Buttons/Button';
import emptyFn from '../../Functions/emptyFn.js';

export default function ConfirmationMessage(props) {
	const {
			textMessage,
			onCancel = emptyFn,
			onOk = emptyFn,
		} = props;

	return <Modal isOpen={true} {...props} _backdrop={{ bg: "#000" }}>
				<ModalBackdrop />
				<ModalContent maxWidth="400px">
					<ModalHeader>Confirm</ModalHeader>
					<ModalBody
						className={`
							p-5
							pb-0
							border-t-0
						`}
					>
						<Text className="text-black">{textMessage}</Text>
					</ModalBody>
					<ModalFooter className="py-2 pr-4">
						<Button
							onPress={onCancel}
							className="text-grey-700"
							variant="outline"
							text="Cancel"
						/>
						<Button
							variant="outline"
							onPress={onOk}
							className="text-primary-800"
							text="OK"
						/>
					</ModalFooter>
				</ModalContent>
			</Modal>;
}
