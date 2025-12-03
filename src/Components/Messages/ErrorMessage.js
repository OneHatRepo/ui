import {
	Box,
	HStack,
	Icon,
	Modal, ModalBackdrop, ModalHeader, ModalContent, ModalCloseButton, ModalBody, ModalFooter,
	Text,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import {
	CURRENT_MODE,
	UI_MODE_WEB,
	UI_MODE_NATIVE,
} from '../../Constants/UiModes.js';
import useAdjustedWindowSize from '../../Hooks/useAdjustedWindowSize.js';
import Button from '../Buttons/Button.js';
import Panel from '../Panel/Panel.js';
import Footer from '../Layout/Footer.js';
import testProps from '../../Functions/testProps.js';
import TriangleExclamation from '../Icons/TriangleExclamation.js';

export default function ErrorMessage(props) {
	const {
			text = 'Error',
			color = 'red-500',
			onOk,
		} = props,
		[width, height] = useAdjustedWindowSize(500, 250);

	let modalBackdrop = <ModalBackdrop className="ErrorMessage-ModalBackdrop" />
	if (CURRENT_MODE === UI_MODE_NATIVE) {
		// Gluestack's ModalBackdrop was not working on Native,
		// so workaround is to do it manually for now
		modalBackdrop = <Pressable
							onPress={() => setIsMenuShown(false)}
							className={clsx(
								'ErrorMessage-ModalBackdrop-replacment',
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

	return <Modal isOpen={true} {...props} {...testProps('ErrorMessage')}>
				{modalBackdrop}

				<Panel
					title="Alert"
					isCollapsible={false}
					className="bg-white overflow-auto"
					h={height}
					w={width}
					isWindow={true}
					disableAutoFlex={true}
					onClose={onOk}
					footer={<Footer
								className={clsx(
									'justify-end',
									'py-2',
									'px-4',
									'bg-grey-100',
								)}
							>
								<Button
									{...testProps('okBtn')}
									key="okBtn"
									onPress={onOk}
									text="OK"
									className="text-white"
								/>
							</Footer>}
				>
					<HStack className="ErrorMessage-HStack flex-1 w-full p-4">
						<Box className={clsx(
							'ErrorMessage-Box1',
							'h-full',
							'w-[100px]',
							'flex',
							'items-center',
							'justify-center',
							'pr-3',
						)}>
							<Icon as={TriangleExclamation} className={clsx(
								'ErrorMessage-Icon',
								'h-[40px]',
								'w-[40px]',
								`text-${color}`,
							)} />
						</Box>
						<Box className={clsx(
							'ErrorMessage-Box2',
							'h-full',
							'flex',
							'flex-1',
							'items-start',
							'justify-center',
							'overflow-hidden',
						)}>
							<Text className={clsx(
								'ErrorMessage-Text',
								`text-${color}`,
								'text-[18px]',
								'break-words',
								'whitespace-normal',
								'w-full',
								'overflow-auto',
							)}>{text}</Text>
						</Box>
					</HStack>
				</Panel>
			</Modal>;
}
