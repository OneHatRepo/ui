import { useRef, useEffect } from 'react';

// From https://stackoverflow.com/a/65152534

export default function useIsMounted() {
	const isMounted = useRef(false);

	useEffect(() => {
		isMounted.current = true;
		return () => isMounted.current = false;
	}, []);

	return isMounted;
}
