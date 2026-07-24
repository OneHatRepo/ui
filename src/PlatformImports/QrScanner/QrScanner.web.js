import ExpoScanner from './ExpoScanner';
import Html5Scanner from './Html5Scanner';

export default function QRScanner(props) {

	const supportsBarcodeDetector =
		typeof window !== 'undefined' &&
		'BarcodeDetector' in window;

	if (supportsBarcodeDetector) {
		return <ExpoScanner {...props} />;
	}

	return <Html5Scanner {...props} />;
}