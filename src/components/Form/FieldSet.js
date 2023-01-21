import { useState, } from 'react';
import {
	Box,
	Column,
	Row,
	Text,
} from 'native-base';
import styles from '../../Constants/Styles';
import IconButton from '../Buttons/IconButton';
import CaretUp from '../Icons/CaretUp';
import CaretDown from '../Icons/CaretDown';

export default function FieldSet(props) {
	const {
			title,
			helpText,
			children,
			isCollapsed,
			hasErrors,
			...propsToPass
		} = props,
		[localIsCollapsed, setLocalIsCollapsed] = useState(isCollapsed),
		onToggleCollapse = () => {
			setLocalIsCollapsed(!localIsCollapsed);
		};
		
	return <Box
				borderWidth={1}
				borderColor="trueGray.400"
				bg={styles.FORM_FIELDSET_BG}
				m={2}
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
