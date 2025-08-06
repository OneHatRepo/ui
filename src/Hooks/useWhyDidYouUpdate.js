import { useRef, useEffect } from 'react';

// This custom hook logs changes in props for debugging purposes.
// It can be used to track why a component re-renders by comparing current props with previous props

// Usage in your component:
// useWhyDidYouUpdate('withMhTree', { enterpriseId, getEquipment, showInactiveEquipment });

export default function useWhyDidYouUpdate(name, props) {
	const previous = useRef();
	
	useEffect(() => {
		if (previous.current) {
			const allKeys = Object.keys({ ...previous.current, ...props });
			const changedProps = {};
			
			allKeys.forEach(key => {
				if (previous.current[key] !== props[key]) {
				changedProps[key] = {
					from: previous.current[key],
					to: props[key]
				};
				}
			});
			
			if (Object.keys(changedProps).length) {
				console.log('[why-did-you-update]', name, changedProps);
			}
		}
		
		previous.current = props;
	});
}
