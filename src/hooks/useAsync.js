import { useEffect } from 'react';

// From https://stackoverflow.com/questions/53949393/cant-perform-a-react-state-update-on-an-unmounted-component

export default function useAsync(asyncFn, onSuccess) {
	useEffect(() => {
		let isActive = true;
		asyncFn().then(data => {
			if (isActive) onSuccess(data);
		});
		return () => { isActive = false };
	}, [asyncFn, onSuccess]);
}
