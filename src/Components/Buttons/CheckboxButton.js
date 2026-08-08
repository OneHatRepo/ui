import IconButton from './IconButton.js';
import SquareCheck from '../Icons/SquareCheck.js';
import Square from '../Icons/Square.js';
import clsx from 'clsx';

export default function CheckboxButton(props) {
	const {
			isChecked,
		} = props,
		className = clsx(
			'CheckboxButton',
			'text-primary-500',
			props.className,
		);

	return <IconButton
				icon={isChecked ? SquareCheck : Square }
				{...props}
				className={className}
			/>;
}

