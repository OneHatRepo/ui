import {
	HStack,
	Spinner,
} from '@gluestack-ui/themed';
// import ScreenContainer from '../ScreenContainer.js';

export default function Loading(props) {
	// if (props.isScreen) {
	// 	return <ScreenContainer {...props}>
	// 				<Spinner flex={1} color="primary.500" />
	// 			</ScreenContainer>;
	// }
	return <HStack justifyContent="center" minHeight={100} {...props}>
				<Spinner flex={1} color="primary.500" />
			</HStack>;
}
