import {
	Column,
	Row,
	Text,
} from 'native-base';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../Constants/Directions.js';
import styles from '../../Styles/StyleSheets.js';
import withDraggable from '../Hoc/withDraggable.js';

// Note on modes:
// HORIZONTAL means the Splitter moves along the X axis.
// VERTICAL means the Splitter moves along the Y axis.

function Splitter(props) {
	const {
			mode = HORIZONTAL, // HORIZONTAL, VERTICAL
			isDragging,
		} = props;

	if (mode === VERTICAL) {
		return <Row
					testID="Splitter"
					bg={isDragging ? 'secondary.600' : 'primary.600'}
					h="3px"
					w="100%"
					alignItems="center"
					justifyContent="center"
				>
					<Row testID="handle" h="2px" w="10%" bg="#ccc"></Row>
				</Row>;
	}
	return <Column
				testID="Splitter"
				bg={isDragging ? 'secondary.600' : 'primary.600'}
				h="100%"
				w="3px"
				alignItems="center"
				justifyContent="center"
				style={styles.ewResize}
			>
				<Column testID="handle" w="2px" h="10%" bg="#ccc"></Column>
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

// Need a hoc to specifically deliver the 'getParentNode' prop
function withParentNode(WrappedComponent) {
	return (props) => {
		const {
				getParentNode = (node) => node.parentElement.parentElement,
			} = props;
		return <WrappedComponent
			getParentNode={getParentNode}
			{...props}
		/>;
	};
}

export default withParentNode(withAdditionalProps(withDraggable(Splitter)));