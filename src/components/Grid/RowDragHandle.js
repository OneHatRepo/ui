import {
	Column,
	Icon,
	Row,
	Text,
} from 'native-base';
import styles from '../../styles/StyleSheets.js';
import GripVertical from '../Icons/GripVertical.js';

function RowDragHandle(props) {
	return <Column
				testID="HeaderReorderHandle"
				bg="trueGray.100"
				// h="100%"
				w={3}
				alignItems="center"
				justifyContent="center"
				style={styles.ewResize}
			>
				<Icon as={GripVertical} testID="handle" size="xs" w="100%" h="100%" color="#ccc" />
			</Column>;
}

export default RowDragHandle;