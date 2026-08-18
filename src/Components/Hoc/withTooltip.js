import { forwardRef } from 'react';
import Tooltip from '../Tooltip/Tooltip.js';
import _ from 'lodash';

const WITH_TOOLTIP_MARKER = Symbol.for('alreadyHasWithTooltip');

// This HOC adds a standardized tooltip to the wrapped component.
// If you need a tooltip with custom elements, use the Tooltip component directly.

export default function withTooltip(WrappedComponent) {
	if (WrappedComponent?.[WITH_TOOLTIP_MARKER]) {
		return WrappedComponent;
	}

	const ComponentWithTooltip = forwardRef((props, ref) => {
		
		// Strip tooltip-specific props so they are never forwarded to DOM-backed components.
		const {
				tooltip,
				tooltipPlacement = 'bottom',
				tooltipClassName,
				tooltipTriggerClassName,
				_tooltip = {},
				...propsToPass
			} = props;
		
		let component = <WrappedComponent
							{...propsToPass}
							ref={ref}
						/>;

		// Only render the tooltip wrapper when content/options are provided.
		if (tooltip || !_.isEmpty(_tooltip)) {
			component = <Tooltip
							label={tooltip}
							placement={tooltipPlacement}
							className={tooltipClassName}
							triggerClassName={tooltipTriggerClassName}
							{..._tooltip}
						>
							{component}
						</Tooltip>;
		}
		
		return component;
	});

	ComponentWithTooltip[WITH_TOOLTIP_MARKER] = true;
	return ComponentWithTooltip;
}