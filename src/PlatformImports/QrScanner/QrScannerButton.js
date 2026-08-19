import {
	Box,
} from '@onehat-gluestack';
import clsx from 'clsx';
import useAdjustedWindowSize from '../../Hooks/useAdjustedWindowSize.js';
import IconButton from '../../Components/Buttons/IconButton.js';
import withAlert from '../../Components/Hoc/withAlert.js';
import QrCode from '../../Components/Icons/QrCode.js';
import QrScanner from './index'; // auto-selects the best available QR scanner for the platform (e.g. native or web/browser)

// NOTE: in order to use this component, install expo-camera and/or html5-qrcode into the project, 
// 		npx expo install expo-camera
// 		npm install html5-qrcode
// then add it to the project's registerComponents(), as it's not automatically registered.
// Also requires the app to be running in a secure context (https:// or localhost)

function QrScannerButton(props) {
	const {
			onScan, // handler to call with the parsed QR code string

			// withAlert
			alert,
			showModal,
			hideModal,
		} = props,
		[width, height] = useAdjustedWindowSize(500, 500),
		onScanQrCode = () => {
			
			// open up the camera to scan a QR code, and add the parsed string to the 'q' filter
			showModal({
				title: 'Scan QR Code',
				body: <Box
							style={{
								height,
								width,
							}}
						>
							<QrScanner
								onScan={(value) => {
									onScan(value)
									hideModal();
								}}
							/>
						</Box>,
				canClose: true,
				includeCancel: true,
				onCancel: hideModal,
			});
		};
	
	return <IconButton
				key="qrScannerBtn"
				tooltip="Scan QR Code"
				icon={QrCode}
				onPress={onScanQrCode}
				{...props}
			/>;
}

export default withAlert(QrScannerButton);	
