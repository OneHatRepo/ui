import { forwardRef } from 'react';
import {
	Box,
	Tooltip, TooltipContent, TooltipText,
} from '@project-components/Gluestack';

const TooltipElement = forwardRef((props, ref) => {
	const {
			label,
			placement,
			elements,
			children,
		} = props;
	let className = 'rounded-md';
	if (props.className) {
		className += ' ' + props.className;
	}

	let triggerClassName = 'Tooltip-trigger';
	if (props.className) {
		triggerClassName += ' ' + props.className;
	}
	
	return <Tooltip
				placement={placement}
				trigger={(triggerProps) => {
					return <Box className={triggerClassName} {...triggerProps}>
								{children}
							</Box>;
				}}
			>
				<TooltipContent className={className}>
					{label && <TooltipText>{label}</TooltipText>}
					{elements && elements}
				</TooltipContent>
			</Tooltip>;
});
export default TooltipElement;
