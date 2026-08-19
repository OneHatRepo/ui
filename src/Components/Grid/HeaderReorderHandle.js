import {
	VStack,
} from '@onehat-gluestack';
import clsx from 'clsx';
import styles from '../../Styles/StyleSheets.js';
import withDraggable from '../Hoc/withDraggable.js';
import GripVertical from '../Icons/GripVertical.js';
import IconWithTooltip from '../Icons/IconWithTooltip.js';

function HeaderReorderHandle(props) {
	const {
			isDragging,
		} = props;

	return <VStack
				style={styles.ewResize}
				className={clsx(
					'HeaderReorderHandle',
					'h-full',
					'w-3',
					'items-center',
					'justify-center',
					isDragging ? 'bg-grey-300' : 'bg-grey-100',
				)}
			>
				<IconWithTooltip
					as={GripVertical}
					size="xs"
					className="reorderHandle w-full h-full text-grey-300"
					tooltip="Reorder Column"
					tooltipTriggerClassName="h-full w-full"
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