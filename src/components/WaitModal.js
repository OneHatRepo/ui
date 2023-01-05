import {
	Modal,
	Row,
	Text,
} from 'native-base';
import withRedux from '../Data/hoc/withRedux';
import Loading from './Loading';
import _ from 'lodash';

export function WaitModal(props) {
	const {
			textMessage = 'Please wait...',
			waitStack,
		} = props;

	return <Modal {...props} _backdrop={{ bg: "#000" }}>
				<Modal.Content maxWidth="400px">
					<Modal.Body>
						<Row justifyContent="center" alignItems="center">
							<Loading minHeight="auto" h={5} w={5} mr={2} />
							<Text color="#000">{textMessage}</Text>
							{/* {!!waitStack ? <Text color="#000">{_.keys(waitStack).join(', ')}</Text> : null} */}
						</Row>
					</Modal.Body>
				</Modal.Content>
			</Modal>;
}

export default withRedux(WaitModal, [
	'waitStack',
]);