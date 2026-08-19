import {
	HStack,
	Tooltip,
} from '@onehat-gluestack';
import clsx from 'clsx';
import QRCode from 'react-qr-code';
import {
	CURRENT_MODE,
	UI_MODE_NATIVE,
	UI_MODE_WEB,
} from '../../Constants/UiModes.js';
import IconButton from '../Buttons/IconButton.js';
import UiGlobals from '../../UiGlobals.js';
import withAlert from '../Hoc/withAlert';
import withComponent from '../Hoc/withComponent';
import withValue from '../Hoc/withValue';
import Clipboard from '../Icons/Clipboard.js';
import Print from '../Icons/Print.js';
import Eye from '../Icons/Eye.js';
import _ from 'lodash';

function QrCodeViewer(props) {

	if (CURRENT_MODE === UI_MODE_NATIVE) {
		throw new Error('JsonElement not yet implemented for React Native');
	}

	const {
			tooltipRef = null,
			tooltip = null,
			isDisabled = false,
			isViewOnly = false,
			isCollapsed = true,
			tooltipPlacement = 'bottom',
			testID,

			// withComponent
			self,

			// withAlert
			alert,

			// withValue
			value,
			setValue,
			className: containerClassName,
			style: containerStyle,
			...propsToPass
		} = props,
		styles = UiGlobals.styles,
		id = props.id || self?.path || 'QrCodeViewer',

		onView = (print = false) => {
			const
				shouldPrint = print === true,
				svgElement = document.getElementById(id);
			
			if (!svgElement) {
				alert('No QR Code found to view.');
				return
			};

			const
				svgString = new XMLSerializer().serializeToString(svgElement),
				svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' }),
				imageUrl = URL.createObjectURL(svgBlob),
				win = window.open('', '_blank', 'width=600,height=600');
			if (win) {
				// 4. Inject printable HTML content
				win.document.write(`
					<!DOCTYPE html>
					<html>
					<head>
						<title>Print QR Code</title>
						<style>
						body {
							display: flex;
							flex-direction: column;
							justify-content: center;
							align-items: center;
							height: 100vh;
							margin: 0;
							font-family: sans-serif;
						}
						img {
							width: 300px;
							height: 300px;
						}
						</style>
					</head>
					<body>
						<img src="${imageUrl}" ${shouldPrint ? 'onload="window.print();"' : ''} />
					</body>
					</html>
				`);

				win.document.close();
			}
		},
		onCopy = async () => {

			const svgElement = document.getElementById(id);
			if (!svgElement) {
				alert('No QR Code found to copy.');
				return
			};

			try {
				const
					svgString = new XMLSerializer().serializeToString(svgElement),
					svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' }),
					url = URL.createObjectURL(svgBlob),
					img = new Image();
				img.onload = () => {
					// draw image on an offscreen Canvas
					const canvas = document.createElement('canvas');
					canvas.width = 256; // Desired target resolution for pasted image
					canvas.height = 256;
					const ctx = canvas.getContext('2d');
					
					if (ctx) {
						// Optional: Draw white background so transparent SVGs don't turn black on copy
						ctx.fillStyle = '#FFFFFF';
						ctx.fillRect(0, 0, canvas.width, canvas.height);
						
						ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
						URL.revokeObjectURL(url);

						// 4. Convert Canvas to PNG Blob and write to Clipboard
						canvas.toBlob(async (blob) => {
							if (blob && navigator.clipboard && window.ClipboardItem) {
								await navigator.clipboard.write([
									new ClipboardItem({ [blob.type]: blob })
								]);
								// Optional: Notify user of successful copy here
							}
						}, 'image/png');
					}
				};
				img.src = url;
			} catch (err) {
				alert('Failed to copy QR Code image: ' + err);
			}
		};

	const className = clsx(
		containerClassName,
		testID,
		'QrCodeViewer',
		'flex-1',
		'justify-start',
		'items-center',
		'w-full',
	);
	return <HStack style={containerStyle} className={className}>
				<QRCode
					id={id}
					value={value}
					size={128}
					bgColor="#FFFFFF"
					fgColor="#000000"
					level="L"
					// style={{ height: "auto", maxWidth: "100%", width: "100%" }}
					viewBox={`0 0 128 128`}
				/>
				<IconButton
					icon={Eye}
					onPress={() => onView(false)}
					isDisabled={isDisabled}
					className="ml-2"
					tooltip="View QR Code"
				/>
				<IconButton
					icon={Print}
					onPress={() => onView(true)}
					isDisabled={isDisabled}
					className="ml-2"
					tooltip="Print QR Code"
				/>
				<IconButton
					icon={Clipboard}
					onPress={() => onCopy()}
					isDisabled={isDisabled}
					className="ml-2"
					tooltip="Copy Image to Clipboard"
				/>
			</HStack>;
}

export default withComponent(withAlert(withValue(QrCodeViewer)));