import {
	Button,
	ButtonText,
	Icon,
} from '@gluestack-ui/themed';
import Button from '../Components/Buttons/Button.js';
import testProps from './testProps.js';
import _ from 'lodash';

export default function buildAdditionalButtons(configs, self, handlerArgs = {}) {
	const additionalButtons = [];
	_.each(configs, (config) => {
		const {
				key,
				text,
				handler,
				icon,
				isDisabled,
				color = '#fff',
			} = config,
			buttonProps = {
				key,
				reference: key,
			};
		if (handler) {
			buttonProps.onPress = () => handler(handlerArgs);
		}
		if (icon) {
			buttonProps.leftIcon = <Icon as={icon} color="#fff" size="sm" />;
		}
		if (isDisabled) {
			buttonProps.isDisabled = isDisabled;
		}
		
		const button = <Button
							{...testProps('btn-' + key)}
							color={color}
							ml={2}
							// mb={2}
							parent={self}
							reference={key}
							{...buttonProps}
						>
							<ButtonText>{text}</ButtonText>
						</Button>;
		additionalButtons.push(button);
	});
	return additionalButtons;
}