import {
	HStack,
	Icon,
	Text,
	VStack,
} from '@project-components/Gluestack';
import {
	SCREEN_MODES__FULL,
	SCREEN_MODES__SIDE,
} from '../../Constants/ScreenModes.js'
import FullWidth from '../Icons/FullWidth';
import SideBySide from '../Icons/SideBySide';
import UiGlobals from '../../UiGlobals.js';
import IconButton from '../Buttons/IconButton';
import testProps from '../../Functions/testProps.js';
import _ from 'lodash';

export default function ScreenHeader(props) {
	const {
			title,
			icon,
			useModeIcons = false,
			allowSideBySide = false,
			actualMode,
			onFullWidth,
			onSideBySide,
		} = props,
		textProps = {},
		styles = UiGlobals.styles;
	if (styles.MANAGER_SCREEN_TITLE) {
		textProps.style = {
			fontFamily: styles.MANAGER_SCREEN_TITLE,
		};
	}
	return <HStack className="ScreenHeader-HStack h-[80px] items-center border-b-[2px] border-b-[#ccc]">
				{icon &&
					<Icon
						as={icon}
						className={`
							ml-5
							text-black
						`}
						size="xl"
					/>}
				<Text {...textProps} className="ScreenHeader-Text pl-4 text-[26px] font-[700]">{title}</Text>
				{useModeIcons && allowSideBySide &&
					<>
						<IconButton
							{...testProps('fullModeBtn')}
							icon={FullWidth}
							_icon={{
								size: 'xl',
								className: 'text-black',
							}}
							isDisabled={actualMode === SCREEN_MODES__FULL}
							onPress={onFullWidth}
							tooltip="To full width"
							className="ml-5"
						/>
						<IconButton
							{...testProps('sideModeBtn')}
							icon={SideBySide}
							_icon={{
								size: 'xl',
								className: 'text-black',
							}}
							isDisabled={actualMode === SCREEN_MODES__SIDE}
							onPress={onSideBySide}
							tooltip="To side editor"
						/>
					</>}
			</HStack>;
}