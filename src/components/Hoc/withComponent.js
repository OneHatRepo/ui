import React, { useState, useRef, useEffect, } from 'react';
import _ from 'lodash';

// This HOC establishes a parent-child relationship between components.
// Basically anything wrapped in withComponent registers itself with a parent
// and allows children to register.

export default function withComponent(WrappedComponent) {
	return (props) => {
		const {
				parent,
				...propsToPass
			} = props,
			{ reference } = props,
			childrenRef = useRef({}),
			selfRef = useRef({
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
					if (typeof childrenRef.current[reference] === 'undefined') {
						throw Error('reference does not exist!');
					}
					delete childrenRef.current[reference];
				},
				children: childrenRef.current,
			});

		useEffect(() => {
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
					self={selfRef.current}
					{...propsToPass}
				/>

	};
}