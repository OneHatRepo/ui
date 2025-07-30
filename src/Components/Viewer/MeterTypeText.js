import {
	TextNative,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import UiGlobals from '../../UiGlobals';

export default function MeterTypeText(props) {
	const styles = UiGlobals.styles;

	let className = clsx(
		'Text',
		'flex-1',
		'px-3',
		'py-2',
		styles.FORM_TEXT_CLASSNAME,
	);
	if (props.className) {
		className += ' ' + props.className;
	}
	return <TextNative
				{...props}
				className={className}
			>{props.value ? 'Time (hrs)' : 'Distance (mi/km)'}</TextNative>;
};
