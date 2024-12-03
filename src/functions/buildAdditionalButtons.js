import {
	Icon,
} from '@project-components/Gluestack';
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
				className: 'ml-2',
			};
		if (handler) {
			buttonProps.onPress = () => handler(handlerArgs);
		}
		if (icon) {
			buttonProps.leftIcon = <Icon as={icon} size="sm" className="text-[#fff]" />;
		}
		if (isDisabled) {
			buttonProps.isDisabled = isDisabled;
		}
		
		const button = <Button
							{...testProps('btn-' + key)}
							color={color}
							parent={self}
							reference={key}
							text={text}
							{...buttonProps}
						/>;
		additionalButtons.push(button);
	});
	return additionalButtons;
}