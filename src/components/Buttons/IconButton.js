import { forwardRef } from 'react';
import Button from './Button';
import UiGlobals from '../../UiGlobals.js';
import _ from 'lodash';


const IconButtonElement = forwardRef((props, ref) => {
	let icon = props.icon,
		styles = UiGlobals.styles;

	if (!icon && !props._icon?.as) {
		throw Error('IconButton requires an icon prop');
	}

	let buttonClassName = `
		IconButton
		rounded-md
		self-center
		px-[10px]
		py-[10px]
		${styles.ICON_BUTTON_CLASSNAME}
	`;
	if (props.className) {
		buttonClassName += ' ' + props.className;
	}

	return <Button
				ref={ref}
				{...props}
				className={buttonClassName}
				action="none"
				variant="none"
			/>;
});
export default IconButtonElement;
