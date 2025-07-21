import {
	Icon,
	VStack,
} from '@project-components/Gluestack';
import styles from '../../Styles/StyleSheets.js';
import GripVertical from '../Icons/GripVertical.js';

function TreeNodeDragHandle(props) {
	let className = `
		TreeNodeDragHandle
		h-full
		w-[14px]
		px-[2px]
		border-l-2
		items-center
		justify-center
		select-none
	`;
	if (props.className) {
		className += ' ' + props.className;
	}
	return <VStack
				style={styles.ewResize}
				className={className}
			>
				<Icon
					as={GripVertical}
					size="xs"
					className="handle w-full h-full text-[#ccc]" />
			</VStack>;
}

export default TreeNodeDragHandle;
