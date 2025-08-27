import {
	HStack,
	HStackNative,
	Spinner,
	Text,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import ScreenContainer from '../Container/ScreenContainer.js';

export default function Loading(props) {

	if (props.isScreen) {
		return <ScreenContainer className="h-full w-full" {...props}>
					<HStack className="flex-1 justify-center items-center">
						<Spinner className="text-primary-500 mr-1" />
						<Text>Loading</Text>
					</HStack>
				</ScreenContainer>;
	}
	return <HStackNative {...props} className="justify-center min-h-[100px] h-full w-full">
				<Spinner className="flex-1 text-primary-500" />
			</HStackNative>;
}
