import { forwardRef } from 'react';
import { withInjectedHocProps } from '../../Functions/internalHocProps.js';

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
					{...withInjectedHocProps(props, {
						fireEvent: onEvent,
					})}
					ref={ref}
				/>;
	});

	ComponentWithEvents[WITH_EVENTS_MARKER] = true;
	return ComponentWithEvents;
}