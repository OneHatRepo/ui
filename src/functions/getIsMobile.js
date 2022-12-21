import { Platform } from 'react-native';

export default function getIsMobile() {
	return Platform.OS === 'ios' || Platform.OS === 'android';
}