import {
	VStack,
	Text,
} from '@gluestack-ui/themed';

export default function Unauthorized(props) {
	const 
		{
			text = 'Unauthorized.',
		} = props;
	return <VStack justifyContent="center" alignItems="center" w="100%" flex={1}>
				<Text
					textAlign="center"
					color="#f00"
				>{text}</Text>
			</VStack>;
}