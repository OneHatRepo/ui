
import {
	HStack,
	Icon,
	Text,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import { useSelector, useDispatch } from 'react-redux';
import {
	logout,
	selectUser,
} from '@src/Models/Slices/AppSlice';
import IconButton from '../Buttons/IconButton';
import RightFromBracket from '../Icons/RightFromBracket';
import User from '../Icons/User';

export default function UserIndicator(props) {
	const {
			isMinimized = false,
		} = props,
		dispatch = useDispatch(),
		user = useSelector(selectUser);
	if (!user) {
		return null;
	}
	return <IconButton
				onPress={() => dispatch(logout())}
				icon={isMinimized ? RightFromBracket : User}
				text={isMinimized ? null : user.full_name}
				rightIcon={isMinimized ? null : RightFromBracket}
				tooltip="Logout"
				className="UserIndicator"
				_text={{ className: 'text-black' }}
			/>;
}