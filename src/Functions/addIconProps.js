
import clsx from 'clsx';
import {
	UI_MODE_WEB,
	UI_MODE_NATIVE,
	CURRENT_MODE,
} from '../Constants/UiModes.js';
import _ from 'lodash';

export default function addIconProps(iconProps = {}) {

	iconProps = _.cloneDeep(iconProps); // avoid mutating the original props, as they may be submitted to multiple components

	iconProps.className = clsx(
		'Icon',
		iconProps.className,
	);

	if (CURRENT_MODE === UI_MODE_WEB) {
		return iconProps;
	}

	// native only

	// marginx
	iconProps.style = {
		marginHorizontal: 8,
		...iconProps.style,
	};

	// On native, react-native-svg ignores className and will only size the icon based on 
	// explicit width / height props (or size if the wrapper supports it).
	// If no size set, it falls back to the full intrinsic viewBox size, so we need to ensure we set a default size.
	// If you want to override the size, pass width and height props to the icon.
	if (iconProps.width || iconProps.height) {
		return iconProps;
	}
	const nativeDefaults = {
		width: 24,
		height: 24,
	};
	return {
		...nativeDefaults,
		...iconProps,
	};
}