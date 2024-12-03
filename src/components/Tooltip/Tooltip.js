import { forwardRef, cloneElement } from 'react';
import { Tooltip, TooltipContent, TooltipText } from "../Gluestack/tooltip";

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
	
	return <Tooltip
				placement={placement}
				trigger={(triggerProps) => {
					const propsToPass = {
						...triggerProps,
						...children.props,
					};
					if (ref) {
						propsToPass.ref = ref;
					}
					return cloneElement(children, propsToPass);
				}}
			>
				<TooltipContent className={className}>
					{label && <TooltipText>{label}</TooltipText>}
					{elements && elements}
				</TooltipContent>
			</Tooltip>;
});
export default TooltipElement;
