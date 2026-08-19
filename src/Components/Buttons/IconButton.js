import { forwardRef } from 'react';
import clsx from 'clsx';
import Button from './Button';
import UiGlobals from '../../UiGlobals.js';
import _ from 'lodash';


const IconButtonElement = forwardRef((props, ref) => {
	let icon = props.icon,
		iconProps = {
			...(props._icon || {}),
		},
		styles = UiGlobals.styles;

	if (!iconProps.size) {
		iconProps.size = 'xl';
	}

	if (!icon && !props._icon?.as) {
		throw Error('IconButton requires an icon prop');
	}

	const buttonClassName = clsx(
		'IconButton',
		'rounded-md',
		'self-center',
		'min-h-10',
		'px-[10px]',
		'py-[10px]',
		styles.ICON_BUTTON_CLASSNAME,
		props.className,
	);

	return <Button
				ref={ref}
				{...props}
				size="icon"
				action="none"
				variant="none"
				_icon={iconProps}
				className={buttonClassName}
			/>;
});
export default IconButtonElement;
