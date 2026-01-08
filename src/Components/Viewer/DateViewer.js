import DisplayField from '../Form/Field/DisplayField.js';
import clsx from 'clsx';
import {
	MOMENT_DATE_FORMAT_4,
} from '../../Constants/Dates';

export default function DateViewer(props) {
	const {
			moment,
		} = props;
	if (!moment || !moment.isValid()) {
		return null;
	}
	let className = clsx(
		'flex-none',
	);
	if (props.className) {
		className += ' ' + props.className;
	}
	return <DisplayField
				text={moment.format(MOMENT_DATE_FORMAT_4)}
				{...props}
				className={className}
			/>;
}