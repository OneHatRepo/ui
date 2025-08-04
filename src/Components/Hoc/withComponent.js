import { forwardRef, useRef, useEffect, } from 'react';
import _ from 'lodash';

// withComponent() is an HOC that should wrap every UI base component
//
// It does two things:
// 1) Establishes a parent-child relationship between components.
// Basically anything wrapped in withComponent that has a reference prop
// registers itself with a parent and allows children to register.
// 2) Translates h, w, and flex tokens in the props to styles.
// It does this here so components above it in the hierarchy (like Container)
// can use these tokens for all components.

export default function withComponent(WrappedComponent) {
	return forwardRef((props, ref) => {

		// if (props.disableWithComponent || props.alreadyHasWithComponent) {
		// 	return <WrappedComponent {...props} ref={ref} />;
		// }

		props = _.clone(props); // without cloning, I couldn't write to props

		// translate h, w, and flex tokens to styles
		if (!props.style) {
			props.style = {};
		}
		if (props.h) {
			props.style.height = props.h;
			delete props.h;
		}
		if (props.w) {
			props.style.width = props.w;
			delete props.w;
		}
		if (props.flex) {
			props.style.flex = props.flex;
			delete props.flex;
		}

		// now deal with parent-child relationships (if needed)
		if (!props.reference) {
			return <WrappedComponent {...props} ref={ref} />;
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
			if (parent?.hasChild && !parent.hasChild(selfRef.current)) {
				parent.registerChild(selfRef.current);
			}
			return () => {
				if (parent?.unregisterChild) {
					parent.unregisterChild(selfRef.current);
				}
				childrenRef.current = {};
			};
		}, []);

		return <WrappedComponent
					self={selfRef.current}
					{...propsToPass}
					ref={ref}
					disableWithComponent={false}
					// alreadyHasWithComponent={true}
				/>;
	});
}