import { forwardRef } from 'react';

export default function withEvents(WrappedComponent) {
	return forwardRef((props, ref) => {

		if (props.alreadyHasWithEvents) {
			return <WrappedComponent {...props} ref={ref} />;
		}
		
		const {
				onEvent,
			} = props;
		return <WrappedComponent
					{...props}
					alreadyHasWithEvents={true}
					ref={ref}
					fireEvent={onEvent}
				/>;
	});
}