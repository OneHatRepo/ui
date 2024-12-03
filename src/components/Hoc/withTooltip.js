import { forwardRef } from 'react';
import Tooltip from '../Tooltip/Tooltip.js';
import _ from 'lodash';

// This HOC adds a standardized tooltip to the wrapped component.
// If you need a tooltip with custom elements, use the Tooltip component directly.

export default function withTooltip(WrappedComponent) {
	return forwardRef((props, ref) => {
		const {
				tooltip,
				tooltipPlacement = 'bottom',
				_tooltip = {},
				...propsToPass
			} = props;
		
		let component = <WrappedComponent {...propsToPass} ref={ref} />;

		if (tooltip || !_.isEmpty(_tooltip)) {
			component = <Tooltip label={tooltip} placement={tooltipPlacement} {..._tooltip}>
							{component}
						</Tooltip>;
		}
		
		return component;
	});
}