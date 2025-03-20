import {
	Box,
	HStack,
	Icon,
	Modal, ModalBackdrop, ModalHeader, ModalContent, ModalCloseButton, ModalBody, ModalFooter,
	Text,
} from '@project-components/Gluestack';
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

	return <Modal isOpen={true} {...props} {...testProps('ErrorMessage')}>
				<ModalBackdrop />

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
								className={`
									justify-end
									py-2
									px-4
									bg-grey-100
								`}
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
						<Box className={`
							ErrorMessage-Box1
							h-full
							w-[100px]
							flex
							items-center
							justify-center 
							pr-3
						`}>
							<Icon as={TriangleExclamation} className={`
								ErrorMessage-Icon
								h-[40px]
								w-[40px]
								text-${color}
							`} />
						</Box>
						<Box className={`
							ErrorMessage-Box2
							h-full
							flex
							flex-1
							items-start
							justify-center
							overflow-hidden
						`}>
							<Text className={`
								ErrorMessage-Text
								text-${color}
								text-[18px]
								break-words
								whitespace-normal
								w-full
								overflow-auto
							`}>{text}</Text>
						</Box>
					</HStack>
				</Panel>
			</Modal>;
}
