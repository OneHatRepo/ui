import { forwardRef, useRef, useEffect, } from 'react';
import { withInjectedHocProps } from '../../Functions/internalHocProps.js';
import _ from 'lodash';

const WITH_COMPONENT_MARKER = Symbol.for('alreadyHasWithComponent');

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
	if (WrappedComponent?.[WITH_COMPONENT_MARKER]) {
		return WrappedComponent;
	}

	const ComponentWithComponent = forwardRef((props, ref) => {
		const {
				disableWithComponent = false,
				alreadyHasWithComponent,
				...incomingProps
			} = props;

		if (disableWithComponent) {
			return <WrappedComponent {...incomingProps} ref={ref} />;
		}

		// if (props.disableWithComponent || props.alreadyHasWithComponent) {
		// 	return <WrappedComponent {...props} ref={ref} />;
		// }

		let propsToUse = _.clone(incomingProps); // without cloning, I couldn't write to props

		// translate h, w, and flex tokens to styles
		if (!propsToUse.style) {
			propsToUse.style = {};
		}
		if (propsToUse.h) {
			propsToUse.style.height = propsToUse.h;
			delete propsToUse.h;
		}
		if (propsToUse.w) {
			propsToUse.style.width = propsToUse.w;
			delete propsToUse.w;
		}
		if (propsToUse.flex) {
			propsToUse.style.flex = propsToUse.flex;
			delete propsToUse.flex;
		}

		// now deal with parent-child relationships (if needed)
		if (!propsToUse.reference) {
			return <WrappedComponent {...propsToUse} ref={ref} />;
		}

		const {
				parent,
				reference,
				...propsToPass
			} = propsToUse,
			childrenRef = useRef({}),
			selfRef = useRef({
				parent,
				reference,
				path: reference ? (parent?.path || '' ) + '/' + reference : null,
				waitForChild: (childReference, timeout = 5000) => {
					return new Promise((resolve, reject) => {
						const start = Date.now();
						const checkForChild = () => {
							if (typeof childrenRef.current[childReference] !== 'undefined') {
								resolve(childrenRef.current[childReference]);
							} else if (Date.now() - start > timeout) {
								reject(new Error(`Timeout waiting for child: ${childReference}`));
							} else {
								setTimeout(checkForChild, 50);
							}
						};
						checkForChild();
					});
				},
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
					{...withInjectedHocProps(propsToPass, {
						self: selfRef.current,
					})}
					ref={ref}
					// alreadyHasWithComponent={true}
				/>;
	});

	ComponentWithComponent[WITH_COMPONENT_MARKER] = true;
	return ComponentWithComponent;
}