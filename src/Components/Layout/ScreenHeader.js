import {
	HStack,
	Icon,
	Text,
	VStack,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import {
	SCREEN_MODES__FULL,
	SCREEN_MODES__SIDE,
} from '../../Constants/ScreenModes.js'
import withModal from '../Hoc/withModal.js';
import CircleQuestion from '../Icons/CircleQuestion';
import FullWidth from '../Icons/FullWidth';
import SideBySide from '../Icons/SideBySide';
import UiGlobals from '../../UiGlobals.js';
import IconButton from '../Buttons/IconButton';
import testProps from '../../Functions/testProps.js';
import _ from 'lodash';

function ScreenHeader(props) {
	const {
			title,
			icon,
			additionalButtons,
			info,
			_info = {},
			useModeIcons = false,
			allowSideBySide = false,
			actualMode,
			onFullWidth,
			onSideBySide,

			// withModal
			showModal,
			hideModal,
		} = props,
		textProps = {},
		styles = UiGlobals.styles,
		onShowInstructions = () => {
			showModal({
				title: 'Info',
				body: info,
				canClose: true,
				onCancel: hideModal,

				..._info,
			});
		};
	if (styles.MANAGER_SCREEN_TITLE) {
		textProps.style = {
			fontFamily: styles.MANAGER_SCREEN_TITLE,
		};
	}
	return <HStack className="ScreenHeader-HStack h-[80px] items-center border-b-[2px] border-b-[#ccc]">
				{icon &&
					<Icon
						as={icon}
						className={clsx(
							'ml-5',
							'text-black',
						)}
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
				{additionalButtons}
				{info && 
					<IconButton
						{...testProps('infoBtn')}
						className="ml-5"
						icon={CircleQuestion}
						_icon={{
							size: 'xl',
							className: 'text-black',
						}}
						onPress={onShowInstructions}
						tooltip="Show info"
					/>}
			</HStack>;
}

export default withModal(ScreenHeader);