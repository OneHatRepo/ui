import {
	VStack,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import styles from '../../Styles/StyleSheets.js';
import withDraggable from '../Hoc/withDraggable.js';
import GripLinesVertical from '../Icons/GripLinesVertical.js';
import IconWithTooltip from '../Icons/IconWithTooltip.js';

function HeaderResizeHandle(props) {
	const {
			isDragging,
		} = props;

	return <VStack
				style={styles.ewResize}
				className={clsx(
					'HeaderResizeHandle',
					'h-full',
					'w-3',
					'items-center',
					'justify-center',
					isDragging ? 'bg-grey-300' : 'bg-grey-100',
				)}
			>
				<IconWithTooltip
					as={GripLinesVertical}
					size="sm"
					className="resizeHandle text-grey-300"
					tooltip="Resize Column"
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

export default withAdditionalProps(withDraggable(HeaderResizeHandle));