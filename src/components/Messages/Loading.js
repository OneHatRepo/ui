import {
	HStack,
	Spinner,
	Text,
} from '@gluestack-ui/themed';
import ScreenContainer from '../Container/ScreenContainer.js';

export default function Loading(props) {
	if (props.isScreen) {
		return <ScreenContainer {...props}>
					<HStack flex={1} justifyContent="center" alignItems="center">
						<Spinner color="primary.500" mr={2} />
						<Text>Loading</Text>
					</HStack>
				</ScreenContainer>;
	}
	return <HStack justifyContent="center" minHeight={100} {...props}>
				<Spinner flex={1} color="primary.500" />
			</HStack>;
}
