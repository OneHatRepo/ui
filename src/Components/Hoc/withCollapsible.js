import { forwardRef, useState } from 'react';
import { withInjectedHocProps } from '../../Functions/internalHocProps.js';

const WITH_COLLAPSIBLE_MARKER = Symbol.for('alreadyHasWithCollapsible');

export default function withCollapsible(WrappedComponent) {
	if (WrappedComponent?.[WITH_COLLAPSIBLE_MARKER]) {
		return WrappedComponent;
	}

	const ComponentWithCollapsible = forwardRef((props, ref) => {

		const {
				isCollapsed = false,
				startsCollapsed = false,
				setIsCollapsed,
			} = props,
			bypass = !!setIsCollapsed,
			[localIsCollapsed, setLocalIsCollapsed] = useState(startsCollapsed);

		return <WrappedComponent
					{...withInjectedHocProps(props, {
						isCollapsed: bypass ? isCollapsed : localIsCollapsed,
						setIsCollapsed: bypass ? setIsCollapsed : setLocalIsCollapsed,
					})}
					ref={ref}
				/>;
	});

	ComponentWithCollapsible[WITH_COLLAPSIBLE_MARKER] = true;
	return ComponentWithCollapsible;
}