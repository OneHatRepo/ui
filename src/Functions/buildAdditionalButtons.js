import Button from '../Components/Buttons/Button.js';
import testProps from './testProps.js';
import _ from 'lodash';

export default function buildAdditionalButtons(configs, self, handlerArgs = {}) {
	const additionalButtons = [];
	_.each(configs, (config) => {
		const {
				key,
				color = '#fff',
				...configToPass
			} = config,
			buttonProps = {
				...configToPass,
			};
			buttonProps.parent = config.self;
			buttonProps.color = color;

		if (!config.onPress && config.handler) {
			buttonProps.onPress = () => config.handler(handlerArgs);
		}
		
		additionalButtons.push(<Button
			{...testProps(key)}
			{...buttonProps}
			key={key}
		/>);
	});
	return additionalButtons;
}