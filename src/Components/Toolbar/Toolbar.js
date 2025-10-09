import { forwardRef } from 'react';
import {
	HStackNative,
	ScrollView,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import {
	CURRENT_MODE,
	UI_MODE_NATIVE,
} from '../../Constants/UiModes.js';
import UiGlobals from '../../UiGlobals.js';

const Toolbar = forwardRef((props, ref) => {
	const {
			children,
			...propsToPass
		} = props,
		styles = UiGlobals.styles;
	
	let className = clsx(
		'Toolbar',
		'overflow-auto',
		'items-center',
		'justify-start',
		'gap-1',
		'p-2',
		'border-b',
		'border-solid',
		'border-b-grey-400',
		styles.TOOLBAR_CLASSNAME,
	);
	if (CURRENT_MODE === UI_MODE_NATIVE) {
		className += ' min-w-[100%]';
	}
	if (props.className) {
		className += ' ' + props.className
	}
	let toolbar = <HStackNative
						ref={ref}
						{...propsToPass}
						className={className}
					>
						{children}
					</HStackNative>;	

	if (CURRENT_MODE === UI_MODE_NATIVE) {
		toolbar = <ScrollView
						horizontal={true}
						className={clsx(
							'min-w-[100%]',
							'max-h-[50px]',
						)}
					>{toolbar}</ScrollView>;
	}

	return toolbar;
});

export default Toolbar;