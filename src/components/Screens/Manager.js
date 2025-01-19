import {
	HStack,
	Icon,
	Text,
	VStackNative,
} from '@project-components/Gluestack';
import React, { useState, useEffect, } from 'react';
import withComponent from '../Hoc/withComponent.js';
import testProps from '../../Functions/testProps.js';
import UiGlobals from '../../UiGlobals.js';
import IconButton from '../Buttons/IconButton';
import FullWidth from '../Icons/FullWidth';
import SideBySide from '../Icons/SideBySide';
import getSaved from '../../Functions/getSaved.js';
import setSaved from '../../Functions/setSaved.js';
import _ from 'lodash';

const
	MODE_FULL = 'MODE_FULL',
	MODE_SIDE = 'MODE_SIDE';

function ManagerScreen(props) {
	const {
			title,
			sideModeComponent,
			fullModeComponent,
			onChangeMode,

			// withComponent
			self,
		} = props,
		styles = UiGlobals.styles,
		id = props.id || props.self?.path,
		[isRendered, setIsRendered] = useState(false),
		[isModeSet, setIsModeSet] = useState(false),
		[allowSideBySide, setAllowSideBySide] = useState(false),
		[mode, setModeRaw] = useState(MODE_FULL),
		actualMode = (!allowSideBySide || mode === MODE_FULL) ? MODE_FULL : MODE_SIDE,
		setMode = (newMode) => {
			if (!allowSideBySide && newMode === MODE_SIDE) {
				return;
			}
			if (newMode === mode) {
				return; // no change
			}
			setModeRaw(newMode);
			if (id) {
				setSaved(id + '-mode', newMode);
			}
			if (onChangeMode) {
				onChangeMode(newMode);
			}
		},
		onLayout = (e) => {
			if (sideModeComponent) {
				const
					containerWidth = e.nativeEvent.layout.width,
					allowSideBySide = containerWidth > 600;
				setAllowSideBySide(allowSideBySide);
			}
			setIsRendered(true);
		};

	useEffect(() => {
		if (!isRendered) {
			return;
		}

		// Restore saved settings
		(async () => {
			if (id) {
				const
					key = id + '-mode',
					val = await getSaved(key);
				if (!_.isNil(val)) {
					setMode(val);
				}
			}
			setIsModeSet(true);
		})();
	}, [isRendered]);

	if (self) {
		self.mode = actualMode;
	}

	const
		whichComponent = actualMode === MODE_FULL ? fullModeComponent : sideModeComponent,
		textProps = {};
	if (styles.MANAGER_SCREEN_TITLE) {
		textProps.style = {
			fontFamily: styles.MANAGER_SCREEN_TITLE,
		};
	}

	return <VStackNative
				{...testProps(self)}
				onLayout={onLayout}
				className="max-h-screen overflow-hidden flex-1 w-full"
			>
				<HStack className="h-[80px] items-center border-b-[2px] border-b-[#ccc]">
					{props.icon ? 
						<Icon
							as={props.icon}
							className={`
								ml-5
							`}
							size="xl"
							color="#000"
						/> : null}
					<Text {...textProps} className="pl-4 text-[26px] font-[700]">{title}</Text>
					{allowSideBySide &&
						<>
							<IconButton
								{...testProps('fullModeBtn')}
								icon={FullWidth}
								_icon={{
									size: 'xl',
									className: 'text-black',
								}}
								isDisabled={actualMode === MODE_FULL}
								onPress={() => setMode(MODE_FULL)}
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
								isDisabled={actualMode === MODE_SIDE}
								onPress={() => setMode(MODE_SIDE)}
								tooltip="To side editor"
							/>
						</>}
				</HStack>
				{isRendered && isModeSet && whichComponent}
			</VStackNative>;
}

export default withComponent(ManagerScreen);