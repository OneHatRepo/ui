import {
	Icon,
	Pressable,
	Text,
} from 'native-base';
import AngleLeft from '../Icons/AngleLeft.js';

export default function BackButton(props) {
	const {
		color = '',
		...propsToPass
	} = props;
	return <Pressable flexDirection="row" justifyContent="flex-start" alignItems="center" pr={5} {...propsToPass}>
				<Icon as={AngleLeft} color={color} size="sm" mr={1} />
				<Text fontSize={20} color={color} left={-1}>Back</Text>
			</Pressable>;
}

