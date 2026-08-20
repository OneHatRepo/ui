import DisplayField from '../Form/Field/DisplayField.js';
import clsx from 'clsx';
import {
	MOMENT_DATE_FORMAT_1,
} from '../../Constants/Dates';

export default function DateTimeViewer(props) {
	const {
			moment,
		} = props;
	if (!moment || !moment.isValid()) {
		return null;
	}
	const className = clsx(
		'flex-none',
		props.className,
	);
	return <DisplayField
				text={moment.format(MOMENT_DATE_FORMAT_1)}
				{...props}
				className={className}
			/>;
}