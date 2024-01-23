import React from 'react';
import {
	Tooltip,
} from '@gluestack-ui/themed';

// NOTE: Can't seem to get this working for some elements like Combo or File

export default function withTooltip(WrappedComponent) {
	return (props) => {
		const {
				tooltip,
				tooltipPlacement = 'bottom',
			} = props;
		// if (!tooltip) {
			return <WrappedComponent {...props} />;
		// }
		return <Tooltip label={tooltip} placement={tooltipPlacement}>
					<WrappedComponent {...props} />
				</Tooltip>;
	};
}