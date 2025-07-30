import {
	HStack,
	Modal, ModalBackdrop, ModalHeader, ModalContent, ModalCloseButton, ModalBody, ModalFooter,
	Spinner,
	Text,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import testProps from '../../Functions/testProps.js';

export default function WaitMessage(props) {
	let {
			text,
		} = props;
	
	if (!text) { // do this here instead of setting default value in deconstructor, so we can use the default for text, even if text is defined and passed as null or empty string
		text = 'Please wait...';
	}
	return <Modal
				{...testProps('WaitMessage')}
				isOpen={true}
				className="Modal"
				aria-disabled="true"
			>
				<ModalBackdrop />
				<ModalContent
					className={clsx(
						'ModalContent',
						'w-[200px]',
						'h-[50px]',
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
