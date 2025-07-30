import {
	HStack,
	VStack,
} from '@project-components/Gluestack';
import clsx from 'clsx';
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
		return <HStack
					className={clsx(
						'Splitter',
						'h-[3px]',
						'w-full',
						'items-center',
						'justify-center',
						isDragging ? 'bg-secondary-600' : 'bg-primary-600'
					)}
				>
					<HStack
						className={clsx(
							'handle',
							'h-[2px]',
							'w-[10%]',
							'bg-[#ccc]'
						)}
					/>
				</HStack>;
	}
	return <VStack
				style={styles.ewResize}
				className={clsx(
					'Splitter',
					'h-full',
					'w-[3px]',
					'items-center',
					'justify-center',
					isDragging ? 'bg-secondary-600' : 'bg-primary-600',
				)}
			>
				<VStack
					className={clsx(
						'handle',
						'h-[2px]',
						'w-[10%]',
						'bg-[#ccc]'
					)}
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