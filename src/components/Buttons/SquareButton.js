import React from 'react';
import {
	Icon,
	Pressable,
	Text,
} from 'native-base';
import UiGlobals from '../../UiGlobals.js';

export default function SquareButton(props) {
	const {
			text,
			isActive = false,
			activeColor,
			invertColorWhenActive = false,
			disableInteractions = false,
			...propsToPass
		} = props,
		styles = UiGlobals.styles,
		color = invertColorWhenActive && isActive ? '#fff' : '#000';
	const propsIcon = props._icon || {};
	let icon = props.icon;
	if (!icon) {
		throw Error('icon missing');
	}
	if (!text) {
		throw Error('text missing');
	}
	
	if (React.isValidElement(icon)) {
		if (!_.isEmpty(propsIcon)) {
			icon = React.cloneElement(icon, {...propsIcon});
		}
	} else {
		icon = <Icon as={icon} {...propsIcon} />;
	}

	const
		hoverProps = {},
		pressedProps = {};
	if (!disableInteractions) {
		hoverProps.bg = styles.ICON_BUTTON_BG_HOVER;
		pressedProps.bg = styles.ICON_BUTTON_BG_PRESSED;
	}
	
	return <Pressable
				borderRadius="md"
				flexDirection="column"
				justifyContent="center"
				alignItems="center"
				p={2}
				{...propsToPass}
				bg={isActive ? activeColor || '#56a6f8' : '#fff'}
				// _hover={hoverProps}
				// _pressed={pressedProps}
			>
				<Icon as={icon} color={color} size="xl" />
				<Text fontSize={20} color={color}>{text}</Text>
			</Pressable>;
}

