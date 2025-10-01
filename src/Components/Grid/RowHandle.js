import { forwardRef } from 'react';
import {
	Icon,
	VStack,
} from '@project-components/Gluestack';
import withTooltip from '@onehat/ui/src/Components/Hoc/withTooltip';
import clsx from 'clsx';
import Arcs from '../Icons/Arcs.js';

const RowHandle = forwardRef((props, ref) => {
	const {
			isDragSource,
			isDraggable
		} = props;
	let className = clsx(
		'RowHandle',
		'h-full',
		'w-[40px]',
		'px-2',
		'items-center',
		'justify-center',
		'select-none',
		'cursor-pointer'
	);
	return <VStack
				ref={isDragSource || isDraggable ? ref : undefined}
				className={className}
			>
				<Icon as={Arcs} size="xs" className="w-full h-full text-[#ddd]" />
			</VStack>;
});

function withAdditionalProps(WrappedComponent) {
	return forwardRef((props, ref) => {
		const {
				canSelect,
				canDrag,
				isDragSource,
				isDraggable
			} = props;
		let tooltipParts = [];
		if (canSelect) {
			tooltipParts.push('Select');
		}
		if (canDrag) {
			tooltipParts.push('Drag');
		}
		const tooltip = tooltipParts.length === 2 ? tooltipParts.join(' or ') : tooltipParts[0];
		return <WrappedComponent
					tooltip={tooltip}
					{...props}
					ref={ref}
				/>;
	});
}

export default withAdditionalProps(withTooltip(RowHandle));