import {
	Box,
	ButtonText,
	Icon,
	Modal, ModalBackdrop, ModalHeader, ModalContent, ModalCloseButton, ModalBody, ModalFooter,
	Text,
} from '@project-components/Gluestack';
import Button from '../Buttons/Button';
import testProps from '../../Functions/testProps.js';
import TriangleExclamation from '../Icons/TriangleExclamation.js';

export default function ErrorMessage(props) {
	const {
			text = 'Error',
			color = 'red-500',
			onOk,
		} = props;

	return <Modal isOpen={true} {...props} {...testProps('ErrorMessage')}>
				<ModalBackdrop />
				<ModalContent>
					<ModalHeader>Alert</ModalHeader>
					<ModalBody
						className={`
							flex-row
							align-center
							justify-center
							p-3
							bg-white
							border-t-0
							rounded-md
						`}
					>
						<Box className="w-[50px] mx-1">
							<Icon as={TriangleExclamation} size="10" className="text-red-500" />
						</Box>
						<Text className={` text-${color} flex-1 text-[18px] `}>{text}</Text>
					</ModalBody>
					<ModalFooter className="py-2 pr-4">
						<Button onPress={onOk} className="text-primary-800">
							<ButtonText>OK</ButtonText>
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>;
}
