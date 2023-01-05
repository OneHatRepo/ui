import {
	Column,
	Icon,
	Row,
	Text,
} from 'native-base';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../Constants/Directions';
import styles from '../../Styles/StyleSheets.js';
import withDraggable from '../Hoc/withDraggable';
import GripVertical from '../Icons/GripVertical';

function HeaderDragHandle(props) {
	const {
			isDragging,
		} = props;

	return <Column
				testID="HeaderDragHandle"
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

function withAdditionalProps(WrappedComponent) {
	return (props) => {
		const {
				getParentNode = (node) => node.parentElement.parentElement,
				
			} = props;
		return <WrappedComponent
			getParentNode={getParentNode}
			mode={HORIZONTAL}
			{...props}
		/>;
	};
}

export default withAdditionalProps(withDraggable(HeaderDragHandle));