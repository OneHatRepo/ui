import { useState, } from 'react';
import {
	Box,
	Column,
	Row,
	Text,
} from 'native-base';
import UiGlobals from '../../UiGlobals.js';
import IconButton from '../Buttons/IconButton.js';
import CaretUp from '../Icons/CaretUp.js';
import CaretDown from '../Icons/CaretDown.js';

export default function FieldSet(props) {
	const {
			title,
			helpText,
			children,
			isCollapsed,
			hasErrors,
			...propsToPass
		} = props,
		styles = UiGlobals.styles,
		[localIsCollapsed, setLocalIsCollapsed] = useState(isCollapsed),
		onToggleCollapse = () => {
			setLocalIsCollapsed(!localIsCollapsed);
		};
		
	return <Box
				borderWidth={1}
				borderColor="trueGray.400"
				bg={styles.FORM_FIELDSET_BG}
				mb={4}
				pb={1}
				{...propsToPass}
			>
				{title &&
					<Row
						w="100%"
						borderBottomWidth={1}
						borderBottomColor="trueGray.200"
						mb={2}
						style={{ userSelect: 'none', }}
					>
						<Text
							fontSize={styles.FORM_FIELDSET_FONTSIZE}
							fontWeight="bold"
							py={1}
							px={3}
							flex={1}
							numberOfLines={1}
							ellipsizeMode="head"
						>{title}</Text>
						<IconButton
							_icon={{
								as: localIsCollapsed ? <CaretDown /> : <CaretUp />,
								size: 'sm',
								color: 'trueGray.300',
							}}
							onPress={onToggleCollapse}
						/>
					</Row>}
				{helpText && <Text>{helpText}</Text>}
				{!localIsCollapsed && children}
			</Box>;
}
