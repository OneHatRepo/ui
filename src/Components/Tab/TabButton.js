import {
	HORIZONTAL,
	VERTICAL,
} from '../../Constants/Directions.js';
import Button from '../Buttons/Button.js';
import IconButton from '../Buttons/IconButton.js';
import Xmark from '../Icons/Xmark.js';
import UiGlobals from '../../UiGlobals.js';
import _ from 'lodash';


export default function TabButton(props) {
	let {
			className,
			direction,
			isDisabled,
			isCurrentTab,
			text,
			_text,
			useIconOnly,
			_icon,
			useCloseBtn,
			onClose,
			...propsToPass
		} = props,
		styles = UiGlobals.styles;

	className += ' ' + styles.TAB_BG_HOVER + 
				' ' + styles.TAB_BG_ACTIVE;
	_icon.className += ' ' + styles.TAB_ICON_COLOR_HOVER +
						' ' + styles.TAB_ICON_COLOR_ACTIVE;

	if (isCurrentTab) {
		className += ' ' + styles.TAB_BG_CURRENT + 
						' ' + styles.TAB_BG_CURRENT_HOVER;
		_icon.className += ' ' + styles.TAB_ICON_COLOR_CURRENT;
		_text.className += ' ' + styles.TAB_COLOR_CURRENT;
	}
	if (isDisabled) {
		className += ' ' + styles.TAB_BG_DISABLED;
		_icon.className += ' ' + styles.TAB_ICON_COLOR_DISABLED;
		_text.className += ' ' + styles.TAB_COLOR_DISABLED;
	}

	let tab = null;
	if (useIconOnly) {
		tab = <IconButton
					{...propsToPass}
					{..._icon}
					className={className}
				/>;

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
		tab = <Button
					{...propsToPass}
					className={className}
					text={text}
					_text={_text}
					_icon={_icon}
					rightIcon={closeBtn}
					action="none"
					variant="none"
				/>;
	}

	return tab;
}
