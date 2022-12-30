import {
	Box,
	Column,
	Row,
	Text,
} from 'native-base';

export default function FieldSet(props) {
	const {
			title,
			children,
			...propsToPass
		} = props;
	return <Box		
				px={3}
				py={1}
				pb={2}
				{...propsToPass}
			>
				{title && <Text
								w="100%"
								fontSize={18}
								fontWeight="bold"
								borderBottomWeight={4}
								borderBottomColor="trueGray.800"
							>{title}</Text>}
				{children}
			</Box>;
}
