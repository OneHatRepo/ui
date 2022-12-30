import {
	Box,
	Button,
	Column,
	Modal,
	Row,
} from 'native-base';
import Form from '../forms/Form';
import emptyFn from '../../functions/emptyFn';
import _ from 'lodash';

export default function EditorWindow(props) {
	const {
			title,
			isOpen = false,
			onClose = emptyFn,
			...propsToPass
		} = props;
	return <Modal isOpen={isOpen} onClose={onClose}>
				<Modal.Content>
					<Modal.CloseButton />
					{title && <Modal.Header>{title}</Modal.Header>}
					<Modal.Body>
						<Form {...propsToPass} />
					</Modal.Body>
					{onClose && <Modal.Footer>
									<Button.Group space={2}>
										<Button variant="ghost" onPress={onClose}>
											Close
										</Button>
									</Button.Group>
								</Modal.Footer>}
				</Modal.Content>
			</Modal>;
}
