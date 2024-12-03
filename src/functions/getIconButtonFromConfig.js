import IconButton from '../Components/Buttons/IconButton.js';
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
			className: `
				mx-1
				px-3
				self-center
			`,
		},
		_icon = {
			size: styles.TOOLBAR_ITEMS_ICON_SIZE,
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
