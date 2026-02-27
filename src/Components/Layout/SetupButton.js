import { useSelector, useDispatch } from 'react-redux';
import {
	selectIsSetupMode,
	toggleSetupMode,
} from '@src/Models/Slices/AppSlice';
import Button from '../Buttons/Button';
import IconButton from '../Buttons/IconButton';
import Gear from '../Icons/Gear';

export default function SetupButton(props) {
	const {
			isMinimized = false,
		} = props,
		dispatch = useDispatch(),
		isSetupMode = useSelector(selectIsSetupMode),
		onPress = () => dispatch(toggleSetupMode());
	return isMinimized ? 
			<IconButton
				icon={Gear}
				onPress={onPress}
				tooltip="Toggle Setup Mode"
				className="SetupButton-IconButton"
			/> : 
			<Button
				text={isSetupMode ? 'Exit Setup' : 'Setup'}
				icon={Gear}
				onPress={onPress}
				tooltip="Toggle Setup Mode"
				className="SetupButton-Button"
			/>;
};