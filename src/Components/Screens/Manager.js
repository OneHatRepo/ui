import {
	VStackNative,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import React, { useState, useEffect, } from 'react';
import {
	SCREEN_MODES__FULL,
	SCREEN_MODES__SIDE,
} from '../../Constants/ScreenModes.js'
import withComponent from '../Hoc/withComponent.js';
import testProps from '../../Functions/testProps.js';
import ScreenHeader from '../Layout/ScreenHeader';
import getSaved from '../../Functions/getSaved.js';
import setSaved from '../../Functions/setSaved.js';
import _ from 'lodash';

function ManagerScreen(props) {
	const {
			title,
			icon,
			sideModeComponent,
			fullModeComponent,
			onChangeMode,

			// withComponent
			self,
		} = props,
		id = props.id || props.self?.path,
		[isRendered, setIsRendered] = useState(false),
		[isModeSet, setIsModeSet] = useState(false),
		[allowSideBySide, setAllowSideBySide] = useState(false),
		[mode, setModeRaw] = useState(SCREEN_MODES__FULL),
		actualMode = (!allowSideBySide || mode === SCREEN_MODES__FULL) ? SCREEN_MODES__FULL : SCREEN_MODES__SIDE,
		setMode = (newMode) => {
			if (!allowSideBySide && newMode === SCREEN_MODES__SIDE) {
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

	const whichComponent = actualMode === SCREEN_MODES__FULL ? fullModeComponent : sideModeComponent;

	return <VStackNative
				{...testProps(self)}
				onLayout={onLayout}
				className="max-h-screen overflow-hidden flex-1 w-full"
			>
				<ScreenHeader
					title={title}
					icon={icon}
					useModeIcons={true}
					actualMode={actualMode}
					allowSideBySide={allowSideBySide}
					onFullWidth={() => setMode(SCREEN_MODES__FULL)}
					onSideBySide={() => setMode(SCREEN_MODES__SIDE)}
				/>
				{isRendered && isModeSet && whichComponent}
			</VStackNative>;
}

export default withComponent(ManagerScreen);