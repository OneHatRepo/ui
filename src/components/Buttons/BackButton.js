import {
	Icon,
	Pressable,
	Text,
} from 'native-base';
import AngleLeft from '../Icons/AngleLeft.js';

export default function BackButton(props) {
	return <Pressable flexDirection="row" justifyContent="flex-start" alignItems="center" pr={5} {...props}>
				<Icon as={AngleLeft} color="#2563eb" size="sm" />
				<Text fontSize={20} color="#2563eb" left={-1}>Back</Text>
			</Pressable>;
}

