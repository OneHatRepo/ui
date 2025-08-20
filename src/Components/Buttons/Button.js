import { cloneElement, forwardRef, isValidElement, useRef } from 'react';
import {
	Button,
	ButtonText,
	ButtonSpinner,
	ButtonIcon,
	ButtonGroup,
} from '@project-components/Gluestack';
import addIconProps from '../../Functions/addIconProps.js';
import clsx from 'clsx';
import withComponent from '../Hoc/withComponent.js';
import withTooltip from '../Hoc/withTooltip.js';
import _ from 'lodash';

const ButtonComponent = forwardRef((props, ref) => {
	let {
			self,
			text, // the text to display on the button
			content, // the content to display on the button
			isLoading = false, // show a spinner?
			isExpandToFillVertical = false,
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
		'flex-row',
		'items-center',
	);
	if (isExpandToFillVertical) {
		// IMPORTANT! Otherwise the button will cut off the vertical content due to size classes automatically added by Gluestack (e.g. h-10)
		className += ' h-auto';
	}
	if (propsToPass.className) {
		className += ' ' + propsToPass.className;
	}
	
	return <Button
				{...propsToPass}
				className={className}
				ref={ref}
			>
				{isLoading && <ButtonSpinner className="ButtonSpinner" {..._spinner} />}
				{icon}
				{text && <ButtonText className="ButtonText" {..._text}>{text}</ButtonText>}
				{content}
				{rightIcon}
			</Button>;
});

export default withComponent(withTooltip(ButtonComponent));
