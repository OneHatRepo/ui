import { cloneElement, forwardRef, isValidElement, useRef } from 'react';
import {
	Button,
	ButtonText,
	ButtonSpinner,
	ButtonIcon,
	ButtonGroup,
	Tooltip,
} from '../Gluestack';
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
			tooltip,
			...propsToPass
		} = props;
	
	if (icon) {
		if (isValidElement(icon)) {
			if (_icon) {
				icon = cloneElement(icon, {..._icon});
			}
		} else {
			icon = <ButtonIcon as={icon} {..._icon} />;
		}
	}
	if (rightIcon) {
		if (isValidElement(rightIcon)) {
			if (_rightIcon) {
				rightIcon = cloneElement(rightIcon, {..._rightIcon});
			}
		} else {
			rightIcon = <ButtonIcon as={rightIcon} {..._rightIcon} />;
		}
	}
	
	if (!ref) {
		ref = useRef();
	}
	
	if (self) {
		self.ref = ref.current;
	}

	let className = `
		Button
		flex
	`;
	if (propsToPass.className) {
		className += ' ' + propsToPass.className;
	}
	
	let button = <Button {...propsToPass} className={className} ref={ref}>
					{isLoading && <ButtonSpinner {..._spinner} />}
					{icon}
					{text && <ButtonText {..._text}>{text}</ButtonText>}
					{rightIcon}
				</Button>;
	if (tooltip) {
		button = <Tooltip text={tooltip}>{button}</Tooltip>;
	}
	return button;

});

export default withComponent(withTooltip(ButtonComponent));
