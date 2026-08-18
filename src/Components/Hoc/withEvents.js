import { forwardRef } from 'react';

const WITH_EVENTS_MARKER = Symbol.for('alreadyHasWithEvents');

export default function withEvents(WrappedComponent) {
	if (WrappedComponent?.[WITH_EVENTS_MARKER]) {
		return WrappedComponent;
	}

	const ComponentWithEvents = forwardRef((props, ref) => {

		const {
				onEvent,
			} = props;
		return <WrappedComponent
					{...props}
					ref={ref}
					fireEvent={onEvent}
				/>;
	});

	ComponentWithEvents[WITH_EVENTS_MARKER] = true;
	return ComponentWithEvents;
}