
import {
	HStack,
	Icon,
	Text,
} from '@onehat-gluestack';
import clsx from 'clsx';
import { useSelector, useDispatch } from 'react-redux';
import {
	logout,
} from '@src/Models/Slices/AppSlice';
import {
	selectUser,
} from '../../Models/Slices/AuthSlice.js';
import testProps from '../../Functions/testProps.js';
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
				{...testProps('userIndicator')}
				onPress={() => dispatch(logout())}
				icon={isMinimized ? RightFromBracket : User}
				text={isMinimized ? null : user.full_name}
				rightIcon={isMinimized ? null : RightFromBracket}
				tooltip="Logout"
				className="UserIndicator"
				_text={{ className: 'text-black' }}
			/>;
}