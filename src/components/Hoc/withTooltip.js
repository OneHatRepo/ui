import React from 'react';
import {
	Tooltip,
} from 'native-base';

// NOTE: Can't seem to get this working for some elements like Combo or File

export default function withTooltip(WrappedComponent) {
	return (props) => {
		const {
				tooltip,
			} = props;
		if (!tooltip) {
			return <WrappedComponent {...props} />;
		}
		return <Tooltip label={tooltip} placement="bottom">
					<WrappedComponent {...props} />
				</Tooltip>;
	};
}