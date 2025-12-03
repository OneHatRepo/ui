import {
	Box,
	Modal, ModalBackdrop, ModalHeader, ModalContent, ModalCloseButton, ModalBody, ModalFooter,
	Text,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import {
	CURRENT_MODE,
	UI_MODE_WEB,
	UI_MODE_NATIVE,
} from '../../Constants/UiModes.js';
import Button from '../Buttons/Button';

export default function OkMessage(props) {
	const {
			textMessage,
			onClose,
		} = props;

	let modalBackdrop = <ModalBackdrop className="OkMessage-ModalBackdrop" />
	if (CURRENT_MODE === UI_MODE_NATIVE) {
		// Gluestack's ModalBackdrop was not working on Native,
		// so workaround is to do it manually for now
		modalBackdrop = <Box
							className={clsx(
								'OkMessage-ModalBackdrop-replacment',
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

	return <Modal {...props} _backdrop={{ bg: "#000" }}>
				{modalBackdrop}
				<ModalContent maxWidth="400px">
					<ModalBody
						className={clsx(
							'p-5',
							'pb-0',
							'border-t-0',
						)}
					>
						<Text className="text-black">{textMessage}</Text>
					</ModalBody>
					<ModalFooter
						className={clsx(
							'p-0',
							'pr-4',
							'border-t-0',
						)}
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
