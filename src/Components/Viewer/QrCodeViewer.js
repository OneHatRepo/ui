import {
	HStack,
	Tooltip,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import {
	CURRENT_MODE,
	UI_MODE_NATIVE,
	UI_MODE_WEB,
} from '../../Constants/UiModes.js';
import UiGlobals from '../../UiGlobals.js';
import QRCode from 'react-qr-code';
import withComponent from '../Hoc/withComponent';
import withValue from '../Hoc/withValue';
import _ from 'lodash';

function QrCodeViewer(props) {
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

			// withValue
			value,
			setValue,
			...propsToPass
		} = props,
		styles = UiGlobals.styles;

	if (CURRENT_MODE === UI_MODE_NATIVE) {
		throw new Error('JsonElement not yet implemented for React Native');
	}

	let className = clsx(
		'QrCodeViewer',
		'flex-1',
		'justify-start',
		'w-full',
		testID,
	);
	if (props.className) {
		className += ' ' + propsToPass.className;
	}
	return <HStack style={propsToPass.style} className={className}>
				<QRCode
					value={value}
					size={256}
					bgColor="#FFFFFF"
					fgColor="#000000"
					level="L"
					style={{ height: "auto", maxWidth: "100%", width: "100%" }}
					viewBox={`0 0 256 256`}
					{...propsToPass}
				/>
			</HStack>;
}

export default withComponent(withValue(QrCodeViewer));