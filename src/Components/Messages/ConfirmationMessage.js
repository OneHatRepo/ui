import {
	Box,
	Modal, ModalBackdrop, ModalHeader, ModalContent, ModalCloseButton, ModalBody, ModalFooter,
	Pressable,
	Text,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import {
	CURRENT_MODE,
	UI_MODE_WEB,
	UI_MODE_NATIVE,
} from '../../Constants/UiModes.js';
import Button from '../Buttons/Button';
import emptyFn from '../../Functions/emptyFn.js';

export default function ConfirmationMessage(props) {
	const {
			textMessage,
			onCancel = emptyFn,
			onOk = emptyFn,
		} = props;

	let modalBackdrop = <ModalBackdrop className="ConfirmationMessage-ModalBackdrop" />
	if (CURRENT_MODE === UI_MODE_NATIVE) {
		// Gluestack's ModalBackdrop was not working on Native,
		// so workaround is to do it manually for now
		modalBackdrop = <Box
							className={clsx(
								'ConfirmationMessage-ModalBackdrop-replacment',
								'h-full',
								'w-full',
								'absolute',
								'top-0',
								'left-0',
								'bg-[#000]',
								'opacity-50',
							)}
						/>;
	}

	return <Modal isOpen={true} {...props} _backdrop={{ bg: "#000" }}>
				{modalBackdrop}
				<ModalContent maxWidth="400px">
					<ModalHeader>Confirm</ModalHeader>
					<ModalBody
						className={clsx(
							'p-5',
							'pb-0',
							'border-t-0',
						)}
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
