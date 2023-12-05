import React, { useState, useRef, useEffect, } from 'react';
import {
	v4 as uuid,
} from 'uuid';
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
			reference = !_.isEmpty(props.reference) ? props.reference : uuid(),
			childrenRef = useRef({}),
			selfRef = useRef({
				parent,
				reference,
				hasChild: (childRef) => {
					const {
							reference,
						} = childRef,
						found = _.find(childrenRef.current, (ref, ix) => ix === reference);
					return !!found;
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
			if (componentMethods) {
				_.each(componentMethods, (method, name) => {
					selfRef.current[name] = method;
				});
			}
			if (parent && reference && !parent.hasChild(selfRef.current)) {
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
					reference={reference}
				/>;

	};
}