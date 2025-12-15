import {
	Box,
	HStack,
	Modal, ModalBackdrop, ModalHeader, ModalContent, ModalCloseButton, ModalBody, ModalFooter,
	Pressable,
	Spinner,
	Text,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import {
	CURRENT_MODE,
	UI_MODE_WEB,
	UI_MODE_NATIVE,
} from '../../Constants/UiModes.js';
import testProps from '../../Functions/testProps.js';

export default function WaitMessage(props) {
	let {
			text,
		} = props;
	
	if (!text) { // do this here instead of setting default value in deconstructor, so we can use the default for text, even if text is defined and passed as null or empty string
		text = 'Please wait...';
	}
	
	let modalBackdrop = <ModalBackdrop className="WaitMessage-ModalBackdrop" />
	if (CURRENT_MODE === UI_MODE_NATIVE) {
		// Gluestack's ModalBackdrop was not working on Native,
		// so workaround is to do it manually for now
		return <Modal
					{...testProps('WaitMessage')}
					isOpen={true}
					className="Modal"
					aria-disabled={true}
				>
					<Box
						className={clsx(
							'WaitMessage-ModalBackdrop-replacment',
							'h-full',
							'w-full',
							'absolute',
							'top-0',
							'left-0',
							'bg-[#000]',
							'opacity-50',
						)}
					/>
					{/* <ModalContent
						className={clsx(
							'ModalContent',
							'w-[200px]',
							CURRENT_MODE === UI_MODE_WEB ? 'h-[50px]' : '',
							'shadow-lg',
						)}
					> */}
						<HStack
							className={clsx(
								'HStack',
								'items-center',
								'justify-center',
								'bg-white',
								'p-4',
								'rounded-md',
							)}
						>
							<Spinner
								className={clsx(
									'mr-2',
									'focus:outline-none',
								)}
							/>
							<Text className="text-black">{text}</Text>
						</HStack>
					{/* </ModalContent> */}
				</Modal>;
	}

	return <Modal
				{...testProps('WaitMessage')}
				isOpen={true}
				className="Modal"
				aria-disabled={true}
			>
				<ModalBackdrop className="WaitMessage-ModalBackdrop" />
				<ModalContent
					className={clsx(
						'ModalContent',
						'w-[200px]',
						CURRENT_MODE === UI_MODE_WEB ? 'h-[50px]' : '',
						'shadow-lg',
					)}
				>
					<HStack
						className={clsx(
							'HStack',
							'items-center',
							'justify-center',
						)}
					>
						<Spinner
							className={clsx(
								'mr-2',
								'focus:outline-none',
							)}
						/>
						<Text className="text-black">{text}</Text>
					</HStack>
				</ModalContent>
			</Modal>;
}
