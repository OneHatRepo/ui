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
		${styles.ICON_BUTTON_PY}
		${styles.ICON_BUTTON_PX}
		${styles.ICON_BUTTON_BG}
		${styles.ICON_BUTTON_BG_HOVER}
		${styles.ICON_BUTTON_BG_ACTIVE}
		${styles.ICON_BUTTON_BG_DISABLED}
		rounded-md
		self-center
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
