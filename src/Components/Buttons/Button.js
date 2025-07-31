import { cloneElement, forwardRef, isValidElement, useRef } from 'react';
import {
	Button,
	ButtonText,
	ButtonSpinner,
	ButtonIcon,
	ButtonGroup,
} from '@project-components/Gluestack';
import {
	UI_MODE_WEB,
	UI_MODE_NATIVE,
	CURRENT_MODE,
} from '../../Constants/UiModes.js';
import clsx from 'clsx';
import withComponent from '../Hoc/withComponent.js';
import withTooltip from '../Hoc/withTooltip.js';
import _ from 'lodash';

const ButtonComponent = forwardRef((props, ref) => {
	let {
			self,
			text, // the text to display on the button
			isLoading = false, // show a spinner?
			icon = null, // an actual icon element
			rightIcon = null, // an actual icon element
			_spinner = {}, // props for ButtonSpinner
			_icon, // props for icon
			_rightIcon, // props for rightIcon
			_text = {}, // props for ButtonText
			...propsToPass
		} = props;
	

	function addIconProps(iconProps = {}) {

		iconProps.className = clsx(
			'ButtonIcon',
			iconProps.className,
		);

		if (CURRENT_MODE === UI_MODE_WEB) {
			return iconProps;
		}

		// native only

		// marginx
		iconProps.style = {
			marginRight: 8,
			marginLeft: 8,
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
	};

	if (icon) {
		if (isValidElement(icon)) {
			if (_icon) {
				icon = cloneElement(icon, addIconProps(_icon || {}));
			}
		} else {
			icon = <ButtonIcon as={icon} {...addIconProps(_icon || {})} />;
		}
	}
	if (rightIcon) {
		if (isValidElement(rightIcon)) {
			if (_rightIcon) {
				rightIcon = cloneElement(rightIcon, addIconProps(_rightIcon || {}));
			}
		} else {
			rightIcon = <ButtonIcon as={rightIcon} {...addIconProps(_rightIcon || {})} />;
		}
	}
	
	if (!ref) {
		ref = useRef();
	}
	
	if (self) {
		self.ref = ref.current;
	}

	let className = clsx(
		'Button',
		'flex',
	);
	if (propsToPass.className) {
		className += ' ' + propsToPass.className;
	}
	
	return <Button
				{...propsToPass}
				className={className}
				ref={ref}
				style={[{ flexDirection: 'row', alignItems: 'center' }, propsToPass.style]}
			>
				{isLoading && <ButtonSpinner className="ButtonSpinner" {..._spinner} />}
				{icon}
				{text && <ButtonText className="ButtonText" {..._text}>{text}</ButtonText>}
				{rightIcon}
			</Button>;
});

export default withComponent(withTooltip(ButtonComponent));
