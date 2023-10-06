import React, { useRef, useEffect, } from 'react';
import _ from 'lodash';

export default function withComponent(WrappedComponent) {
	return (props) => {
		const {
				parent,
				...propsToPass
			} = props,
			childrenRef = useRef({}),
			selfRef = useRef({
				registerChild: (childRef) => {
					const {
							reference,
						} = childRef;
					if (typeof childrenRef.current[reference] === 'undefined') {
						throw Error('reference already exists!');
					}
					childrenRef.current[reference] = childRef;
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
			});

		useEffect(() => {
			if (parent) {
				parent.registerChild({
					childRef: selfRef.current,
				});
			}
			return () => {
				if (parent) {
					parent.unregisterChild(selfRef.current);
				}
				childrenRef.current = {};
			};
		}, []);

		return <WrappedComponent
					parent={selfRef}
					{...propsToPass}
				/>

	};
}