import { forwardRef } from 'react';

export default function withEvents(WrappedComponent) {
	return forwardRef((props, ref) => {
		const {
				onEvent,
			} = props;
		return <WrappedComponent fireEvent={onEvent} {...props} ref={ref} />;
	});
}