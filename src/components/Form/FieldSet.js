import { useState, } from 'react';
import {
	Box,
	Column,
	Row,
	Text,
} from 'native-base';
import {
	STYLE_FIELDSET_FONTSIZE,
} from '../../constants/Style';
import IconButton from '../Buttons/IconButton';
import CaretUp from '../Icons/CaretUp';
import CaretDown from '../Icons/CaretDown';

export default function FieldSet(props) {
	const {
			title,
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
					>
						<Text
							fontSize={STYLE_FIELDSET_FONTSIZE}
							fontWeight="bold"
							py={1}
							px={3}
							flex={1}
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
				{!localIsCollapsed && children}
			</Box>;
}
