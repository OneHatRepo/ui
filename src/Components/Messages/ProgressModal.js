import { useState, useEffect, } from 'react';
import {
	Box,
	HStack,
	Modal, ModalBackdrop, ModalHeader, ModalContent, ModalCloseButton, ModalBody, ModalFooter,
	Spinner,
	Text,
	VStack,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import {
	CURRENT_MODE,
	UI_MODE_WEB,
	UI_MODE_NATIVE,
} from '../../Constants/UiModes.js';
import { useSelector } from 'react-redux';
import * as Progress from 'react-native-progress';
import testProps from '../../Functions/testProps';

let progressTimeout = null;

export default function ProgressModal(props) {
	const {
			progressMessage,
			progressPercentage,
			color = '#666',
		} = props,
		[progressBarWidth, setProgressBarWidth] = useState(175),
		[isInited, setIsInited] = useState(false);

	let modalBackdrop = <ModalBackdrop className="ProgressModal-ModalBackdrop" />
	if (CURRENT_MODE === UI_MODE_NATIVE) {
		// Gluestack's ModalBackdrop was not working on Native,
		// so workaround is to do it manually for now
		modalBackdrop = <Pressable
							onPress={() => setIsMenuShown(false)}
							className={clsx(
								'ProgressModal-ModalBackdrop-replacment',
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

	return <Modal
				{...testProps('ProgressModal')}
				isOpen={true}
				className="Modal"
				aria-disabled={true}
			>
				{modalBackdrop}
				<ModalContent
					className={clsx(
						'ModalContent',
						'max-w-[400px]',
						'shadow-lg',
					)}
				>
					<VStack
						className={clsx(
							'VStack',
							'w-[90%]',
							'items-center',
							'justify-center',
							'self-center',
						)}
						onLayout={(e) => {
							setProgressBarWidth(e.nativeEvent.layout.width);
							setIsInited(true);
						}}
					>
						<Text className="text-black mb-2">{progressMessage}</Text>
						{isInited && 
							<Progress.Bar
								animated={false}
								progress={progressPercentage / 100}
								width={progressBarWidth}
								height={20}
								color={color}
							/>}
					</VStack>
				</ModalContent>
			</Modal>;
}
