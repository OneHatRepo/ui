import { cloneElement, forwardRef, isValidElement, useRef } from 'react';
import {
	Button,
	ButtonText,
	ButtonSpinner,
	ButtonIcon,
	ButtonGroup,
} from '@project-components/Gluestack';
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
	
	if (icon) {
		if (isValidElement(icon)) {
			if (_icon) {
				icon = cloneElement(icon, {..._icon});
			}
		} else {
			icon = <ButtonIcon className="ButtonIcon" as={icon} {..._icon} />;
		}
	}
	if (rightIcon) {
		if (isValidElement(rightIcon)) {
			if (_rightIcon) {
				rightIcon = cloneElement(rightIcon, {..._rightIcon});
			}
		} else {
			rightIcon = <ButtonIcon className="ButtonIcon" as={rightIcon} {..._rightIcon} />;
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
	
	return <Button {...propsToPass} className={className} ref={ref}>
				{isLoading && <ButtonSpinner className="ButtonSpinner" {..._spinner} />}
				{icon}
				{text && <ButtonText className="ButtonText" {..._text}>{text}</ButtonText>}
				{rightIcon}
			</Button>;
});

export default withComponent(withTooltip(ButtonComponent));
