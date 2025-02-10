import {
	Text,
} from '@project-components/Gluestack';
import UiGlobals from '../../UiGlobals';

export default function MeterTypeText(props) {
	const styles = UiGlobals.styles;

	let className = `
		Text
		flex-1
		px-3
		py-2
		${styles.FORM_TEXT_CLASSNAME}
	`;
	if (props.className) {
		className += ' ' + props.className;
	}
	return <Text
				{...props}
				className={className}
			>{props.value ? 'Time (hrs)' : 'Distance (mi/km)'}</Text>;
};
