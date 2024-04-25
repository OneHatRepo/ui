import {
	Icon,
	Pressable,
} from 'native-base';
import Gear from '../Icons/Gear.js';
import _ from 'lodash';

export default function HeaderColumnSelectorHandle(props) {
	const {
			showColumnsSelector,
		} = props;
	return <Pressable
				testID="HeaderColumnSelectorHandle"
				bg="trueGray.100"
				_hover={{ bg: 'trueGray.200' }}
				_pressed={{ bg: 'trueGray.300' }}
				h="100%"
				w={3}
				alignItems="center"
				justifyContent="center"
				onPress={showColumnsSelector}
			>
				<Icon as={Gear} testID="handle" size="xs" w="100%" h="100%" color="#ccc" />
			</Pressable>;
}
