import {
	Column,
	Icon,
	Row,
	Text,
} from 'native-base';
import styles from '../../Styles/StyleSheets.js';
import withDraggable from '../Hoc/withDraggable.js';
import GripVertical from '../Icons/GripVertical.js';

function HeaderReorderHandle(props) {
	const {
			isDragging,
		} = props;

	return <Column
				testID="HeaderReorderHandle"
				bg={isDragging ? 'trueGray.300' : 'trueGray.100'}
				h="100%"
				w={3}
				alignItems="center"
				justifyContent="center"
				style={styles.ewResize}
			>
				<Icon as={GripVertical} testID="handle" size="xs" w="100%" h="100%" color="#ccc" />
			</Column>;
}

export default withDraggable(HeaderReorderHandle);