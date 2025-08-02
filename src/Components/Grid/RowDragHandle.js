import { forwardRef } from 'react';
import {
	Icon,
	VStack,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import styles from '../../Styles/StyleSheets.js';
import GripVertical from '../Icons/GripVertical.js';

const RowDragHandle = forwardRef(function(props, ref) {
	let className = clsx(
		'RowDragHandle',
		'bg-grey-100',
		'w-[17px]',
		'items-center',
		'justify-center',
		'select-none',
	);
	if (props.className) {
		className += ' ' + props.className;
	}
	return <VStack
				{...props}
				ref={ref}
				style={styles.ewResize}
				className={className}
			>
					<Icon
						as={GripVertical}
						size="xs"
						className="handle w-full h-full text-[#ccc]" />
				</VStack>;
});

export default RowDragHandle;