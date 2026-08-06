import { useEffect, useState } from 'react';
import { useNavigation } from 'expo-router';

export default function useRouteIsFocused() {
	const
		navigation = useNavigation(),
		[isFocused, setIsFocused] = useState(() => {
			if (!navigation || typeof navigation.isFocused !== 'function') {
				return true;
			}
			return navigation.isFocused();
		});

	useEffect(() => {
		if (!navigation || typeof navigation.addListener !== 'function') {
			setIsFocused(true);
			return;
		}

		const
			updateFocused = () => {
				if (typeof navigation.isFocused === 'function') {
					setIsFocused(navigation.isFocused());
				}
			},
			unsubscribeFocus = navigation.addListener('focus', updateFocused),
			unsubscribeBlur = navigation.addListener('blur', updateFocused);

		updateFocused();

		return () => {
			if (typeof unsubscribeFocus === 'function') {
				unsubscribeFocus();
			}
			if (typeof unsubscribeBlur === 'function') {
				unsubscribeBlur();
			}
		};
	}, [navigation]);

	return isFocused;
}
