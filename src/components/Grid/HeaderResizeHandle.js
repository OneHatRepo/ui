import {
	Column,
	Icon,
	Row,
	Text,
} from 'native-base';
import styles from '../../styles/StyleSheets.js';
import withDraggable from '../Hoc/withDraggable.js';
import GripLinesVertical from '../Icons/GripLinesVertical.js';

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
		return <WrappedComponent
					isDraggable={true}
					{...props}
				/>;
	};
}

export default withAdditionalProps(withDraggable(HeaderResizeHandle));