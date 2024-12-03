import {
	Icon,
	VStack,
} from '../Gluestack';
import styles from '../../Styles/StyleSheets.js';
import GripVertical from '../Icons/GripVertical.js';

function RowDragHandle(props) {
	return <VStack
				style={styles.ewResize}
				className="HeaderReorderHandle bg-grey-100 w-[3px] items-center justify-center"
			>
				<Icon
					as={GripVertical}
					size="xs"
					className="handle w-full h-full text-[#ccc]" />
			</VStack>;
}

export default RowDragHandle;