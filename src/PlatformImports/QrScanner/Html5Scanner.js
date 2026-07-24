import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

// NOTE: Normally, QrScanner uses expo-camera, but Safari doesn't support BarcodeDetector,
// so it will fallback to this component, which uses html5-qrcode.
// 		npm i html5-qrcode

export default function Html5Scanner({ onScan }) {

	const started = useRef(false);

	useEffect(() => {

		if (started.current) {
			return;
		}

		started.current = true;

		const scanner = new Html5Qrcode('qr-reader');

		scanner.start(
			{ facingMode: 'environment' },
			{
				fps: 10,
				qrbox: 250,
			},
			(decodedText) => {
				onScan(decodedText);
			}
		);

		return () => {
			scanner.stop()
				.then(() => scanner.clear())
				.catch(() => {});
		};

	}, []);

	return <div
				id="qr-reader"
				style={{
					width: '100%',
					height: '100%',
				}}
			/>;

}