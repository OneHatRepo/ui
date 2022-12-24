// Handy utility that will set blocked.current as true for 100ms,
// then will set it back to false. Use this to block mouse events
// for a brief time.
let blocked = { current: false };

export default function useBlocking() {
	const
		block = () => {
			blocked.current = true;
			setTimeout(() => {
				blocked.current = false;
			}, 100);
		};
	return { blocked, block };
}