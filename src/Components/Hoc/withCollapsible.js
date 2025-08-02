import { forwardRef, useState } from 'react';

export default function withCollapsible(WrappedComponent) {
	return forwardRef((props, ref) => {

		if (props.alreadyHasWithCollapsible) {
			return <WrappedComponent {...props} ref={ref} />;
		}
		
		const {
				isCollapsed = false,
				startsCollapsed = false,
				setIsCollapsed,
			} = props,
			bypass = !!setIsCollapsed,
			[localIsCollapsed, setLocalIsCollapsed] = useState(startsCollapsed);

		return <WrappedComponent
					{...props}
					alreadyHasWithCollapsible={true}
					ref={ref}
					isCollapsed={bypass ? isCollapsed : localIsCollapsed}
					setIsCollapsed={bypass ? setIsCollapsed : setLocalIsCollapsed}
				/>;
	});
}