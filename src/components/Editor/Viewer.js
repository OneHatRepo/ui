import {
	Button,
	Column,
	Icon,
	ScrollView,
	Row,
	Text,
} from 'native-base';
import Label from '../Form/Label.js';
import Pencil from '../Icons/Pencil.js';
import Footer from '../Layout/Footer.js';
import _ from 'lodash';

// This is a wrapper for the Viewer subcomponent passed to props,
// that adds buttons and a footer

export default function Viewer(props) {
	const {
			additionalViewButtons = [],
			onEditMode,
			onClose,
			onDelete,
		} = props;

	return <Column flex={1} w="100%">
				<ScrollView flex={1} w="100%">
					<Column m={2}>
						{onEditMode && <Row mb={4} justifyContent="flex-end">
											<Button
												key="editBtn"
												onPress={onEditMode}
												leftIcon={<Icon as={Pencil} color="#fff" size="sm" />}	
												color="#fff"
											>To Edit</Button>
										</Row>}
						
						{!_.isEmpty(additionalViewButtons) && 
							<Row p={2} alignItems="center" justifyContent="flex-end">
								{additionalViewButtons}
							</Row>}

						{props.children}

					</Column>
				</ScrollView>
				<Footer justifyContent="flex-end">
					{onDelete && <Row flex={1} justifyContent="flex-start">
											<Button
												key="deleteBtn"
												onPress={() => {
													confirm('Are you sure you want to delete this record?', onDelete);
												}}
												bg="warning"
												_hover={{
													bg: 'warningHover',
												}}
												color="#fff"
											>Delete</Button>
										</Row>}
					<Button.Group space={2}>
						<Button
							key="closeBtn"
							onPress={onClose}
							color="#fff"
						>Close</Button>
					</Button.Group>
				</Footer>
			</Column>;
}
