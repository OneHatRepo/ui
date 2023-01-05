import { useState } from 'react';

export default function withCollapsible(WrappedComponent) {
	return (props) => {
		const
			{
				isCollapsed = false,
				startsCollapsed = false,
				setIsCollapsed,
			} = props,
			usePassThrough = !!setIsCollapsed,
			[localIsCollapsed, setLocalIsCollapsed] = useState(startsCollapsed);

		return <WrappedComponent
					isCollapsed={usePassThrough ? isCollapsed : localIsCollapsed}
					setIsCollapsed={usePassThrough ? setIsCollapsed : setLocalIsCollapsed}
					{...props}
				/>;
	};
}