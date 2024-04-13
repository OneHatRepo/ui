import IconButton from './IconButton.js';
import Plus from '../Icons/Plus.js';
import Minus from '../Icons/Minus.js';
import _ from 'lodash';

export default function ExpandButton(props) {
	const {
			isExpanded = false,
			onToggle,
		} = props;

	return <IconButton
				icon={isExpanded ? Minus : Plus}
				onPress={onToggle}
				{...props}
			/>;
};
