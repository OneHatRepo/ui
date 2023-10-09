import React, { useState, useRef, useEffect, } from 'react';
import _ from 'lodash';

// This HOC establishes a parent-child relationship between components.
// Basically anything wrapped in withComponent registers itself with a parent
// and allows children to register.

export default function withComponent(WrappedComponent) {
	return (props) => {
		const {
				// self: parent,
				parent,
				componentMethods,
				...propsToPass
			} = props,
			{ reference } = props,
			childrenRef = useRef({}),
			selfRef = useRef({
				parent,
				reference,
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
			if (componentMethods) {
				_.each(componentMethods, (method, name) => {
					selfRef.current[name] = method;
				});
			}
			if (parent && reference) {
				parent.registerChild(selfRef.current);
			}
			return () => {
				if (parent && reference) {
					parent.unregisterChild(selfRef.current);
				}
				childrenRef.current = {};
			};
		}, []);

		return <WrappedComponent
					// parent={parent}
					self={selfRef.current}
					{...propsToPass}
				/>;

	};
}