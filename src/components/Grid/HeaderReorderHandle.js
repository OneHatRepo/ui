import {
	Icon,
	VStack,
} from '@project-components/Gluestack';
import styles from '../../Styles/StyleSheets.js';
import withDraggable from '../Hoc/withDraggable.js';
import GripVertical from '../Icons/GripVertical.js';

function HeaderReorderHandle(props) {
	const {
			isDragging,
		} = props;

	return <VStack
				style={styles.ewResize}
				className={`
					HeaderReorderHandle
					h-full
					w-3
					items-center
					justify-center
					${isDragging ? 'bg-grey-300' : 'bg-grey-100'}
				`}
			>
				<Icon
					as={GripVertical}
					size="xs"
					className="reorderHandle w-full h-full text-grey-300"
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

export default withAdditionalProps(withDraggable(HeaderReorderHandle));