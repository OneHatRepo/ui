import {
	HStack,
	Spinner,
	Text,
} from '@gluestack-ui/themed';
import ScreenContainer from '../Container/ScreenContainer.js';

export default function Loading(props) {
	if (props.isScreen) {
		return <ScreenContainer {...props}>
					<Row flex={1} justifyContent="center" alignItems="center">
						<Spinner color="primary.500" mr={2} />
						<Text>Loading</Text>
					</Row>
				</ScreenContainer>;
	}
	return <HStack justifyContent="center" minHeight={100} {...props}>
				<Spinner flex={1} color="primary.500" />
			</HStack>;
}
