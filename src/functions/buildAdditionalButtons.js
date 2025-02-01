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
				tooltip,
				color = '#fff',
			} = config,
			buttonProps = {
				key,
				parent: self,
				reference: key,
				text,
				icon,
				isDisabled,
				className: 'ml-2',
				tooltip,
				color,
			};
		if (handler) {
			buttonProps.onPress = () => handler(handlerArgs);
		}
		
		additionalButtons.push(<Button
			{...testProps(key)}
			{...buttonProps}
		/>);
	});
	return additionalButtons;
}