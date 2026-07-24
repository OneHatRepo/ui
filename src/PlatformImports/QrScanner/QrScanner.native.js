// QRScanner.native.js

import { CameraView } from 'expo-camera';

export default function QRScanner({ onScan }) {
	return <CameraView
				style={{ flex: 1 }}
				barcodeScannerSettings={{
					barcodeTypes: ['qr'],
				}}
				onBarcodeScanned={({ data }) => {
					onScan(data);
				}}
			/>;
}