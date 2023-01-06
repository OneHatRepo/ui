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
import withDraggable from '../../Hoc/withDraggable';
import GripLinesVertical from '../Icons/GripLinesVertical';

function HeaderResizeHandle(props) {
	const {
			isDragging,
		} = props;

	return <Column
				testID="HeaderResizeHandle"
				bg={isDragging ? 'trueGray.300' : 'trueGray.100'}
				h="100%"
				w={3}
				alignItems="center"
				justifyContent="center"
				style={styles.ewResize}
			>
				<Icon as={GripLinesVertical} testID="handle" size="sm" color="#ccc" />
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

export default withAdditionalProps(withDraggable(HeaderResizeHandle));