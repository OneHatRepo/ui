import { useRef, useEffect, } from 'react';

// This HOC establishes a parent-child relationship between components.
// Basically anything wrapped in withComponent that has a reference prop
// registers itself with a parent and allows children to register.

export default function withComponent(WrappedComponent) {
	return (props) => {

		if (!props.reference) {
			return <WrappedComponent {...props} />;
		}

		const {
				parent,
				reference,
				...propsToPass
			} = props,
			childrenRef = useRef({}),
			selfRef = useRef({
				parent,
				reference,
				path: reference ? (parent?.path || '' ) + '/' + reference : null,
				hasChild: (childRef) => {
					const {
							reference,
						} = childRef;
					return typeof childrenRef.current[reference] !== 'undefined';
				},
				registerChild: (childRef) => {
					const {
							reference,
						} = childRef;
					if (typeof childrenRef.current[reference] !== 'undefined') {
						throw Error('reference already exists!');
					}
					childrenRef.current[reference] = childRef; // so we can do component addresses like self.children.workOrdersGridEditor
				},
				unregisterChild: (childRef) => {
					const {
							reference,
						} = childRef;
					if (typeof childrenRef.current[reference] !== 'undefined') {
						delete childrenRef.current[reference];
					}
				},
				children: childrenRef.current,
			});

		useEffect(() => {
			if (parent && !parent?.hasChild(selfRef.current)) {
				parent.registerChild(selfRef.current);
			}
			return () => {
				if (parent) {
					parent.unregisterChild(selfRef.current);
				}
				childrenRef.current = {};
			};
		}, []);

		return <WrappedComponent
					self={selfRef.current}
					{...propsToPass}
				/>;

	};
}