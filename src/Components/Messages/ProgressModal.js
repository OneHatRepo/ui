import { useState, useEffect, } from 'react';import {
	HStack,
	Modal, ModalBackdrop, ModalHeader, ModalContent, ModalCloseButton, ModalBody, ModalFooter,
	Spinner,
	Text,
	VStack,
} from '@project-components/Gluestack';
import clsx from 'clsx';
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

	return <Modal
				{...testProps('ProgressModal')}
				isOpen={true}
				className="Modal"
				aria-disabled={true}
			>
				<ModalBackdrop />
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
