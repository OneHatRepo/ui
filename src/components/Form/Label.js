import {
	Text,
} from 'native-base';

export default function Label(props) {
	return <Text w="150px" fontSize={20}>{props.children}</Text>;
}
