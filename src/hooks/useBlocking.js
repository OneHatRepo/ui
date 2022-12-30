import { useRef, } from 'react';

// Handy utility that will set isBlocked.current as true for 100ms,
// then will set it back to false. Use this to block mouse events
// for a brief time.
// let isBlocked = { current: false };

export default function useBlocking() {
	const
		isBlocked = useRef(),
		block = () => {
			isBlocked.current = true;
			setTimeout(() => {
				isBlocked.current = false;
			}, 200);
		};
	return { isBlocked, block };
}