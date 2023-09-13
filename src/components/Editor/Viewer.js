import {
	Button,
	Column,
	Icon,
	ScrollView,
	Row,
	Text,
} from 'native-base';
import {
	EDITOR_TYPE__SIDE,
} from '../../Constants/Editor.js';
import UiGlobals from '../../UiGlobals.js';
import getComponentFromType from '../../Functions/getComponentFromType.js';
import Label from '../Form/Label.js';
import Pencil from '../Icons/Pencil.js';
import Footer from '../Layout/Footer.js';
import _ from 'lodash';

// This is a wrapper for the Viewer subcomponent passed to props,
// that adds buttons and a footer

export default function Viewer(props) {
	const {
			additionalViewButtons = [],
			ancillaryItems = [],
			viewerCanDelete = false,

			// withData
			record,

			// parent container
			selectorSelected,

			// withEditor
			editorType,
			onEditMode,
			onClose,
			onDelete,
		} = props,
		isSideEditor = editorType === EDITOR_TYPE__SIDE,
		styles = UiGlobals.styles,
		flex = props.flex || 1,
		buildAncillary = () => {
			let components = [];
			if (ancillaryItems.length) {
				components = _.map(ancillaryItems, (item, ix) => {
					let {
						type,
						title = null,
						selectorId = null,
						...propsToPass
					} = item;
					if (!propsToPass.h) {
						propsToPass.h = 400;
					}
					const
						Element = getComponentFromType(type),
						element = <Element
										selectorId={selectorId}
										selectorSelected={selectorSelected || record}
										flex={1}
										h={350}
										canEditorViewOnly={true}
										{...propsToPass}
									/>;
					if (title) {
						title = <Text
									fontSize={styles.VIEWER_ANCILLARY_FONTSIZE}
									fontWeight="bold"
								>{title}</Text>;
					}
					return <Column key={'ancillary-' + ix} my={5}>{title}{element}</Column>;
				});
			}
			return components;
		};

	const
		showDeleteBtn = onDelete && viewerCanDelete,
		showCloseBtn = !isSideEditor;

	return <Column flex={flex} {...props}>
				<ScrollView width="100%" _web={{ height: 1 }}>
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

						{buildAncillary()}

					</Column>
				</ScrollView>
				{(showDeleteBtn || showCloseBtn) && 
					<Footer justifyContent="flex-end">
						{showDeleteBtn && 
							<Row flex={1} justifyContent="flex-start">
								<Button
									key="deleteBtn"
									onPress={onDelete}
									bg="warning"
									_hover={{
										bg: 'warningHover',
									}}
									color="#fff"
								>Delete</Button>
							</Row>}
						{showCloseBtn && 
							<Button.Group space={2}>
								<Button
									key="closeBtn"
									onPress={onClose}
									color="#fff"
								>Close</Button>
							</Button.Group>}
					</Footer>}
			</Column>;
}
