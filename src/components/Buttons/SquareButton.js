import React from 'react';
import {
	Icon,
	Pressable,
	Text,
} from 'native-base';
import IconButton from './IconButton.js';
import UiGlobals from '../../UiGlobals.js';

export default function SquareButton(props) {
	const {
			text,
			isActive = false,
			showText = true,
			activeColor,
			invertColorWhenActive = false,
			disableInteractions = false,
			fontSize = '20px',
			...propsToPass
		} = props,
		styles = UiGlobals.styles,
		bg = isActive ? activeColor || '#56a6f8' : '#fff',
		color = invertColorWhenActive && isActive ? '#fff' : '#000';

	const propsIcon = props._icon || {};
	let icon = props.icon;
	if (!icon) {
		throw Error('icon missing');
	}
	if (!text) {
		throw Error('text missing');
	}

	const
		hoverProps = {},
		pressedProps = {};
	if (!disableInteractions) {
		hoverProps.bg = styles.ICON_BUTTON_BG_HOVER;
		pressedProps.bg = styles.ICON_BUTTON_BG_PRESSED;
	}

	if (!showText) {
		return <IconButton
					icon={icon}
					borderRadius="md"
					p={2}
					_icon={{
						size: '20px',
						color,
					}}
					{...propsToPass}
					bg={bg}
				/>;
	}

	if (React.isValidElement(icon)) {
		if (!_.isEmpty(propsIcon)) {
			icon = React.cloneElement(icon, {...propsIcon});
		}
	} else {
		icon = <Icon as={icon} {...propsIcon} />;
	}

	return <Pressable
				borderRadius="md"
				flexDirection="column"
				justifyContent="center"
				alignItems="center"
				p={2}
				{...propsToPass}
				bg={bg}
				// _hover={hoverProps}
				// _pressed={pressedProps}
			>
				<Icon as={icon} color={color} size="xl" />
				<Text fontSize={fontSize} color={color}>{text}</Text>
			</Pressable>;
}

