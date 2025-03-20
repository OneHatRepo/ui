import {
	Icon,
	VStack,
} from '@project-components/Gluestack';
import styles from '../../Styles/StyleSheets.js';
import withDraggable from '../Hoc/withDraggable.js';
import GripLinesVertical from '../Icons/GripLinesVertical.js';

function HeaderResizeHandle(props) {
	const {
			isDragging,
		} = props;

	return <VStack
				style={styles.ewResize}
				className={`
					HeaderResizeHandle
					h-full
					w-3
					items-center
					justify-center
					${isDragging ? 'bg-grey-300' : 'bg-grey-100'}
				`}
			>
				<Icon
					as={GripLinesVertical}
					size="sm"
					className="resizeHandle text-grey-300"
				/>
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