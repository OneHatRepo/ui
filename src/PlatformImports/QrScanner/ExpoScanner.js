import { CameraView } from 'expo-camera';

export default function ExpoScanner({ onScan }) {

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