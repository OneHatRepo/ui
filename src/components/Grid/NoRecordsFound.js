import {
	IconButton,
	Row,
	Text,
} from 'native-base';
import Rotate from '../Icons/Rotate';
import testProps from '../../functions/testProps';

export default function NoRecordsFound(props) {
	const 
		{
			onRefresh,
			text = 'No Records found.',
		} = props,
		textComponent = <Text
			{...testProps('NoRecordsFound')}
			py={20}
		>{text}</Text>;
	let component = textComponent;
	if (onRefresh) {
		component = <Row justifyContent="center" alignItems="center" flex={1}>
						<IconButton
							{...testProps('refreshBtn')}
							_icon={{
								as: Rotate,
								size: 'sm',
							}}
							onPress={onRefresh}
							variant="ghost"
							p={1}
							mr={1}
						/>
						{textComponent}
					</Row>;
	}
	return component;
}