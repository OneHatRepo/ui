import { forwardRef } from 'react';
import {
	BoxNative as Box,
	TextNative,
	Tooltip, TooltipContent,
} from '@project-components/Gluestack';
import clsx from 'clsx';

const TooltipElement = forwardRef((props, ref) => {
	const {
			label,
			placement,
			elements,
			textClassName,
			children,
		} = props;
	let className = 'rounded-md bg-black px-3 py-1';
	if (props.className) {
		className += ' ' + props.className;
	}

	let tooltipTextClassName = 'text-white';
	if (textClassName) {
		tooltipTextClassName += ' ' + textClassName;
	}

	let triggerClassName = 'Tooltip-trigger';
	if (props.triggerClassName) {
		triggerClassName += ' ' + props.triggerClassName;
	}
	
	return <Tooltip
				placement={placement}
				trigger={(triggerProps) => {
					return <Box className={triggerClassName} {...triggerProps}>
								{children}
							</Box>;
				}}
			>
				<TooltipContent>
					<Box className={className}>
						{label && <TextNative className={tooltipTextClassName}>{label}</TextNative>}
						{elements && elements}
					</Box>
				</TooltipContent>
			</Tooltip>;
});
export default TooltipElement;
