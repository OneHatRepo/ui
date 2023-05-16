import IconButton from './IconButton.js';
import SquareCheck from '../Icons/SquareCheck.js';
import Square from '../Icons/Square.js';

export default function CheckboxButton(props) {
	const {
			isChecked,
		} = props;

	return <IconButton
				icon={isChecked ? SquareCheck : Square }
				{...props}
			/>;
}

