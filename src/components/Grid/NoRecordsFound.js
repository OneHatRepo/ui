import {
	Column,
	Row,
	Text,
} from 'native-base';
import IconButton from '../Buttons/IconButton.js';
import Rotate from '../Icons/Rotate.js';

export default function NoRecordsFound(props) {
	const 
		{
			onRefresh,
			text = 'No Records found.',
		} = props,
		textComponent = <Text
							textAlign="center"
						>{text}</Text>;

	let component = textComponent;
	if (onRefresh) {
		component = <Row justifyContent="center" alignItems="center" w="100%" flex={1}>
						<IconButton
							_icon={{
								as: Rotate,
								name: 'redo-alt',
								style: {
									fontSize: 16,
								},
								color: 'trueGray.400',
								mr: 1,
							}}
							onPress={onRefresh}
							variant="ghost"
							p={1}
							ml={-4}
						/>
						{textComponent}
					</Row>;
	} else {
		component = <Column justifyContent="center" alignItems="center" w="100%" flex={1}>
						{textComponent}
					</Column>;
	}
	return component;
}