import {
	Column,
	Text,
} from 'native-base';

export default function Unauthorized(props) {
	const 
		{
			text = 'Unauthorized.',
		} = props;
	return <Column justifyContent="center" alignItems="center" w="100%" flex={1}>
				<Text
					textAlign="center"
					color="#f00"
				>{text}</Text>
			</Column>;
}