import {
	Row,
	Spinner,
} from 'native-base';
import ScreenContainer from '../Container/ScreenContainer.js';

export default function Loading(props) {
	if (props.isScreen) {
		return <ScreenContainer {...props}>
					<Spinner flex={1} color="primary.500" />
				</ScreenContainer>;
	}
	return <Row justifyContent="center" minHeight={100} {...props}>
				<Spinner flex={1} color="primary.500" />
			</Row>;
}
