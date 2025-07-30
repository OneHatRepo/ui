import {
	Icon,
	VStack,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import styles from '../../Styles/StyleSheets.js';
import GripVertical from '../Icons/GripVertical.js';

function RowDragHandle(props) {	return <VStack
			style={styles.ewResize}
			className="RowDragHandle bg-grey-100 w-[7px] items-center justify-center select-none"
		>
				<Icon
					as={GripVertical}
					size="xs"
					className="handle w-full h-full text-[#ccc]" />
			</VStack>;
}

export default RowDragHandle;