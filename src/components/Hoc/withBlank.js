import { forwardRef } from 'react';

export default function withBlank(WrappedComponent) {
	return forwardRef((props, ref) => {
		const {

			} = props;
		return <WrappedComponent {...props} ref={ref} />;
	});
}