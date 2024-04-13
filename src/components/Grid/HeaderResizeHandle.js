import {
	VStack,
	Icon,
} from '@gluestack-ui/themed';
import styles from '../../Styles/StyleSheets.js';
import withDraggable from '../Hoc/withDraggable.js';
import GripLinesVertical from '../Icons/GripLinesVertical.js';

function HeaderResizeHandle(props) {
	const {
			isDragging,
		} = props;

	return <VStack
				testID="HeaderResizeHandle"
				bg={isDragging ? 'trueGray.300' : 'trueGray.100'}
				h="100%"
				w={3}
				alignItems="center"
				justifyContent="center"
				style={styles.ewResize}
			>
				<Icon as={GripLinesVertical} testID="handle" size="sm" color="#ccc" />
			</VStack>;
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