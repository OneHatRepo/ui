import {
	Button,
	Icon,
} from 'native-base';
import _ from 'lodash';

export default function buildAdditionalButtons(configs) {
	const additionalButtons = [];
	if (configs) {
		_.each(configs, (config) => {
			const {
					key,
					text,
					handler,
					icon,
					isDisabled,
					color = '#fff',
				} = config,
				buttonProps = {};
			if (key) {
				buttonProps.key = key;
			}
			if (handler) {
				buttonProps.onPress = handler;
			}
			if (icon) {
				buttonProps.leftIcon = <Icon as={icon} color="#fff" size="sm" />;
			}
			if (isDisabled) {
				buttonProps.isDisabled = isDisabled;
			}
			
			const button = <Button
								color={color}
								ml={2}
								{...buttonProps}
							>{text}</Button>;
			additionalButtons.push(button);
		});
	}
	return additionalButtons;
}