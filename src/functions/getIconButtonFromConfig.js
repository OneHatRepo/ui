import IconButton from '../components/Buttons/IconButton.js';
import testProps from './testProps.js';
import UiGlobals from '../UiGlobals.js';

export default function getIconButtonFromConfig(config, ix, parent) {
	const
		{
			key,
			text,
			handler,
			icon = null,
			isDisabled = false,
		} = config,
		styles = UiGlobals.styles,
		iconButtonProps = {
			_hover: {
				bg: 'trueGray.400',
			},
			mx: 1,
			px: 3,
		},
		_icon = {
			alignSelf: 'center',
			size: styles.TOOLBAR_ITEMS_ICON_SIZE,
			h: 20,
			w: 20,
			color: isDisabled ? styles.TOOLBAR_ITEMS_DISABLED_COLOR : styles.TOOLBAR_ITEMS_COLOR,
		};
	return <IconButton
				{...testProps(key || 'btn-' + ix)}
				key={key || ix}
				parent={parent}
				reference={key || ix}
				onPress={(e) => handler(parent, e)}
				icon={icon}
				_icon={_icon}
				isDisabled={isDisabled}
				tooltip={text}
				{...iconButtonProps}
			/>;
}
