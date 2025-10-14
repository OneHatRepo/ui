import { forwardRef } from 'react';
import {
	Icon,
	VStack,
} from '@project-components/Gluestack';
import withTooltip from '../Hoc/withTooltip';
import clsx from 'clsx';
import UiGlobals from '../../UiGlobals.js';
import Arcs from '../Icons/Arcs.js';

const RowHandle = forwardRef((props, ref) => {
	const {
			isDragSource,
			isDraggable
		} = props,
		styles = UiGlobals.styles;
	let className = clsx(
		'RowHandle',
		'h-full',
		'w-[40px]',
		'px-2',
		'items-center',
		'justify-center',
		'select-none',
		'cursor-pointer',
		styles.ROW_HANDLE_CLASSNAME,
	);
	return <VStack
				ref={isDragSource || isDraggable ? ref : undefined}
				className={className}
			>
				<Icon
					as={Arcs}
					size="xs"
					className={clsx(
						'w-full',
						'h-full',
						'text-[#ddd]',
						styles.ROW_HANDLE_ICON_CLASSNAME,
					)}
				/>
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