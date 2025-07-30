import { forwardRef, useRef } from 'react';
import {
	HStack,
	Icon,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../Constants/Directions.js';
import withTooltip from '../Hoc/withTooltip.js';
import IconButton from '../Buttons/IconButton.js';
import Xmark from '../Icons/Xmark.js';
import UiGlobals from '../../UiGlobals.js';
import _ from 'lodash';

const Tab = forwardRef((props, ref) => {
	let {
			className,
			direction,
			isDisabled,
			isCurrentTab,
			text,
			_text,
			useIconOnly,
			icon,
			_icon,
			useCloseBtn,
			onClose,
			onPress, // remove it from propsToPass
			...propsToPass
		} = props,
		styles = UiGlobals.styles;
	
	if (!ref) {
		ref = useRef();
	}

	if (isCurrentTab) {
		className += ' ' + styles.TAB_BG_CURRENT;
		_icon.className += ' ' + styles.TAB_ICON_COLOR_CURRENT;
		_text.className += ' ' + styles.TAB_COLOR_CURRENT;
	}
	if (isDisabled) {
		className += ' ' + styles.TAB_BG_DISABLED_2;
		_icon.className += ' ' + styles.TAB_COLOR_DISABLED;
		_text.className += ' ' + styles.TAB_COLOR_DISABLED;
	}

	let tab = null;
	if (useIconOnly) {
		tab = <HStack className={className + ' Tab px-[20px] py-2'}>
					<Icon
						{...propsToPass}
						className={className}
						ref={ref}
						{..._icon}
						as={icon}
					/>
				</HStack>;
	} else {
		if (direction === VERTICAL) {
			className += ' w-[200px]';
		}

		let closeBtn = null;
		if (useCloseBtn) {
			closeBtn = <IconButton
							{...testProps('tabCloseButton-' + ix)}
							onPress={onClose}
							icon={Xmark}
							_icon={_icon}
							tooltip="Close Tab"
							className="p-0"
						/>;
		}
		tab = <HStack
				{...propsToPass}
				className={className}
				ref={ref}
			>
				<Icon
					{..._icon}
					as={icon}
				/>
				<Text {..._text}>{text}</Text>
				{closeBtn}
			</HStack>;
	}

	return tab;
});

export default withTooltip(Tab);