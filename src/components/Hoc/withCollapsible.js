import { forwardRef, useState } from 'react';

export default function withCollapsible(WrappedComponent) {
	return forwardRef((props, ref) => {
		const
			{
				isCollapsed = false,
				startsCollapsed = false,
				setIsCollapsed,
			} = props,
			bypass = !!setIsCollapsed,
			[localIsCollapsed, setLocalIsCollapsed] = useState(startsCollapsed);

		return <WrappedComponent
					isCollapsed={bypass ? isCollapsed : localIsCollapsed}
					setIsCollapsed={bypass ? setIsCollapsed : setLocalIsCollapsed}
					{...props}
					ref={ref}
				/>;
	});
}