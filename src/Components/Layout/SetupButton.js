import { useSelector, useDispatch } from 'react-redux';
import {
	selectIsSetupMode,
	toggleSetupMode,
} from '@src/Models/Slices/AppSlice';
import clsx from 'clsx';
import Button from '../Buttons/Button';
import IconButton from '../Buttons/IconButton';
import Gear from '../Icons/Gear';

export default function SetupButton(props) {
	const {
			isMinimized = false,
		} = props,
		dispatch = useDispatch(),
		isSetupMode = useSelector(selectIsSetupMode),
		onPress = () => dispatch(toggleSetupMode()),
		buttonClassName = clsx(
			'SetupButton',
			isSetupMode
				? 'bg-red-500 data-[hover=true]:bg-red-600 data-[active=true]:bg-red-700'
				: 'bg-grey-100 data-[hover=true]:bg-grey-900/20 data-[active=true]:bg-grey-900/50',
		),
		textClassName = clsx(
			isSetupMode
				? 'text-white data-[hover=true]:text-white data-[active=true]:text-white'
				: 'text-black data-[hover=true]:text-black data-[active=true]:text-black',
		),
		iconClassName = clsx(
			isSetupMode ? 'fill-white' : 'fill-black',
			isSetupMode ? 'text-white' : 'text-black',
		);

	return isMinimized ? 
			<IconButton
				icon={Gear}
				_icon={{
					className: iconClassName,
				}}
				onPress={onPress}
				tooltip="Toggle Setup Mode"
				className={buttonClassName}
			/> : 
			<Button
				text={isSetupMode ? 'Exit Setup' : 'Setup'}
				icon={Gear}
				_text={{
					className: textClassName,
				}}
				_icon={{
					className: iconClassName,
				}}
				onPress={onPress}
				tooltip="Toggle Setup Mode"
				className={buttonClassName}
			/>;
};