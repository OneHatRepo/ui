import {
	Icon,
	Pressable,
	Text,
} from 'native-base';
import AngleLeft from '../Icons/AngleLeft';
import { goBack } from '../../RootNavigation'; 
import testProps from '../../functions/testProps';

export default function BackButton(props) {
	return <Pressable onPress={props.goBack || goBack} flexDirection="row" justifyContent="flex-start" alignItems="center" pr={5} {...testProps('backBtn')}>
				<Icon as={AngleLeft} color="#2563eb" size="sm" />
				<Text fontSize={20} color="#2563eb" left={-1}>Back</Text>
			</Pressable>;
}

