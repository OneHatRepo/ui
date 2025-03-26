import React, { useState, useEffect, } from 'react';
import {
	Column,
	Row,
	Text,
} from 'native-base';
import withComponent from '../Hoc/withComponent.js';
import testProps from '../../functions/testProps.js';
import UiGlobals from '../../UiGlobals.js';
import IconButton from '../Buttons/IconButton';
import FullWidth from '../Icons/FullWidth';
import SideBySide from '../Icons/SideBySide';
import getSaved from '../../functions/getSaved.js';
import setSaved from '../../functions/setSaved.js';
import _ from 'lodash';

const
	MODE_FULL = 'MODE_FULL',
	MODE_SIDE = 'MODE_SIDE';

function ManagerScreen(props) {
	const {
			title,
			sideModeComponent,
			fullModeComponent,

			// withComponent
			self,
		} = props,
		styles = UiGlobals.styles,
		id = props.id || props.self?.path,
		[isRendered, setIsRendered] = useState(false),
		[isModeSet, setIsModeSet] = useState(false),
		[allowSideBySide, setAllowSideBySide] = useState(false),
		[mode, setModeRaw] = useState(MODE_FULL),
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

	let whichComponent;
	if (!allowSideBySide || mode === MODE_FULL) {
		whichComponent = fullModeComponent;
	} else if (mode === MODE_SIDE) {
		whichComponent = sideModeComponent;
	}

	const textProps = {};
	if (styles.MANAGER_SCREEN_TITLE) {
		textProps.style = {
			fontFamily: styles.MANAGER_SCREEN_TITLE,
		};
	}

	return <Column {...testProps(self)} maxHeight="100vh" overflow="hidden" flex={1} w="100%" onLayout={onLayout}>
				<Row
					h="80px"
					py={2}
					borderBottomWidth={2}
					borderBottomColor="#ccc"
				>
					<Text p={4} fontSize="26" fontWeight={700} {...textProps}>{title}</Text>
					{allowSideBySide &&
						<>
							<IconButton
								{...testProps('fullModeBtn')}
								icon={FullWidth}
								_icon={{
									size: '25px',
									color: mode === MODE_FULL ? 'primary.100' : '#000',
								}}
								disabled={mode === MODE_FULL}
								onPress={() => setMode(MODE_FULL)}
								tooltip="Full Width"
							/>
							<IconButton
								{...testProps('sideModeBtn')}
								icon={SideBySide}
								_icon={{
									size: '25px',
									color: mode === MODE_SIDE ? 'primary.100' : '#000',
								}}
								disabled={mode === MODE_SIDE}
								onPress={() => setMode(MODE_SIDE)}
								tooltip="Side Editor"
							/>
						</>}
				</Row>
				{isRendered && isModeSet && whichComponent}
			</Column>;
}

export default withComponent(ManagerScreen);